"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, Tag, Search, ShieldCheck } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();

  // Hide bottom nav on admin panel
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const isHome = pathname === "/";
  const isCategory = pathname.startsWith("/category");
  const isOrder = pathname.startsWith("/order");

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-slate-200/90 dark:border-slate-800 px-3 py-1.5 flex justify-around items-center shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
      <Link
        href="/"
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
          isHome
            ? "text-emerald-600 font-bold"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
        }`}
      >
        <Home className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">Home</span>
      </Link>

      <Link
        href="/category/smartphones"
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
          isCategory
            ? "text-emerald-600 font-bold"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
        }`}
      >
        <Grid className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">Categories</span>
      </Link>

      <a
        href="/#deals"
        className="flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:text-emerald-600 relative"
      >
        <div className="relative">
          <Tag className="w-5 h-5 mb-0.5" />
          <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-red-500 text-white text-[8px] font-black rounded-full uppercase">
            Deal
          </span>
        </div>
        <span className="text-[10px] tracking-tight">Top Deals</span>
      </a>

      <Link
        href="/order/lookup"
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
          isOrder
            ? "text-emerald-600 font-bold"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
        }`}
      >
        <Search className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">Track Order</span>
      </Link>

      <Link
        href="/grading-guide"
        className="flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:text-emerald-600"
      >
        <ShieldCheck className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">Warranty</span>
      </Link>
    </nav>
  );
}
