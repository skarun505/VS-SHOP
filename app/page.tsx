import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { TrustBlock } from "@/components/TrustBlock";
import { Sparkles, ShieldCheck, Cpu, ArrowRight, Smartphone, Laptop, Tv, CheckCircle, Tag } from "lucide-react";

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
    <div className="space-y-16 pb-16">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-white py-16 sm:py-24 border-b border-emerald-900/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_50%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Pristine Untouched Quality &bull; Up to 55% Off Retail
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                Brand New Feel. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                  Untouched Tech Deals.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Experience flagship smartphones, laptops, 4K TVs, and appliances in flawless,
                like-new condition at unbeatable prices. Each device is rigorously tested,
                factory calibrated, and backed by a comprehensive warranty.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#deals"
                  className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                  Explore Available Deals
                  <ArrowRight className="w-4 h-4" />
                </a>
                <Link
                  href="/grading-guide"
                  className="px-5 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-white text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  Quality Standards
                </Link>
              </div>

              {/* Quick trust metrics */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-400">6-12 Mo</div>
                  <div className="text-xs text-slate-400">Full Warranty</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-400">42-Point</div>
                  <div className="text-xs text-slate-400">Hardware Test</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-400">7 Days</div>
                  <div className="text-xs text-slate-400">Doorstep Return</div>
                </div>
              </div>
            </div>

            {/* Hero Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl bg-slate-800/60 border border-slate-700/80 p-6 backdrop-blur-xl shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-bold">Standard Hardware Certificate</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                    PASS: #42-TEST
                  </span>
                </div>

                <div className="space-y-3 text-xs text-slate-300">
                  <div className="flex justify-between items-center py-1 border-b border-slate-700/40">
                    <span className="text-slate-400">Condition Grade</span>
                    <span className="font-semibold text-emerald-300">Grade A+ (Like New, 0 Marks)</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-700/40">
                    <span className="text-slate-400">Battery Capacity</span>
                    <span className="font-semibold text-emerald-300">96% Factory Health</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-700/40">
                    <span className="text-slate-400">Replaced Components</span>
                    <span className="font-semibold text-slate-200">100% Disclosed or OEM Certified</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-700/40">
                    <span className="text-slate-400">Invoice Status</span>
                    <span className="font-semibold text-slate-200">GST Margin Invoice Included</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>IMEI verified clean against official CEIR blacklist before dispatch.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation Pills */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-600" />
            Browse Certified Collections
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            href="/category/smartphones"
            className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-colors shadow-xs group"
          >
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 group-hover:scale-110 transition-transform">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">Smartphones</div>
              <div className="text-xs text-slate-500">iPhones, Galaxy, OnePlus</div>
            </div>
          </Link>

          <Link
            href="/category/laptops"
            className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-colors shadow-xs group"
          >
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 group-hover:scale-110 transition-transform">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">Laptops</div>
              <div className="text-xs text-slate-500">MacBook Air, XPS, ThinkPads</div>
            </div>
          </Link>

          <Link
            href="/category/televisions"
            className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-colors shadow-xs group"
          >
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 group-hover:scale-110 transition-transform">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">Smart TVs</div>
              <div className="text-xs text-slate-500">OLED &amp; 4K Google TVs</div>
            </div>
          </Link>

          <Link
            href="/category/appliances"
            className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-colors shadow-xs group"
          >
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">Appliances</div>
              <div className="text-xs text-slate-500">Inverter Washing Machines</div>
            </div>
          </Link>
        </div>
      </section>

      {/* Main Deals Grid */}
      <section id="deals" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">
              Tested &bull; Graded &bull; Ready To Dispatch
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              Available Pristine Collections
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md">
            Showing available units verified to factory perfection. Click any model to review its individual specifications, battery health, and warranty.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Authenticity and Trust Block */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <TrustBlock />
      </section>
    </div>
  );
}
