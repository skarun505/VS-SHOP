import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateInvoiceNumber } from "@/lib/invoice";

export async function POST(req: Request) {
  try {
    const { orderId, action, reason, adminId = "admin" } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { unit: { include: { product: true } } },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "PAYMENT_SUBMITTED" && order.status !== "AWAITING_PAYMENT") {
      return NextResponse.json(
        { error: `Cannot perform action on order in status: ${order.status}` },
        { status: 400 }
      );
    }

    if (action === "verify") {
      const invoiceNo = generateInvoiceNumber(order.id);

      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "VERIFIED",
          verifiedBy: adminId,
          verifiedAt: new Date(),
          invoiceNo,
        },
      });

      // Mark unit as permanently SOLD
      await prisma.unit.update({
        where: { id: order.unitId },
        data: {
          status: "SOLD",
          reservedUntil: null,
        },
      });

      return NextResponse.json({ ok: true, invoiceNo, status: "VERIFIED" });
    } else if (action === "reject") {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "REJECTED",
          rejectReason: reason || "Payment not credited to bank account",
        },
      });

      // Release unit back to AVAILABLE (Section 6B.6)
      await prisma.unit.update({
        where: { id: order.unitId },
        data: {
          status: "AVAILABLE",
          reservedUntil: null,
        },
      });

      return NextResponse.json({ ok: true, status: "REJECTED" });
    } else {
      return NextResponse.json({ error: "Invalid action. Use verify or reject." }, { status: 400 });
    }
  } catch (err: any) {
    console.error("Payment verification action failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
