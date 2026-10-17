import React from "react";
import Link from "next/link";
import { ConditionBadge } from "@/components/ConditionBadge";
import { GRADES } from "@/lib/grading";
import { ArrowLeft, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";

export default function GradingGuidePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div>
        <Link href="/" className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1.5 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
        </Link>
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
          Transparency Standard
        </span>
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
          Cosmetic Grading Rubric &amp; Inspection Rubric
        </h1>
        <p className="text-xs text-slate-500 mt-2 max-w-2xl leading-relaxed">
          Section 5.3: We never use misleading marketing terms like &ldquo;like brand new&rdquo; for heavily used goods.
          Every device is rigorously inspected against our 4-tier grading standard. Regardless of grade, all items are 100% functionally certified.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {Object.entries(GRADES).map(([key, info]) => (
          <div
            key={key}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <ConditionBadge grade={key} size="lg" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{info.label}</h2>
              </div>
              <span className="text-xs font-bold text-slate-500 font-mono">
                {key === "A_PLUS" ? "Discount: ~30% Off MRP" : key === "A" ? "Discount: ~38% Off MRP" : key === "B" ? "Discount: ~46% Off MRP" : "Discount: ~55% Off MRP"}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {info.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">Screen Condition</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {key === "A_PLUS" || key === "A" ? "Zero Scratches, Flawless" : key === "B" ? "Micro-scratches Invisible When Screen On" : "Noticeable micro-abrasions, 100% touch active"}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">Housing &amp; Casing</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {key === "A_PLUS" ? "No visible marks" : key === "A" ? "Minor hairline marks" : key === "B" ? "Visible light scuffs" : "Noticeable scuffs or small dents"}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">Battery Health</div>
                <div className="font-semibold text-emerald-600 mt-0.5">
                  {key === "A_PLUS" ? "90% to 100% Capacity" : key === "A" ? "88% to 95% Capacity" : key === "B" ? "85% to 92% Capacity" : "80%+ Factory Spec"}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
