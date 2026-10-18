import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(req: Request) {
  try {
    const token = cookies().get("refurb_admin_token");
    if (!token?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "No products provided in import payload." },
        { status: 400 }
      );
    }

    const createdProducts: any[] = [];
    const errors: string[] = [];

    // Process each item in a transaction or sequential batch
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      const title = (item.title || "").trim();
      if (!title) {
        errors.push(`Row ${i + 1}: Title is required.`);
        continue;
      }

      const brand = (item.brand || "Apple").trim();
      const modelNumber = (item.modelNumber || "A-STD").trim();
      const category = (item.category || "smartphones").toLowerCase().trim();
      const mrp = Math.round(Number(item.mrpInr || item.mrp || 0) * 100);
      const warrantyMonths = Number(item.warrantyMonths || 6);
      const returnDays = Number(item.returnDays || 7);
      const description = (item.description || `${brand} ${modelNumber} in certified pristine condition.`).trim();

      // Handle images
      let imagesList: string[] = [];
      if (Array.isArray(item.images)) {
        imagesList = item.images;
      } else if (typeof item.images === "string" && item.images.trim()) {
        try {
          imagesList = JSON.parse(item.images);
        } catch {
          imagesList = item.images.split(",").map((s: string) => s.trim()).filter(Boolean);
        }
      }

      if (imagesList.length === 0) {
        imagesList = [
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80"
        ];
      }

      // Generate unique slug
      const baseSlug = slugify(`${brand}-${modelNumber}-${title}`.slice(0, 45));
      const uniqueSuffix = Math.random().toString(36).substring(2, 6);
      const slug = `${baseSlug}-${uniqueSuffix}`;

      // Handle inventory units if provided
      const priceInr = Number(item.priceInr || item.sellingPriceInr || mrp / 100);
      const pricePaise = Math.round(priceInr * 100);
      const floorPaise = Math.round(pricePaise * 0.85);
      const grade = (item.grade || "A_PLUS").toUpperCase().replace(" ", "_");

      let serials: string[] = [];
      if (Array.isArray(item.serials)) {
        serials = item.serials;
      } else if (typeof item.serialOrImeis === "string" && item.serialOrImeis.trim()) {
        serials = item.serialOrImeis.split(/[,;\n]+/).map((s: string) => s.trim()).filter(Boolean);
      } else if (typeof item.serialOrImei === "string" && item.serialOrImei.trim()) {
        serials = [item.serialOrImei.trim()];
      }

      // If count or quantity specified, ensure that many serial units are generated
      const reqCount = Math.max(1, parseInt(item.count || item.quantity || "1", 10));
      if (serials.length === 0) {
        serials = Array.from({ length: reqCount }).map(
          (_, idx) => `SN-${Date.now().toString().slice(-6)}-${i + 1}-${idx + 1}`
        );
      } else {
        while (serials.length < reqCount) {
          serials.push(`SN-${Date.now().toString().slice(-6)}-${i + 1}-${serials.length + 1}`);
        }
      }

      try {
        const product = await prisma.product.create({
          data: {
            slug,
            title,
            brand,
            modelNumber,
            category,
            description,
            images: JSON.stringify(imagesList),
            mrp: mrp > 0 ? mrp : pricePaise * 1.3,
            warrantyMonths,
            returnDays,
            units: {
              create: serials.map((sn) => ({
                serialOrImei: sn,
                grade: grade === "A+" ? "A_PLUS" : grade,
                source: "OFFICIAL_OEM_PARTNER",
                costPaise: Math.round(pricePaise * 0.7),
                pricePaise,
                floorPaise,
                status: "AVAILABLE",
                batteryHealth: Number(item.batteryHealth || 95),
                repairNotes: item.repairNotes || "100% Factory Pass. 0 Marks.",
              })),
            },
          },
          include: {
            units: true,
          },
        });

        createdProducts.push(product);
      } catch (err: any) {
        console.error(`Failed to create product row ${i + 1}:`, err);
        errors.push(`Row ${i + 1} (${title}): ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      importedCount: createdProducts.length,
      totalRequested: items.length,
      errors: errors.length > 0 ? errors : undefined,
      products: createdProducts,
    });
  } catch (err: any) {
    console.error("Bulk import API error:", err);
    return NextResponse.json({ error: err.message || "Failed to process bulk import" }, { status: 500 });
  }
}
