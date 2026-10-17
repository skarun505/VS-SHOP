import React from "react";
import { ShieldCheck, RotateCcw, FileCheck2, Truck } from "lucide-react";

interface WarrantyStripProps {
  warrantyMonths?: number;
  returnDays?: number;
  className?: string;
}

export function WarrantyStrip({
  warrantyMonths = 6,
  returnDays = 7,
  className = "",
}: WarrantyStripProps) {
  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 ${className}`}
    >
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="text-left">
          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {warrantyMonths}-Mo Warranty
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Doorstep repair</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <RotateCcw className="w-4 h-4" />
        </div>
        <div className="text-left">
          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {returnDays}-Day Return
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">100% money back</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
          <FileCheck2 className="w-4 h-4" />
        </div>
        <div className="text-left">
          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            GST Invoice
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Tax compliant</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <Truck className="w-4 h-4" />
        </div>
        <div className="text-left">
          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Free Delivery
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Dispatched in 24h</div>
        </div>
      </div>
    </div>
  );
}
