import React from "react";
import Link from "next/link";
import { ConditionBadge } from "./ConditionBadge";
import { formatINR, calculateSavingsPercent } from "@/lib/utils";
import { Shield, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

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

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group relative flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-emerald-500/50 transition-all duration-300 overflow-hidden active:scale-[0.98]"
    >
      {/* Media Image Area (Amazon / Flipkart card style) */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50 dark:bg-slate-950 p-2.5 sm:p-5 flex items-center justify-center border-b border-slate-100 dark:border-slate-800/80">
        <img
          src={mainImage}
          alt={product.title}
          className="h-full w-full object-contain object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Condition Grade Badge on top right */}
        <div className="absolute top-2 right-2 scale-85 sm:scale-100 origin-top-right">
          <ConditionBadge grade={topGrade} size="sm" />
        </div>

        {/* Savings Ribbon on top left */}
        {savingsPercent > 0 && (
          <div className="absolute top-2 left-2 bg-emerald-600 text-white font-black text-[9px] sm:text-xs px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span>{savingsPercent}% OFF</span>
          </div>
        )}

        {/* Stock status indicator */}
        <div className="absolute bottom-1.5 left-2">
          {availableUnits.length > 0 ? (
            <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50/90 dark:bg-emerald-950/90 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              {availableUnits.length} in stock
            </span>
          ) : (
            <span className="text-[9px] sm:text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
              Out of stock
            </span>
          )}
        </div>
      </div>

      {/* Card Info */}
      <div className="flex flex-1 flex-col p-2.5 sm:p-4 justify-between space-y-2">
        <div>
          <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5 flex items-center justify-between">
            <span className="font-bold text-emerald-600">{product.brand}</span>
            <span className="font-mono text-slate-400 text-[9px] sm:text-[10px] truncate max-w-[80px]">
              {product.modelNumber}
            </span>
          </div>

          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-emerald-600 transition-colors">
            {product.title}
          </h3>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
          {/* Price & MRP */}
          <div className="flex items-baseline flex-wrap gap-1 sm:gap-2">
            <span className="text-sm sm:text-base lg:text-lg font-black text-slate-900 dark:text-slate-100 font-mono">
              {formatINR(minPrice)}
            </span>
            {product.mrp > minPrice && (
              <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                {formatINR(product.mrp)}
              </span>
            )}
          </div>

          {/* Micro trust indicators */}
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-500 pt-0.5">
            <span className="flex items-center gap-1 font-medium">
              <Shield className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>{product.warrantyMonths}m Warranty</span>
            </span>
            <span className="text-emerald-600 font-bold hidden sm:inline-flex items-center gap-0.5">
              <span>View</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          {/* Mobile Instant Buy Button */}
          <button
            type="button"
            className="w-full sm:hidden py-1.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-xs transition-colors mt-1"
          >
            <span>View Deal</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </Link>
  );
}
