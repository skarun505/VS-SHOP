import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();

    if (!q || q.length < 3) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit mobile number or Order ID" },
        { status: 400 }
      );
    }

    // Extract raw digits if looking for phone number
    const digitsOnly = q.replace(/\D/g, "");
    const last10Digits = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;

    // Search conditions
    const orConditions: any[] = [
      { id: { equals: q } },
      { id: { contains: q, mode: "insensitive" } },
    ];

    if (last10Digits.length >= 6) {
      orConditions.push({
        shippingJson: { contains: last10Digits },
      });
    }

    if (q.length >= 6) {
      orConditions.push({
        utr: { equals: q, mode: "insensitive" },
      });
    }

    const orders = await prisma.order.findMany({
      where: {
        OR: orConditions,
      },
      include: {
        unit: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    // Sanitize results
    const results = orders.map((order) => {
      let shipping: any = {};
      try {
        shipping = JSON.parse(order.shippingJson);
      } catch {
        shipping = {};
      }

      let images: string[] = [];
      try {
        images = JSON.parse(order.unit.product.images);
      } catch {
        images = [];
      }

      return {
        id: order.id,
        shortId: order.id.slice(-8).toUpperCase(),
        status: order.status,
        amountPaise: order.amountPaise,
        paymentMode: order.paymentMode,
        createdAt: order.createdAt,
        customerName: shipping.name || "Customer",
        customerCity: shipping.city || "",
        customerPhoneMasked: shipping.phone
          ? shipping.phone.slice(0, 2) + "••••••" + shipping.phone.slice(-2)
          : "",
        product: {
          title: order.unit.product.title,
          brand: order.unit.product.brand,
          modelNumber: order.unit.product.modelNumber,
          category: order.unit.product.category,
          image: images[0] || "",
        },
        unit: {
          grade: order.unit.grade,
          serialMasked: "••••" + order.unit.serialOrImei.slice(-4),
        },
      };
    });

    return NextResponse.json({ orders: results });
  } catch (err: any) {
    console.error("Order lookup error:", err);
    return NextResponse.json({ error: "Failed to look up orders" }, { status: 500 });
  }
}
