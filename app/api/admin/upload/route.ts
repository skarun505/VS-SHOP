import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ ok: false, error: "No file provided" }, { status: 400 });
    }

    // Validate mime type
    const validMimes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!validMimes.includes(file.type)) {
      return NextResponse.json(
        { ok: false, error: `Unsupported image format: ${file.type}. Please use JPG, PNG, WEBP, or GIF.` },
        { status: 400 }
      );
    }

    // Max 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { ok: false, error: "Image size exceeds 10MB limit." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const cleanBaseName = file.name
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .slice(0, 30);
    const uniqueFileName = `${Date.now()}-${cleanBaseName}.${fileExtension}`;

    // 1. Upload to Supabase Storage
    try {
      const { data, error } = await supabase.storage
        .from("product-images")
        .upload(uniqueFileName, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (!error && data) {
        const { data: publicData } = supabase.storage
          .from("product-images")
          .getPublicUrl(uniqueFileName);

        return NextResponse.json({
          ok: true,
          url: publicData.publicUrl,
          fileName: uniqueFileName,
          size: file.size,
          storage: "supabase",
        });
      }

      console.warn("Supabase storage upload returned error, falling back:", error);
    } catch (storageErr) {
      console.warn("Supabase storage upload exception, falling back:", storageErr);
    }

    // 2. Base64 fallback (guarantees upload never fails even offline)
    const base64Data = `data:${file.type};base64,${buffer.toString("base64")}`;
    return NextResponse.json({
      ok: true,
      url: base64Data,
      fileName: uniqueFileName,
      size: file.size,
      storage: "data-uri",
    });
  } catch (err: any) {
    console.error("Image upload API error:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to process image upload" },
      { status: 500 }
    );
  }
}
