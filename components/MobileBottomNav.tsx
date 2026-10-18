"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, Zap, Search, ShieldCheck } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();

  // Hide bottom nav on admin panel
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const isHome = pathname === "/";
  const isCategory = pathname.startsWith("/category");
  const isOrder = pathname.startsWith("/order");
  const isWarranty = pathname.startsWith("/grading-guide");

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-slate-200/90 dark:border-slate-800 px-2 pt-1.5 pb-2.5 flex justify-around items-center shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      {/* 1. Home */}
      <Link
        href="/"
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
          isHome
            ? "text-emerald-600 font-extrabold"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-900"
        }`}
      >
        <Home className={`w-5 h-5 ${isHome ? "stroke-[2.5]" : ""}`} />
        <span className="text-[10px] tracking-tight mt-0.5">Home</span>
        {isHome && (
          <span className="w-1 h-1 bg-emerald-600 rounded-full absolute -bottom-1" />
        )}
      </Link>

      {/* 2. Categories */}
      <Link
        href="/category/smartphones"
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
          isCategory
            ? "text-emerald-600 font-extrabold"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-900"
        }`}
      >
        <Grid className={`w-5 h-5 ${isCategory ? "stroke-[2.5]" : ""}`} />
        <span className="text-[10px] tracking-tight mt-0.5">Categories</span>
        {isCategory && (
          <span className="w-1 h-1 bg-emerald-600 rounded-full absolute -bottom-1" />
        )}
      </Link>

      {/* 3. Flash Deals (Amazon / Flipkart Lightning Deals tab) */}
      <a
        href="/#deals"
        className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:text-emerald-600 relative group"
      >
        <div className="relative">
          <Zap className="w-5 h-5 text-rose-500 fill-rose-500 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1.5 -right-3 px-1 py-0.2 bg-rose-600 text-white text-[7px] font-black rounded-full uppercase shadow-xs animate-pulse">
            HOT
          </span>
        </div>
        <span className="text-[10px] tracking-tight mt-0.5 font-bold text-rose-600">Flash Deals</span>
      </a>

      {/* 4. Track Order */}
      <Link
        href="/order/lookup"
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
          isOrder
            ? "text-emerald-600 font-extrabold"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-900"
        }`}
      >
        <Search className={`w-5 h-5 ${isOrder ? "stroke-[2.5]" : ""}`} />
        <span className="text-[10px] tracking-tight mt-0.5">Track</span>
        {isOrder && (
          <span className="w-1 h-1 bg-emerald-600 rounded-full absolute -bottom-1" />
        )}
      </Link>

      {/* 5. Warranty & QC */}
      <Link
        href="/grading-guide"
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
          isWarranty
            ? "text-emerald-600 font-extrabold"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-900"
        }`}
      >
        <ShieldCheck className={`w-5 h-5 ${isWarranty ? "stroke-[2.5]" : ""}`} />
        <span className="text-[10px] tracking-tight mt-0.5">Warranty</span>
        {isWarranty && (
          <span className="w-1 h-1 bg-emerald-600 rounded-full absolute -bottom-1" />
        )}
      </Link>
    </nav>
  );
}
