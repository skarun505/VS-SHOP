import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    const secret = process.env.RAZORPAY_KEY_SECRET || "rzp_secret_placeholder";
    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const valid = expected === razorpay_signature;

    if (valid) {
      const order = await prisma.order.findUnique({
        where: { rzpOrderId: razorpay_order_id },
      });

      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: "PAID",
            rzpPaymentId: razorpay_payment_id,
          },
        });

        await prisma.unit.update({
          where: { id: order.unitId },
          data: {
            status: "SOLD",
            reservedUntil: null,
          },
        });
      }
    }

    return NextResponse.json({ valid });
  } catch (err: any) {
    console.error("Razorpay verification failed:", err);
    return NextResponse.json({ valid: false, error: err.message }, { status: 400 });
  }
}
