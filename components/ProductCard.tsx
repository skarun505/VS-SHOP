import React from "react";
import Link from "next/link";
import { ConditionBadge } from "./ConditionBadge";
import { formatINR, calculateSavingsPercent } from "@/lib/utils";
import { Shield, Sparkles, Star, Zap, ArrowRight } from "lucide-react";

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
  const savingsRupees = Math.max(0, (product.mrp - minPrice) / 100);

  // Ratings calculation
  const reviewCount = product.reviews?.length || 18;
  const avgRating =
    product.reviews && product.reviews.length > 0
      ? (product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length).toFixed(1)
      : "4.8";

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group relative flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-emerald-500/50 transition-all duration-300 overflow-hidden active:scale-[0.98]"
    >
      {/* Media Image Area (Amazon / Flipkart card style) */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50 dark:bg-slate-950 p-2 sm:p-5 flex items-center justify-center border-b border-slate-100 dark:border-slate-800/80">
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

        {/* Savings Ribbon on top left (Amazon / Zepto style) */}
        {savingsPercent > 0 && (
          <div className="absolute top-2 left-2 bg-rose-600 text-white font-black text-[9px] sm:text-xs px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span>{savingsPercent}% OFF</span>
          </div>
        )}

        {/* Stock / Fast Dispatch indicator */}
        <div className="absolute bottom-1.5 left-2 flex items-center gap-1">
          {availableUnits.length > 0 ? (
            <span className="text-[8px] sm:text-[9px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50/95 dark:bg-emerald-950/95 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5 fill-emerald-600" />
              <span>{availableUnits.length} Left</span>
            </span>
          ) : (
            <span className="text-[8px] sm:text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
              Sold Out
            </span>
          )}
        </div>
      </div>

      {/* Card Info */}
      <div className="flex flex-1 flex-col p-2.5 sm:p-4 justify-between space-y-1.5">
        <div>
          {/* Brand & Model */}
          <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5 flex items-center justify-between">
            <span className="font-bold text-emerald-600">{product.brand}</span>
            <span className="font-mono text-slate-400 text-[9px] sm:text-[10px] truncate max-w-[70px]">
              {product.modelNumber}
            </span>
          </div>

          {/* Product Title */}
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-emerald-600 transition-colors">
            {product.title}
          </h3>

          {/* Flipkart / Amazon Star Rating */}
          <div className="flex items-center gap-1 pt-1">
            <div className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-emerald-600 text-white text-[9px] font-black">
              <span>{avgRating}</span>
              <Star className="w-2.5 h-2.5 fill-white" />
            </div>
            <span className="text-[9px] text-slate-400">({reviewCount})</span>
          </div>
        </div>

        <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 space-y-1">
          {/* Price & MRP (Amazon / Flipkart layout) */}
          <div className="flex items-baseline flex-wrap gap-1">
            <span className="text-sm sm:text-base lg:text-lg font-black text-slate-900 dark:text-slate-100 font-mono">
              {formatINR(minPrice)}
            </span>
            {product.mrp > minPrice && (
              <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                {formatINR(product.mrp)}
              </span>
            )}
          </div>

          {/* Savings in Rupees */}
          {savingsRupees > 0 && (
            <div className="text-[9px] sm:text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              Save ₹{savingsRupees.toLocaleString("en-IN")}
            </div>
          )}

          {/* Zepto / Amazon Prime Fast Delivery Badge */}
          <div className="text-[9px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
            <span className="text-emerald-600 font-bold">⚡ FREE</span>
            <span>Delivery Tomorrow</span>
          </div>

          {/* Mobile View / Buy Deal Button */}
          <div className="pt-1">
            <button
              type="button"
              className="w-full py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-emerald-600 dark:bg-slate-800 dark:hover:bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-xs transition-colors"
            >
              <span>View Deal</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
