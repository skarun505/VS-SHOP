import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const raw = await req.text(); // must be raw text body
    const sig = req.headers.get("x-razorpay-signature") || "";
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

    if (!secret) {
      console.warn("RAZORPAY_WEBHOOK_SECRET is not configured");
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }

    const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");

    const sigBuffer = Buffer.from(sig);
    const expectedBuffer = Buffer.from(expected);

    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      return NextResponse.json({ error: "bad signature" }, { status: 400 });
    }

    const event = JSON.parse(raw);

    if (event.event === "payment.captured") {
      const p = event.payload.payment.entity;
      const order = await prisma.order.findUnique({
        where: { rzpOrderId: p.order_id },
      });

      if (order && order.status !== "PAID") {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "PAID", rzpPaymentId: p.id },
        });
        await prisma.unit.update({
          where: { id: order.unitId },
          data: { status: "SOLD", reservedUntil: null },
        });
      }
    }

    if (event.event === "payment.failed") {
      const p = event.payload.payment.entity;
      const order = await prisma.order.findUnique({
        where: { rzpOrderId: p.order_id },
      });

      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "FAILED" },
        });
        await prisma.unit.update({
          where: { id: order.unitId },
          data: { status: "AVAILABLE", reservedUntil: null },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
