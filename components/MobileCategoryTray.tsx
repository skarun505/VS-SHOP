"use client";

import React from "react";
import Link from "next/link";
import { Smartphone, Laptop, Tv, Sparkles, Zap, ShieldCheck } from "lucide-react";

export function MobileCategoryTray() {
  const categories = [
    {
      title: "Phones",
      href: "/category/smartphones",
      badge: "Up to 50% Off",
      badgeColor: "bg-emerald-500",
      gradient: "from-emerald-500 to-teal-600",
      icon: Smartphone,
    },
    {
      title: "Laptops",
      href: "/category/laptops",
      badge: "Mac & XPS",
      badgeColor: "bg-blue-500",
      gradient: "from-blue-500 to-indigo-600",
      icon: Laptop,
    },
    {
      title: "4K TVs",
      href: "/category/televisions",
      badge: "OLED / 4K",
      badgeColor: "bg-purple-500",
      gradient: "from-purple-500 to-violet-600",
      icon: Tv,
    },
    {
      title: "Appliances",
      href: "/category/appliances",
      badge: "Smart Wash",
      badgeColor: "bg-amber-500",
      gradient: "from-amber-500 to-orange-600",
      icon: Sparkles,
    },
    {
      title: "Flash Deals",
      href: "/#deals",
      badge: "55% OFF",
      badgeColor: "bg-red-500 animate-pulse",
      gradient: "from-red-500 to-rose-600",
      icon: Zap,
    },
    {
      title: "Warranty",
      href: "/grading-guide",
      badge: "42-Point",
      badgeColor: "bg-emerald-600",
      gradient: "from-emerald-600 to-teal-700",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="md:hidden py-3 px-4 bg-slate-50/80 dark:bg-slate-900/60 border-y border-slate-200/80 dark:border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          Quick Explore
        </span>
        <span className="text-[10px] text-emerald-600 font-bold">⚡ Same Day Dispatch</span>
      </div>

      <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-1">
        {categories.map((c, i) => {
          const Icon = c.icon;
          return (
            <Link
              key={i}
              href={c.href}
              prefetch={true}
              className="flex flex-col items-center shrink-0 group active:scale-95 transition-transform"
            >
              <div className="relative">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.gradient} p-0.5 shadow-md flex items-center justify-center text-white`}
                >
                  <div className="w-full h-full rounded-[14px] bg-slate-900/20 backdrop-blur-xs flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white transition-transform group-hover:scale-110" />
                  </div>
                </div>

                {c.badge && (
                  <span
                    className={`absolute -top-1.5 -right-1 px-1.5 py-0.2 rounded-full text-white text-[8px] font-black uppercase shadow-xs ${c.badgeColor}`}
                  >
                    {c.badge}
                  </span>
                )}
              </div>

              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-1.5 text-center">
                {c.title}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
