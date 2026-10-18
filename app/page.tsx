import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TrustBlock } from "@/components/TrustBlock";
import { MobileSearchBar } from "@/components/MobileSearchBar";
import { MobileCategoryTray } from "@/components/MobileCategoryTray";
import { StorefrontCatalog } from "@/components/StorefrontCatalog";
import { Sparkles, ShieldCheck, Cpu, ArrowRight, Smartphone, Laptop, Tv, CheckCircle, Tag, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      include: {
        units: true,
        reviews: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (err) {
    console.warn("Prisma query skipped during build/offline:", err);
  }

  return (
    <div className="space-y-3 sm:space-y-10 pb-24 sm:pb-16">
      {/* ========================================================
          MOBILE MINI E-COMMERCE: CLEAN & PRODUCT-FIRST
          ======================================================== */}
      <div className="md:hidden space-y-2">
        {/* 1. Location Pill & Instant Search */}
        <MobileSearchBar />

        {/* 2. Category Story Avatars */}
        <MobileCategoryTray />

        {/* 3. Single Sleek Flash Offer Pill */}
        <div className="px-3 pt-0.5">
          <a
            href="#deals"
            className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white shadow-xs"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span className="text-xs font-bold">⚡ Flash Deals: Up to 55% Off Flagships</span>
            </div>
            <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-md">
              Shop Now &rarr;
            </span>
          </a>
        </div>
      </div>

      {/* ========================================================
          DESKTOP HERO SHOWCASE (Hidden on mobile)
          ======================================================== */}
      <section className="hidden md:block relative overflow-hidden bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-white py-14 lg:py-20 border-b border-emerald-900/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_50%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Pristine Certified Tech &bull; Up to 55% Off Retail
              </div>

              <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Brand New Feel. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                  Untouched Tech Deals.
                </span>
              </h1>

              <p className="text-base text-slate-300 max-w-2xl leading-relaxed">
                Experience flagship smartphones, laptops, 4K TVs, and appliances in flawless condition at unbeatable prices. Rigorously tested with 6-12 month warranty and 7-day return.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href="#deals"
                  className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-md flex items-center gap-2"
                >
                  Explore Deals
                  <ArrowRight className="w-4 h-4" />
                </a>
                <Link
                  href="/grading-guide"
                  className="px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-white text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  Quality Standards
                </Link>
              </div>
            </div>

            {/* Desktop Hardware Certificate */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-3xl bg-slate-800/60 border border-slate-700/80 p-5 backdrop-blur-xl shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-bold">Standard Hardware Certificate</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                    PASS: #42-TEST
                  </span>
                </div>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between py-1 border-b border-slate-700/40">
                    <span className="text-slate-400">Condition Grade</span>
                    <span className="font-semibold text-emerald-300">Grade A+ (Like New, 0 Marks)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-700/40">
                    <span className="text-slate-400">Battery Capacity</span>
                    <span className="font-semibold text-emerald-300">96% Factory Health</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-700/40">
                    <span className="text-slate-400">Invoice Status</span>
                    <span className="font-semibold text-slate-200">GST Margin Invoice Included</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          FAST & SIMPLE PRODUCT CATALOG
          ======================================================== */}
      <StorefrontCatalog initialProducts={products} />

      {/* Trust Block at bottom */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4">
        <TrustBlock />
      </section>
    </div>
  );
}
