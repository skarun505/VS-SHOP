"use client";

import React from "react";
import { Zap, ShieldCheck, RefreshCw, CheckCircle2 } from "lucide-react";

export function ZeptoServiceStrip() {
  const highlights = [
    {
      icon: Zap,
      label: "24h Dispatch",
      sub: "Express Free Delivery",
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/50",
    },
    {
      icon: ShieldCheck,
      label: "1-Yr Warranty",
      sub: "Free Repair / Replace",
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/50",
    },
    {
      icon: RefreshCw,
      label: "7-Day Return",
      sub: "Doorstep Pickup",
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/50",
    },
    {
      icon: CheckCircle2,
      label: "42-Point QC",
      sub: "Zero Scratch Tested",
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-950/50",
    },
  ];

  return (
    <div className="md:hidden px-3 py-1">
      <div className="grid grid-cols-4 gap-1.5 p-2 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
        {highlights.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex flex-col items-center text-center p-1 rounded-xl"
            >
              <div className={`p-1.5 rounded-lg ${item.bg} ${item.color} mb-1`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
                {item.label}
              </span>
              <span className="text-[8px] text-slate-500 dark:text-slate-400 leading-tight truncate w-full">
                {item.sub}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
