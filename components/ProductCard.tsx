import React from "react";
import Link from "next/link";
import { formatINR, calculateSavingsPercent } from "@/lib/utils";
import { Star, ArrowRight, Zap, Shield } from "lucide-react";

interface ProductCardProps {
  product: {
    id: string;
    slug: string;
    title: string;
    brand: string;
    modelNumber: string;
    category: string;
    images: string;
    mrp: number;
    warrantyMonths: number;
    units: Array<{
      id: string;
      grade: string;
      pricePaise: number;
      status: string;
      batteryHealth?: number | null;
    }>;
    reviews?: Array<{
      rating: number;
    }>;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  let images: string[] = [];
  try {
    images = JSON.parse(product.images);
  } catch {
    images = [];
  }
  const mainImage =
    images[0] ||
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80";

  // Available units
  const availableUnits = product.units.filter((u) => u.status === "AVAILABLE");
  const minPrice =
    availableUnits.length > 0
      ? Math.min(...availableUnits.map((u) => u.pricePaise))
      : product.units.length > 0
      ? Math.min(...product.units.map((u) => u.pricePaise))
      : product.mrp;

  const topGrade =
    availableUnits.length > 0
      ? availableUnits[0].grade
      : product.units[0]?.grade || "A";
  const savingsPercent = calculateSavingsPercent(product.mrp, minPrice);

  const gradeLabel =
    topGrade === "A_PLUS"
      ? "Untouched Mint"
      : topGrade === "A"
      ? "Like New"
      : "Certified";

  return (
    <Link
      href={`/product/${product.slug}`}
      prefetch={true}
      className="group flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-emerald-500 transition-all duration-200 overflow-hidden active:scale-[0.98]"
    >
      {/* 1. CLEAN Product Image (Zero overlays covering the photo) */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50 dark:bg-slate-950 p-3 sm:p-5 flex items-center justify-center border-b border-slate-100 dark:border-slate-800/80">
        <img
          src={mainImage}
          alt={product.title}
          className="h-full w-full object-contain object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* 2. Product Information & Clear Buy Action */}
      <div className="flex flex-1 flex-col p-2.5 sm:p-4 justify-between space-y-2">
        <div>
          {/* Brand & Condition Pill */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] mb-1">
            <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {product.brand}
            </span>
            <span className="font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded text-[9px]">
              {gradeLabel}
            </span>
          </div>

          {/* Title (Clean 2 lines max) */}
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-emerald-600 transition-colors">
            {product.title}
          </h3>

          {/* Price row */}
          <div className="mt-1.5 flex items-baseline flex-wrap gap-1.5">
            <span className="text-base sm:text-lg font-black text-slate-950 dark:text-white font-mono">
              {formatINR(minPrice)}
            </span>
            {product.mrp > minPrice && (
              <span className="text-[11px] sm:text-xs text-slate-400 line-through">
                {formatINR(product.mrp)}
              </span>
            )}
            {savingsPercent > 0 && (
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.2 rounded">
                {savingsPercent}% OFF
              </span>
            )}
          </div>

          {/* Delivery & Warranty info */}
          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
            <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
              <Zap className="w-3 h-3 fill-emerald-600" />
              <span>Free Delivery</span>
            </span>
            <span>{product.warrantyMonths}m Warranty</span>
          </div>
        </div>

        {/* 3. PROMINENT BUY BUTTON (Impossible to miss, easy 1-tap) */}
        <div className="pt-1">
          <div className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 group-hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors">
            <span>Buy Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
