import React from "react";
import Link from "next/link";
import { ConditionBadge } from "./ConditionBadge";
import { formatINR, calculateSavingsPercent } from "@/lib/utils";
import { Shield, Sparkles } from "lucide-react";

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
  const mainImage = images[0] || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80";

  // Available units
  const availableUnits = product.units.filter((u) => u.status === "AVAILABLE");
  const minPrice = availableUnits.length > 0
    ? Math.min(...availableUnits.map((u) => u.pricePaise))
    : (product.units.length > 0 ? Math.min(...product.units.map(u => u.pricePaise)) : product.mrp);

  const topGrade = availableUnits.length > 0 ? availableUnits[0].grade : (product.units[0]?.grade || "A");
  const savingsPercent = calculateSavingsPercent(product.mrp, minPrice);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group relative flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-lg hover:border-emerald-500/50 transition-all duration-300 overflow-hidden"
    >
      {/* Top Media area */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-950 p-6 flex items-center justify-center">
        <img
          src={mainImage}
          alt={product.title}
          className="h-full w-full object-contain object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Condition Grade Badge on top right */}
        <div className="absolute top-3 right-3">
          <ConditionBadge grade={topGrade} size="sm" />
        </div>

        {/* Savings Ribbon on top left */}
        {savingsPercent > 0 && (
          <div className="absolute top-3 left-3 bg-emerald-600 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Save {savingsPercent}%
          </div>
        )}

        {/* Stock badge */}
        <div className="absolute bottom-2 left-3">
          {availableUnits.length > 0 ? (
            <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50/90 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
              {availableUnits.length} in stock
            </span>
          ) : (
            <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
              Reserved / Sold out
            </span>
          )}
        </div>
      </div>

      {/* Card Info */}
      <div className="flex flex-1 flex-col p-4 justify-between">
        <div>
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>{product.brand}</span>
            <span className="font-mono text-slate-400">Mod. {product.modelNumber}</span>
          </div>

          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:text-emerald-600 transition-colors">
            {product.title}
          </h3>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {formatINR(minPrice)}
            </span>
            {product.mrp > minPrice && (
              <span className="text-xs text-slate-400 line-through">
                {formatINR(product.mrp)}
              </span>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              {product.warrantyMonths}m Warranty
            </span>
            <span className="font-medium text-emerald-600 hover:underline">
              View Details &rarr;
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
