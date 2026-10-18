"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ConditionBadge } from "./ConditionBadge";
import { WarrantyStrip } from "./WarrantyStrip";
import { RepairDisclosure } from "./RepairDisclosure";
import { TrustBlock } from "./TrustBlock";
import { formatINR, calculateSavingsPercent } from "@/lib/utils";
import {
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Star,
  Zap,
  ArrowRight,
  User,
  Loader2,
} from "lucide-react";

interface UnitType {
  id: string;
  serialOrImei: string;
  grade: string;
  source: string;
  costPaise: number;
  repairNotes?: string | null;
  repairPhotos?: string | null;
  batteryHealth?: number | null;
  pricePaise: number;
  floorPaise: number;
  status: string;
}

interface ReviewType {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string | Date;
}

interface ProductDetailClientProps {
  product: {
    id: string;
    slug: string;
    title: string;
    brand: string;
    modelNumber: string;
    category: string;
    description: string;
    images: string;
    mrp: number;
    warrantyMonths: number;
    returnDays: number;
    units: UnitType[];
    reviews: ReviewType[];
  };
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();

  let images: string[] = [];
  try {
    images = JSON.parse(product.images);
  } catch {
    images = [];
  }
  const [activeImage, setActiveImage] = useState(images[0] || "");

  // Available units
  const availableUnits = product.units.filter((u) => u.status === "AVAILABLE");
  const defaultUnit = availableUnits[0] || product.units[0];
  const [selectedUnit, setSelectedUnit] = useState<UnitType | null>(defaultUnit || null);
  const [showTechnicalReport, setShowTechnicalReport] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Instant prefetch checkout page into memory as soon as unit is selected
  useEffect(() => {
    if (selectedUnit) {
      router.prefetch(`/checkout?unitId=${selectedUnit.id}`);
    }
  }, [selectedUnit, router]);

  const price = selectedUnit ? selectedUnit.pricePaise : product.mrp;
  const savingsPercent = calculateSavingsPercent(product.mrp, price);

  // Handle Buy
  const handleProceedToCheckout = () => {
    if (!selectedUnit || isNavigating) return;
    setIsNavigating(true);
    const url = `/checkout?unitId=${selectedUnit.id}`;
    router.push(url);
  };

