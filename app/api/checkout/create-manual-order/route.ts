import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reserveUnit } from "@/lib/inventory";
import { applyExitOffer } from "@/lib/pricing";
import { buildUpiLink, buildSpecificUpiLinks, generateUpiQrCode } from "@/lib/upi";

export async function POST(req: Request) {
  try {
    const { unitId, userId = "guest", shipping, couponCode } = await req.json();

    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      include: { product: true },
    });

    if (!unit) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!(await reserveUnit(unitId, 30))) {
      return NextResponse.json({ error: "Just sold" }, { status: 409 });
    }

    let amount = unit.pricePaise;
    let discount = 0;

    if (couponCode === "EXIT5") {
      const r = applyExitOffer(unit.pricePaise, unit.floorPaise, 5);
      if (r.ok) {
        discount = unit.pricePaise - r.discounted;
        amount = r.discounted;
      }
    }

    const order = await prisma.order.create({
      data: {
        userId,
        unitId,
        amountPaise: amount,
        discountPaise: discount,
        couponCode: discount ? couponCode : null,
        shippingJson: JSON.stringify(shipping || {}),
        paymentMode: "MANUAL_UPI",
        status: "AWAITING_PAYMENT",
      },
    });

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

    const qrCode = await generateUpiQrCode(upiLink);

    return NextResponse.json({
      orderId: order.id,
      amount,
      upiLink,
      qrCode,
      vpa,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
