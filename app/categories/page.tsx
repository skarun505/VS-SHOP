import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Smartphone, Laptop, Tv, Sparkles, Zap, ShieldCheck, ArrowRight, Tag, CheckCircle2 } from "lucide-react";
import { MobileSearchBar } from "@/components/MobileSearchBar";

export const revalidate = 30;

export const metadata = {
  title: "All Categories | Certified Refurbished & Open-Box Electronics",
  description: "Explore all categories of certified like-new electronics: Smartphones, Laptops, 4K OLED TVs, Appliances and Deals with 6-12 month warranty.",
};

const CATEGORIES = [
  {
    slug: "smartphones",
    title: "Flagship Smartphones",
    href: "/category/smartphones",
    desc: "Apple iPhones, Samsung Galaxy Ultra & OnePlus. Battery health 85%+, clean IMEI, 42-point certified.",
    badge: "Up to 50% Off",
    badgeColor: "bg-emerald-600",
    gradient: "from-emerald-600 via-teal-600 to-cyan-700",
    icon: Smartphone,
    popular: ["iPhone 15 Pro", "Samsung S24 Ultra", "OnePlus 12", "iPhone 14"],
  },
  {
    slug: "laptops",
    title: "MacBooks & Laptops",
    href: "/category/laptops",
    desc: "Apple Silicon M2/M3 MacBooks, Dell XPS, Lenovo ThinkPads. Thermal benchmarked, pristine screens.",
    badge: "Up to 45% Off",
    badgeColor: "bg-blue-600",
    gradient: "from-blue-600 via-indigo-600 to-violet-700",
    icon: Laptop,
    popular: ["MacBook Air M2", "MacBook Pro M3", "Dell XPS 15", "Lenovo X1"],
  },
  {
    slug: "televisions",
    title: "4K & OLED Smart TVs",
    href: "/category/televisions",
    desc: "Sony Bravia, LG OLED, Samsung Neo-QLED displays. Zero dead-pixel guarantee with original pristine remotes.",
    badge: "Up to 55% Off",
    badgeColor: "bg-purple-600",
    gradient: "from-purple-600 via-violet-600 to-pink-700",
    icon: Tv,
    popular: ["LG C3 OLED", "Sony 4K HDR", "Samsung 55\" Neo QLED"],
  },
  {
    slug: "appliances",
    title: "Home Appliances",
    href: "/category/appliances",
    desc: "Front-load inverter washing machines and high-efficiency dryers. Sanitized, spin-tested, verified boards.",
    badge: "Up to 40% Off",
    badgeColor: "bg-amber-600",
    gradient: "from-amber-600 via-orange-600 to-rose-700",
    icon: Sparkles,
    popular: ["LG Inverter DirectDrive", "Bosch Series 6", "Samsung EcoBubble"],
  },
];

export default async function CategoriesPage() {
  let productCounts: Record<string, number> = {
    smartphones: 0,
    laptops: 0,
    televisions: 0,
    appliances: 0,
  };

  try {
    const products = await prisma.product.findMany({
      select: { category: true },
    });
    for (const p of products) {
      if (productCounts[p.category] !== undefined) {
        productCounts[p.category]++;
      }
    }
  } catch (err) {
    console.warn("Prisma query skipped during build:", err);
  }

  return (
    <div className="min-h-screen pb-24 sm:pb-16 space-y-4">
      {/* Mobile Location & Search Bar */}
      <div className="md:hidden">
        <MobileSearchBar />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6">
        {/* Page Header */}
        <div className="space-y-1.5 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Department Hub
            </span>
            <span className="text-xs text-slate-500 font-semibold">&bull; 4 Certified Categories</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Explore All Categories
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            Browse our hand-tested selection of open-box and like-new electronics. Every device includes a mandatory 6-month warranty and 7-day doorstep return.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const count = productCounts[cat.slug] || 0;
            return (
              <Link
                key={cat.slug}
                href={cat.href}
                prefetch={true}
                className="group relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all active:scale-[0.99] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.gradient} p-0.5 shadow-md flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform`}
                    >
                      <div className="w-full h-full rounded-[14px] bg-slate-900/20 backdrop-blur-xs flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase text-white shadow-xs ${cat.badgeColor}`}>
                        {cat.badge}
                      </span>
                      {count > 0 && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                          {count} Models
                        </span>
                      )}
                    </div>
                  </div>

                  <h2 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors flex items-center gap-2">
                    {cat.title}
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-600 transition-all" />
                  </h2>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>

                {/* Popular Models Pills */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                    Popular:
                  </span>
                  {cat.popular.map((item, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Links Banner: Deals, Warranty, Tracking */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          <Link
            href="/#deals"
            prefetch={true}
            className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 to-orange-500/10 border border-rose-200 dark:border-rose-900/60 hover:border-rose-400 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="text-xs font-black text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                Flash Deals
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400">
                Save up to 55% off limited inventory
              </div>
            </div>
          </Link>

          <Link
            href="/warranty"
            prefetch={true}
            className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-400 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                Warranty &amp; Claims
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400">
                6-12 Months Doorstep Replacement
              </div>
            </div>
          </Link>

          <Link
            href="/order/lookup"
            prefetch={true}
            className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200 dark:border-blue-900/60 hover:border-blue-400 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                Track by Phone
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400">
                Instant delivery status lookup
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
