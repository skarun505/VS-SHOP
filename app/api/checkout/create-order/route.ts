import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { reserveUnit } from "@/lib/inventory";
import { applyExitOffer } from "@/lib/pricing";
import { buildUpiLink, buildSpecificUpiLinks, generateUpiQrCode } from "@/lib/upi";
import Razorpay from "razorpay";

const checkoutSchema = z.object({
  unitId: z.string().min(1, "Unit ID is required"),
  userId: z.string().default("guest"),
  couponCode: z.string().optional().nullable(),
  shipping: z.object({
    name: z.string().min(2, "Full name is required"),
    phone: z.string().regex(/^[6-9]\d{9}$/, "Valid 10-digit Indian phone number is required"),
    address: z.string().min(5, "Complete street address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    pincode: z.string().regex(/^\d{6}$/, "Valid 6-digit postal pincode is required"),
  }),
});

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const parsed = checkoutSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input data" },
        { status: 400 }
      );
    }

    const { unitId, userId, shipping, couponCode } = parsed.data;

    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      include: { product: true },
    });

    if (!unit) {
      return NextResponse.json({ error: "Product unit not found" }, { status: 404 });
    }

    if (unit.status === "SOLD") {
      return NextResponse.json(
        { error: "This unique item has already been purchased. Please select another unit." },
        { status: 410 }
      );
    }

    const isManualMode = (process.env.PAYMENT_MODE || "manual").toLowerCase() === "manual";
    const reservationMinutes = isManualMode ? 30 : 10;

    // 1. Reserve unit atomically
    const reserved = await reserveUnit(unitId, reservationMinutes);
    if (!reserved) {
      return NextResponse.json(
        { error: "Unit is currently in another checkout session or just sold. Try another unit." },
        { status: 409 }
      );
    }

    // 2. Pricing and coupon calculation
    let amount = unit.pricePaise;
    let discount = 0;

    if (couponCode === "EXIT5") {
      const coupon = await prisma.coupon.findUnique({ where: { code: "EXIT5" } });
      if (coupon && coupon.active && coupon.used < coupon.maxUses) {
        // Enforce margin floor check (Section 5.1 & 7)
        const offerResult = applyExitOffer(unit.pricePaise, unit.floorPaise, coupon.percentOff);
        if (offerResult.ok) {
          discount = offerResult.savingsPaise;
          amount = offerResult.discounted;
        }
      }
    }

    // 3. Create or update order record
    // If an existing pending order exists for this unit, we reuse/update it
    let order = await prisma.order.findUnique({
      where: { unitId },
    });

    if (order && (order.status === "AWAITING_PAYMENT" || order.status === "PENDING")) {
      order = await prisma.order.update({
        where: { id: order.id },
        data: {
          userId,
          amountPaise: amount,
          discountPaise: discount,
          couponCode: discount > 0 ? couponCode : null,
          shippingJson: JSON.stringify(shipping),
          paymentMode: isManualMode ? "MANUAL_UPI" : "RAZORPAY",
        },
      });
    } else {
      order = await prisma.order.create({
        data: {
          userId,
          unitId,
          amountPaise: amount,
          discountPaise: discount,
          couponCode: discount > 0 ? couponCode : null,
          shippingJson: JSON.stringify(shipping),
          paymentMode: isManualMode ? "MANUAL_UPI" : "RAZORPAY",
          status: isManualMode ? "AWAITING_PAYMENT" : "PENDING",
        },
      });
    }

    // 4. Branch based on Payment Mode (Section 6 vs Section 6B)
    if (isManualMode) {
      const vpa = process.env.MERCHANT_VPA || "6380640087@upi";
      const payeeName = process.env.MERCHANT_NAME || "PristineTech Labs";

      const shortOrderId = order.id.slice(-8).toUpperCase();
      const upiLink = buildUpiLink({
        vpa,
        payeeName,
        amountPaise: amount,
        orderId: shortOrderId,
        productTitle: unit.product.title,
      });

      const appLinks = buildSpecificUpiLinks({
        vpa,
        payeeName,
        amountPaise: amount,
        orderId: shortOrderId,
        productTitle: unit.product.title,
      });

      const qrCode = await generateUpiQrCode(upiLink);

      return NextResponse.json({
        mode: "manual",
        orderId: order.id,
        shortOrderId,
        amount,
        vpa,
        payeeName,
        upiLink,
        appLinks,
        qrCode,
        productTitle: unit.product.title,
        grade: unit.grade,
        serialOrImei: unit.serialOrImei,
      });
    } else {
      // Razorpay mode (Section 6.2)
      const rzpKey = process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder";
      const rzpSecret = process.env.RAZORPAY_KEY_SECRET || "rzp_secret_placeholder";

      const rzp = new Razorpay({
        key_id: rzpKey,
        key_secret: rzpSecret,
      });

      const rzpOrder = await rzp.orders.create({
        amount,
        currency: "INR",
        receipt: order.id,
        notes: {
          product: unit.product.title,
          grade: unit.grade,
          serial: unit.serialOrImei,
          order_id: order.id,
        },
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { rzpOrderId: rzpOrder.id },
      });

      return NextResponse.json({
        mode: "razorpay",
        orderId: order.id,
        rzpOrderId: rzpOrder.id,
        amount,
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || rzpKey,
        description: `${unit.product.title} (Grade ${unit.grade})`,
      });
    }
  } catch (err: any) {
    console.error("Order creation failed:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to initiate checkout order" },
      { status: 500 }
    );
  }
}