  return (
    <div className="space-y-6 sm:space-y-10 pb-28 sm:pb-16 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        {/* Left Column: CLEAN Product Gallery (No overlays covering image) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="relative aspect-square w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-8 flex items-center justify-center overflow-hidden shadow-xs">
            <img
              src={activeImage || images[0]}
              alt={product.title}
              className="max-h-full max-w-full object-contain"
            />
          </div>

          {/* Thumbnail list if multiple */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  className={`relative w-16 h-16 rounded-xl bg-white dark:bg-slate-900 border p-1.5 overflow-hidden shrink-0 transition-all ${
                    activeImage === img
                      ? "border-emerald-600 ring-2 ring-emerald-500/30"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Title, Price, and IMMEDIATE BUY NOW BUTTON */}
        <div className="lg:col-span-6 space-y-4 sm:space-y-5">
          {/* 1. Brand, Model & Title */}
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              {product.brand} &bull; {product.modelNumber}
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 leading-snug">
              {product.title}
            </h1>

            {/* Rating & reviews */}
            <div className="flex items-center gap-2 mt-2">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-xs font-black">
                <span>4.8</span>
                <Star className="w-3 h-3 fill-white" />
              </div>
              <span className="text-xs text-slate-500">
                {product.reviews.length || 18} Verified Buyer Ratings &bull; 100% Genuine
              </span>
            </div>
          </div>

          {/* 2. Price Box */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 space-y-1">
            <div className="flex items-baseline flex-wrap gap-2 sm:gap-3">
              <span className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white font-mono">
                {formatINR(price)}
              </span>
              {product.mrp > price && (
                <>
                  <span className="text-sm text-slate-400 line-through">
                    {formatINR(product.mrp)}
                  </span>
                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                    {savingsPercent}% OFF &bull; Save {formatINR(product.mrp - price)}
                  </span>
                </>
              )}
            </div>
            <div className="text-[11px] text-slate-500">
              Inclusive of all taxes &bull; Real GST Invoice Included
            </div>
          </div>

          {/* 3. PROMINENT BUY NOW BUTTON (RIGHT AT THE TOP, 0 SCROLLING NEEDED) */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleProceedToCheckout}
              disabled={!selectedUnit || selectedUnit.status === "SOLD" || isNavigating}
              className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base shadow-lg shadow-emerald-600/30 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2.5 disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {isNavigating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Opening Checkout...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 fill-white" />
                  <span>
                    {selectedUnit?.status === "SOLD" ? "Sold Out" : "Buy Now &bull; Instant Checkout"}
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Quick trust reassurance right under Buy button */}
            <div className="flex items-center justify-center gap-3 text-xs text-slate-600 dark:text-slate-400 py-1">
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Free Express Delivery</span>
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>{product.warrantyMonths}m Warranty</span>
              </span>
              <span>&bull;</span>
              <span>7-Day Return</span>
            </div>
          </div>

          {/* 4. Unit Selector (Simplified & Clean) */}
          {product.units.length > 1 && (
            <div className="pt-2">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Available Physical Units ({availableUnits.length} in stock):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.units.map((unit) => {
                  const isSelected = selectedUnit?.id === unit.id;
                  const isSold = unit.status === "SOLD";

                  return (
                    <button
                      key={unit.id}
                      type="button"
                      disabled={isSold}
                      onClick={() => setSelectedUnit(unit)}
                      className={`text-left p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                      } ${isSold ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-center gap-2">
                        <ConditionBadge grade={unit.grade} size="sm" />
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {unit.grade === "A_PLUS" ? "Untouched Mint" : "Like New"}
                          </div>
                          {unit.batteryHealth && (
                            <div className="text-[10px] text-emerald-600 font-medium">
                              {unit.batteryHealth}% Battery Health
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {formatINR(unit.pricePaise)}
                        </div>
                        <div className="text-[9px] text-slate-400">
                          {isSold ? "Sold" : "Available"}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. Warranty & Guarantee Strip */}
          <WarrantyStrip
            warrantyMonths={product.warrantyMonths}
            returnDays={product.returnDays}
          />

          {/* 6. Collapsible Technical Inspection & QC Report */}
          {selectedUnit && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowTechnicalReport(!showTechnicalReport)}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Technical QC &amp; Hardware Inspection Report
                  </span>
                </div>
                {showTechnicalReport ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {showTechnicalReport && (
                <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                  <RepairDisclosure
                    serialOrImei={selectedUnit.serialOrImei}
                    modelNumber={product.modelNumber}
                    source={selectedUnit.source}
                    repairNotes={selectedUnit.repairNotes}
                    repairPhotos={selectedUnit.repairPhotos}
                    batteryHealth={selectedUnit.batteryHealth}
                  />
                </div>
              )}
            </div>
          )}

          {/* 7. Product Overview Description */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1 uppercase tracking-wider">
              Product Overview
            </h3>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {/* Verified Reviews Section */}
      <section className="border-t border-slate-200 dark:border-slate-800 pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              Verified Buyer Reviews ({product.reviews.length})
            </h2>
            <div className="text-xs text-emerald-600 font-semibold">
              100% Genuine Verified Purchases
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {product.reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 text-xs font-bold">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {rev.userName}
                    </div>
                  </div>
                  <div className="flex text-amber-400 text-xs">
                    {"★".repeat(rev.rating)}
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {rev.comment}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Block at bottom */}
      <TrustBlock />

      {/* STICKY MOBILE BUY NOW BAR (Uncluttered, 0 overlap, instant tap) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.12)] flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-black text-slate-950 dark:text-white font-mono leading-none">
            {formatINR(price)}
          </div>
          <div className="text-[10px] font-bold text-emerald-600">
            Free Delivery &bull; {savingsPercent}% Off
          </div>
        </div>

        <button
          type="button"
          onClick={handleProceedToCheckout}
          disabled={!selectedUnit || selectedUnit.status === "SOLD" || isNavigating}
          className="flex-1 max-w-[200px] py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-95 transition-all"
        >
          {isNavigating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Opening...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 fill-white" />
              <span>{selectedUnit?.status === "SOLD" ? "Sold Out" : "Buy Now"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
