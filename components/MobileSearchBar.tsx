"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, ChevronDown, Zap } from "lucide-react";

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
    <div className="md:hidden px-4 pt-3 pb-2 space-y-2.5 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800">
      {/* Zepto/Blinkit Delivery Pill */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-bold truncate">
          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate">Deliver to: <strong className="text-slate-900 dark:text-slate-100">Bangalore 560038</strong></span>
          <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full shrink-0">
          <Zap className="w-3 h-3 fill-emerald-600" />
          <span>Express Free</span>
        </div>
      </div>

      {/* Amazon-style search box */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search iPhone, MacBook, Sony 4K OLED..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 shadow-inner"
        />
      </form>
    </div>
  );
}
