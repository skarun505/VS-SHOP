"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ConditionBadge } from "./ConditionBadge";
import { WarrantyStrip } from "./WarrantyStrip";
import { RepairDisclosure } from "./RepairDisclosure";
import { TrustBlock } from "./TrustBlock";
import { ExitIntentOffer } from "./ExitIntentOffer";
import { formatINR, calculateSavingsPercent } from "@/lib/utils";
import { Sparkles, ShoppingBag, ShieldCheck, CheckCircle2, ChevronRight, User } from "lucide-react";

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
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const price = selectedUnit ? selectedUnit.pricePaise : product.mrp;
  const savingsPercent = calculateSavingsPercent(product.mrp, price);

  // Handle Buy
  const handleProceedToCheckout = () => {
    if (!selectedUnit) return;
    const url = `/checkout?unitId=${selectedUnit.id}${appliedCoupon ? `&coupon=${appliedCoupon}` : ""}`;
    router.push(url);
  };

  return (
    <div className="space-y-12">
      {/* Exit Intent Offer popup */}
      <ExitIntentOffer
        onApply={(code) => {
          setAppliedCoupon(code);
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square w-full rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 flex items-center justify-center overflow-hidden shadow-xs">
            <img
              src={activeImage || images[0]}
              alt={product.title}
              className="max-h-full max-w-full object-contain transition-all duration-300"
            />
            {savingsPercent > 0 && (
              <div className="absolute top-4 left-4 bg-emerald-600 text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-md flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Save {savingsPercent}% Off MRP
              </div>
            )}
          </div>

          {/* Thumbnail list if multiple */}
          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-20 h-20 rounded-xl bg-white dark:bg-slate-900 border p-2 overflow-hidden transition-all ${
                    activeImage === img
                      ? "border-emerald-600 ring-2 ring-emerald-500/20"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}

          {/* Unit selection selector: Unique physical items */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Select Physical Unit in Inventory ({product.units.length} total)
              </span>
              <span className="text-xs text-slate-500">Each unit is individually tested</span>
            </div>

            <div className="space-y-2">
              {product.units.map((unit) => {
                const isSelected = selectedUnit?.id === unit.id;
                const isSold = unit.status === "SOLD";
                const isReserved = unit.status === "RESERVED";

                return (
                  <button
                    key={unit.id}
                    disabled={isSold}
                    onClick={() => setSelectedUnit(unit)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
                    } ${isSold ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <ConditionBadge grade={unit.grade} size="sm" />
                      <div>
                        <div className="text-xs font-mono font-medium text-slate-800 dark:text-slate-200">
                          IMEI: ••••{unit.serialOrImei.slice(-4)}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {unit.batteryHealth ? `Battery: ${unit.batteryHealth}% · ` : ""}
                          {unit.grade === "A_PLUS" ? "Untouched Quality" : "Mint Certified"}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {formatINR(unit.pricePaise)}
                      </div>
                      <div className="text-[10px]">
                        {isSold ? (
                          <span className="text-red-500 font-semibold">SOLD</span>
                        ) : isReserved ? (
                          <span className="text-amber-500 font-medium">In Checkout</span>
                        ) : (
                          <span className="text-emerald-600 font-medium">Available</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Section 8 Ordered Requirements */}
        <div className="lg:col-span-6 space-y-6">
          {/* 1. Title with Refurbished/Repaired/Open-box */}
          <div>
            <div className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider mb-1">
              {product.brand} &bull; Model {product.modelNumber}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 leading-tight">
              {product.title}
            </h1>
          </div>

          {/* 2. Price, MRP, % saved */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/80 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
              {formatINR(price)}
            </span>
            {product.mrp > price && (
              <>
                <span className="text-sm text-slate-400 line-through">
                  MRP {formatINR(product.mrp)}
                </span>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                  You Save {savingsPercent}% ({formatINR(product.mrp - price)})
                </span>
              </>
            )}
            <div className="w-full text-xs text-slate-500 mt-1">
              Inclusive of all taxes &bull; GST invoice issued under margin scheme
            </div>
          </div>

          {/* 3. ConditionBadge (grade + one-line meaning) */}
          {selectedUnit && (
            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Cosmetic Condition of this unit:
              </div>
              <ConditionBadge grade={selectedUnit.grade} showDescription={true} size="lg" />
            </div>
          )}

          {/* 4. WarrantyStrip: 6-month warranty · 7-day return · GST invoice */}
          <WarrantyStrip
            warrantyMonths={product.warrantyMonths}
            returnDays={product.returnDays}
          />

          {/* 5. RepairDisclosure: parts replaced, battery health, test checklist passed, serial/IMEI, repair photos */}
          {selectedUnit && (
            <RepairDisclosure
              serialOrImei={selectedUnit.serialOrImei}
              modelNumber={product.modelNumber}
              source={selectedUnit.source}
              repairNotes={selectedUnit.repairNotes}
              repairPhotos={selectedUnit.repairPhotos}
              batteryHealth={selectedUnit.batteryHealth}
            />
          )}

          {/* 6. Buy Button */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleProceedToCheckout}
              disabled={!selectedUnit || selectedUnit.status === "SOLD"}
              className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-lg shadow-emerald-600/25 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>
                {selectedUnit?.status === "SOLD"
                  ? "Selected Unit Sold Out"
                  : `Buy Unit ••••${selectedUnit?.serialOrImei.slice(-4) || ""} Now (${formatINR(price)})`}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Instant Unit Reservation &bull; UPI Intent / QR Payment &bull; Direct Refund Guarantee</span>
            </div>
          </div>

          {/* Product Overview description */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
              Product Overview &amp; Specifications
            </h3>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {/* Verified Reviews Section (Section 8 requirement: verified buyer reviews only) */}
      <section className="border-t border-slate-200 dark:border-slate-800 pt-10">
        <div className="max-w-4xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Verified Customer Reviews ({product.reviews.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Only verified purchasers of delivered orders can submit feedback.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {product.reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 text-xs font-bold">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        {rev.userName}
                        <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800">
                          Verified Buyer
                        </span>
                      </div>
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
    </div>
  );
}
