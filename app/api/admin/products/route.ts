import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        units: true,
        _count: {
          select: {
            units: true,
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ok: true, products });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      slug,
      brand,
      modelNumber,
      category,
      description,
      images,
      mrpInr,
      sellingPriceInr,
      stockCount = 1,
      conditionGrade = "A_PLUS",
      warrantyMonths = 6,
      returnDays = 7,
    } = body;

    if (!title || !brand || !category || !mrpInr) {
      return NextResponse.json(
        { error: "Title, Brand, Category, and MRP are required." },
        { status: 400 }
      );
    }

    // Auto-generate clean slug if not given
    const cleanSlug = (slug || `${title}-${modelNumber || ""}-${Date.now().toString().slice(-4)}`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const existing = await prisma.product.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Product with slug '${cleanSlug}' already exists. Please choose another.` },
        { status: 409 }
      );
    }

    // Parse images array or string
    let parsedImages = "[]";
    if (Array.isArray(images)) {
      parsedImages = JSON.stringify(images.filter(Boolean));
    } else if (typeof images === "string" && images.trim()) {
      const urls = images
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      parsedImages = JSON.stringify(urls);
    }

    const mrpPaise = Math.round(parseFloat(mrpInr) * 100);
    const quantity = Math.max(1, parseInt(stockCount || "1", 10));
    const sellingPricePaise = sellingPriceInr
      ? Math.round(parseFloat(sellingPriceInr) * 100)
      : Math.round(mrpPaise * 0.75);
    const floorPaise = Math.round(sellingPricePaise * 0.85);
    const grade = (conditionGrade || "A_PLUS").toUpperCase().replace(" ", "_");

    const product = await prisma.product.create({
      data: {
        title,
        slug: cleanSlug,
        brand,
        modelNumber: modelNumber || "STD-01",
        category,
        description: description || `${title} certified hardware. 100% factory verified.`,
        images: parsedImages,
        mrp: mrpPaise,
        warrantyMonths: parseInt(warrantyMonths, 10) || 6,
        returnDays: parseInt(returnDays, 10) || 7,
        units: {
          create: Array.from({ length: quantity }).map((_, idx) => ({
            serialOrImei: `SN-${Date.now().toString().slice(-6)}-${idx + 1}`,
            grade: grade === "A+" ? "A_PLUS" : grade,
            source: "OFFICIAL_OEM_PARTNER",
            costPaise: Math.round(sellingPricePaise * 0.7),
            pricePaise: sellingPricePaise,
            floorPaise,
            status: "AVAILABLE",
            batteryHealth: 98,
            repairNotes: "100% Factory Pass. 0 Marks.",
          })),
        },
      },
      include: {
        units: true,
      },
    });

    return NextResponse.json({ ok: true, product });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      title,
      brand,
      modelNumber,
      category,
      description,
      images,
      mrpInr,
      sellingPriceInr,
      addStockCount,
      conditionGrade,
      warrantyMonths,
      returnDays,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
    }

    const dataToUpdate: any = {};
    if (title) dataToUpdate.title = title;
    if (brand) dataToUpdate.brand = brand;
    if (modelNumber) dataToUpdate.modelNumber = modelNumber;
    if (category) dataToUpdate.category = category;
    if (description !== undefined) dataToUpdate.description = description;
    if (mrpInr !== undefined) dataToUpdate.mrp = Math.round(parseFloat(mrpInr) * 100);
    if (warrantyMonths !== undefined) dataToUpdate.warrantyMonths = parseInt(warrantyMonths, 10);
    if (returnDays !== undefined) dataToUpdate.returnDays = parseInt(returnDays, 10);

    if (images !== undefined) {
      if (Array.isArray(images)) {
        dataToUpdate.images = JSON.stringify(images.filter(Boolean));
      } else if (typeof images === "string") {
        const urls = images
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
        dataToUpdate.images = JSON.stringify(urls);
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: dataToUpdate,
    });

    // Add extra stock units if requested
    if (addStockCount && parseInt(addStockCount, 10) > 0) {
      const addQty = parseInt(addStockCount, 10);
      const addPricePaise = sellingPriceInr
        ? Math.round(parseFloat(sellingPriceInr) * 100)
        : Math.round((updated.mrp || 500000) * 0.75);
      const floorPaise = Math.round(addPricePaise * 0.85);
      const grade = (conditionGrade || "A_PLUS").toUpperCase().replace(" ", "_");

      await prisma.unit.createMany({
        data: Array.from({ length: addQty }).map((_, idx) => ({
          productId: id,
          serialOrImei: `SN-${Date.now().toString().slice(-6)}-${idx + 1}`,
          grade: grade === "A+" ? "A_PLUS" : grade,
          source: "OFFICIAL_OEM_PARTNER",
          costPaise: Math.round(addPricePaise * 0.7),
          pricePaise: addPricePaise,
          floorPaise,
          status: "AVAILABLE",
          batteryHealth: 98,
          repairNotes: "100% Factory Pass. 0 Marks.",
        })),
      });
    }

    return NextResponse.json({ ok: true, product: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
    }

    // Delete associated units first if necessary
    await prisma.unit.deleteMany({
      where: { productId: id },
    });

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true, message: "Product and associated units deleted." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
