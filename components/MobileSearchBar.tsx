"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, ChevronDown, Zap, X } from "lucide-react";

export function MobileSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const lower = query.toLowerCase();
    if (lower.includes("phone") || lower.includes("iphone") || lower.includes("samsung")) {
      router.push("/category/smartphones");
    } else if (lower.includes("mac") || lower.includes("laptop") || lower.includes("dell")) {
      router.push("/category/laptops");
    } else if (lower.includes("tv") || lower.includes("oled") || lower.includes("sony")) {
      router.push("/category/televisions");
    } else if (lower.includes("wash") || lower.includes("appliance")) {
      router.push("/category/appliances");
    } else {
      router.push("/#deals");
    }
  };

  return (
    <div className="md:hidden px-3 pt-2.5 pb-1.5 space-y-2 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800">
      {/* Zepto/Blinkit Delivery Pill */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold truncate">
          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate text-[11px]">
            Deliver to: <strong className="text-slate-950 dark:text-white font-extrabold">Bangalore 560038</strong>
          </span>
          <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
        </div>
        <div className="flex items-center gap-1 text-[9px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 shrink-0">
          <Zap className="w-3 h-3 fill-emerald-600 text-emerald-600" />
          <span>Express Free</span>
        </div>
      </div>

      {/* Amazon-style search box */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
        <input
          type="text"
          placeholder="Search 'iPhone 15', 'MacBook M3', 'Sony OLED'..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 shadow-inner"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>
    </div>
  );
}
