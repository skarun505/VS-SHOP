import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Smartphone, Laptop, Tv, Sparkles, Search } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md">
      {/* Top micro-announcement banner */}
      <div className="bg-emerald-600 text-white px-4 py-1.5 text-center text-xs font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5" />
        <span>100% Genuine Certified Devices &bull; Pristine Untouched Condition &bull; Doorstep 7-Day Free Returns</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative h-10 w-auto flex items-center">
            <Image
              src="/logo.png"
              alt="Vercel Shop"
              width={160}
              height={44}
              priority
              className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </div>
          <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            Untouched Mint
          </span>
        </Link>

        {/* Categories Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link href="/" className="hover:text-emerald-600 transition-colors">
            All Deals
          </Link>
          <Link href="/category/smartphones" className="hover:text-emerald-600 transition-colors flex items-center gap-1.5">
            <Smartphone className="w-4 h-4" />
            Phones
          </Link>
          <Link href="/category/laptops" className="hover:text-emerald-600 transition-colors flex items-center gap-1.5">
            <Laptop className="w-4 h-4" />
            Laptops
          </Link>
          <Link href="/category/televisions" className="hover:text-emerald-600 transition-colors flex items-center gap-1.5">
            <Tv className="w-4 h-4" />
            TVs
          </Link>
          <Link href="/category/appliances" className="hover:text-emerald-600 transition-colors">
            Appliances
          </Link>
        </nav>

        {/* Right side actions - Admin portal removed from storefront (accessed via /admin directly) */}
        <div className="flex items-center gap-3">
          <Link
            href="/order/lookup"
            className="text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-white transition-all shadow-xs"
          >
            <Search className="w-3.5 h-3.5 text-emerald-600" />
            <span>Track Order</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
