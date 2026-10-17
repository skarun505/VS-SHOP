import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  utr: z
    .string()
    .trim()
    .regex(/^\d{12}$/, "UTR must be exactly 12 numeric digits (from your UPI/Bank app)"),
  payerName: z.string().trim().min(2, "Payer name must be at least 2 characters"),
  screenshotUrl: z.string().url().optional().or(z.literal("")),
});

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const body = schema.safeParse(raw);

    if (!body.success) {
      return NextResponse.json(
        { error: body.error.issues[0]?.message || "Invalid UTR submission" },
        { status: 400 }
      );
    }

    const { orderId, utr, payerName, screenshotUrl } = body.data;

    // 1. Check if UTR has already been submitted on any order (Unique UTR protection)
    const existingUtr = await prisma.order.findUnique({
      where: { utr },
    });

    if (existingUtr && existingUtr.id !== orderId) {
      return NextResponse.json(
        { error: "This 12-digit UTR has already been registered on another order. Each transaction reference can only be claimed once." },
        { status: 409 }
      );
    }

    // 2. Fetch the target order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { unit: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "AWAITING_PAYMENT" && order.status !== "PAYMENT_SUBMITTED") {
      return NextResponse.json(
        { error: `Order cannot accept UTR submission in its current status: ${order.status}` },
        { status: 400 }
      );
    }

    // 3. Update order state to PAYMENT_SUBMITTED
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        utr,
        payerName,
        screenshotUrl: screenshotUrl || null,
        status: "PAYMENT_SUBMITTED",
        utrSubmittedAt: new Date(),
      },
    });

    // 4. Extend hold to 12 hours while admin verifies bank credit (Section 6B.5)
    await prisma.unit.update({
      where: { id: order.unitId },
      data: {
        status: "RESERVED",
        reservedUntil: new Date(Date.now() + 12 * 3600_000),
      },
    });

    return NextResponse.json({
      ok: true,
      orderId: updatedOrder.id,
      status: "PAYMENT_SUBMITTED",
      message: "UTR registered successfully. Your unit is reserved for 12 hours while our team verifies the bank credit.",
    });
  } catch (err: any) {
    console.error("UTR submission error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to process UTR submission" },
      { status: 500 }
    );
  }
}
