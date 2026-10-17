import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { suggestPrice } from "@/lib/pricing";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      productId,
      serialOrImei,
      grade,
      source,
      costPaise,
      pricePaise,
      repairNotes,
      batteryHealth,
      repairPhotos,
    } = body;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Auto calculate suggested price & margin floor (Phase 3 requirement)
    const { floor } = suggestPrice(product.mrp, grade, costPaise);

    // BLOCK saving if price is below floor (Phase 3 requirement)
    if (pricePaise < floor) {
      return NextResponse.json(
        {
          error: `Price rejection: Proposed price (₹${pricePaise / 100}) is below the mandatory 12% margin floor (₹${floor / 100}). Minimum allowed price is ₹${floor / 100}.`,
        },
        { status: 400 }
      );
    }

    // Check duplicate serial/IMEI
    const dup = await prisma.unit.findUnique({
      where: { serialOrImei },
    });
    if (dup) {
      return NextResponse.json(
        { error: `Serial/IMEI '${serialOrImei}' is already registered in the system.` },
        { status: 409 }
      );
    }

    const unit = await prisma.unit.create({
      data: {
        productId,
        serialOrImei,
        grade,
        source: source || "REFURBISHED",
        costPaise,
        pricePaise,
        floorPaise: floor,
        repairNotes,
        batteryHealth: batteryHealth ? parseInt(batteryHealth, 10) : null,
        repairPhotos: repairPhotos ? JSON.stringify(repairPhotos) : null,
        status: "AVAILABLE",
      },
    });

    return NextResponse.json({ ok: true, unit });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, pricePaise, costPaise, grade, status, repairNotes, batteryHealth } = body;

    const unit = await prisma.unit.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    const activeCost = costPaise ?? unit.costPaise;
    const activeGrade = grade ?? unit.grade;
    const { floor } = suggestPrice(unit.product.mrp, activeGrade, activeCost);

    if (pricePaise !== undefined && pricePaise < floor) {
      return NextResponse.json(
        {
          error: `Price rejection: Cannot set price below margin floor of ₹${floor / 100}.`,
        },
        { status: 400 }
      );
    }

    const updated = await prisma.unit.update({
      where: { id },
      data: {
        ...(pricePaise !== undefined && { pricePaise }),
        ...(costPaise !== undefined && { costPaise, floorPaise: floor }),
        ...(grade && { grade }),
        ...(status && { status }),
        ...(repairNotes !== undefined && { repairNotes }),
        ...(batteryHealth !== undefined && { batteryHealth: parseInt(batteryHealth, 10) }),
      },
    });

    return NextResponse.json({ ok: true, unit: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing unit ID" }, { status: 400 });
    }

    const orderCount = await prisma.order.count({ where: { unitId: id } });
    if (orderCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete unit that already has orders associated with it." },
        { status: 400 }
      );
    }

    await prisma.unit.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
