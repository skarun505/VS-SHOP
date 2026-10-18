import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Smartphone, Laptop, Tv, Sparkles, Search, ShieldCheck } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md">
      {/* Top micro-announcement banner (Zepto/Amazon style) */}
      <div className="bg-emerald-600 text-white px-3 sm:px-4 py-1 sm:py-1.5 text-center text-[10px] sm:text-xs font-semibold flex items-center justify-center gap-1.5 sm:gap-2">
        <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-300" />
        <span className="truncate">
          100% Genuine Certified Untouched Tech &bull; Up to 55% Off Retail &bull; 7-Day Free Replacement
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-13 sm:h-16 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative h-8 sm:h-10 w-auto flex items-center">
            <Image
              src="/logo.png"
              alt="Vercel Shop"
              width={150}
              height={40}
              priority
              className="h-7 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </div>
          <span className="text-[9px] sm:text-[10px] uppercase font-black tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 shrink-0">
            Certified Mint
          </span>
        </Link>

        {/* Categories Nav (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link href="/" prefetch={true} className="hover:text-emerald-600 transition-colors">
            All Deals
          </Link>
          <Link href="/category/smartphones" prefetch={true} className="hover:text-emerald-600 transition-colors flex items-center gap-1.5">
            <Smartphone className="w-4 h-4" />
            Phones
          </Link>
          <Link href="/category/laptops" prefetch={true} className="hover:text-emerald-600 transition-colors flex items-center gap-1.5">
            <Laptop className="w-4 h-4" />
            Laptops
          </Link>
          <Link href="/category/televisions" prefetch={true} className="hover:text-emerald-600 transition-colors flex items-center gap-1.5">
            <Tv className="w-4 h-4" />
            TVs
          </Link>
          <Link href="/category/appliances" prefetch={true} className="hover:text-emerald-600 transition-colors">
            Appliances
          </Link>
        </nav>

        {/* Right side actions - Track Order & Warranty */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          <Link
            href="/order/lookup"
            prefetch={true}
            className="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-white transition-all shadow-xs"
          >
            <Search className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Track Order</span>
            <span className="sm:hidden text-[10px]">Track</span>
          </Link>

          <Link
            href="/grading-guide"
            prefetch={true}
            className="hidden sm:flex text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-white transition-all shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Grading Standards</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
