"use client";

import React, { useState, useMemo } from "react";
import { ProductCard } from "./ProductCard";
import { Sparkles, SlidersHorizontal, ArrowUpDown, Tag, Smartphone, Laptop, Tv, CheckCircle2 } from "lucide-react";

interface StorefrontCatalogProps {
  initialProducts: any[];
}

export function StorefrontCatalog({ initialProducts }: StorefrontCatalogProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");

  const filterOptions = [
    { id: "all", label: "🔥 All Items" },
    { id: "smartphones", label: "📱 Phones" },
    { id: "laptops", label: "💻 Laptops" },
    { id: "televisions", label: "📺 4K TVs" },
    { id: "appliances", label: "✨ Appliances" },
    { id: "under-30k", label: "🏷️ Under ₹30k" },
    { id: "high-discount", label: "⚡ 40%+ Off" },
  ];

  const filteredProducts = useMemo(() => {
    let list = [...initialProducts];

    // Filter by category or condition
    if (selectedFilter === "smartphones" || selectedFilter === "laptops" || selectedFilter === "televisions" || selectedFilter === "appliances") {
      list = list.filter((p) => p.category?.toLowerCase() === selectedFilter);
    } else if (selectedFilter === "under-30k") {
      list = list.filter((p) => {
        const available = p.units?.filter((u: any) => u.status === "AVAILABLE") || [];
        const minPrice = available.length > 0 ? Math.min(...available.map((u: any) => u.pricePaise)) : p.mrp;
        return minPrice <= 3000000; // <= ₹30,000 in paise
      });
    } else if (selectedFilter === "high-discount") {
      list = list.filter((p) => {
        const available = p.units?.filter((u: any) => u.status === "AVAILABLE") || [];
        const minPrice = available.length > 0 ? Math.min(...available.map((u: any) => u.pricePaise)) : p.mrp;
        const discount = ((p.mrp - minPrice) / p.mrp) * 100;
        return discount >= 40;
      });
    }

    // Sort list
    if (sortBy === "price-asc") {
      list.sort((a, b) => {
        const minA = a.units?.[0]?.pricePaise || a.mrp;
        const minB = b.units?.[0]?.pricePaise || b.mrp;
        return minA - minB;
      });
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => {
        const minA = a.units?.[0]?.pricePaise || a.mrp;
        const minB = b.units?.[0]?.pricePaise || b.mrp;
        return minB - minA;
      });
    } else if (sortBy === "discount") {
      list.sort((a, b) => {
        const minA = a.units?.[0]?.pricePaise || a.mrp;
        const discA = ((a.mrp - minA) / a.mrp) * 100;
        const minB = b.units?.[0]?.pricePaise || b.mrp;
        const discB = ((b.mrp - minB) / b.mrp) * 100;
        return discB - discA;
      });
    }

    return list;
  }, [initialProducts, selectedFilter, sortBy]);

  return (
    <section id="deals" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-3 sm:space-y-6">
      {/* Amazon / Flipkart Style Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {filterOptions.map((opt) => {
          const isSelected = selectedFilter === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelectedFilter(opt.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                isSelected
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-400"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Toolbar: Count & Sort */}
      <div className="flex items-center justify-between text-xs border-b border-slate-200 dark:border-slate-800 pb-2">
        <span className="font-bold text-slate-800 dark:text-slate-200">
          Showing <span className="text-emerald-600">{filteredProducts.length}</span> Verified Models
        </span>

        {/* Sort selector */}
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 text-xs focus:outline-none cursor-pointer"
          >
            <option value="featured" className="dark:bg-slate-900">Featured</option>
            <option value="price-asc" className="dark:bg-slate-900">Price: Low to High</option>
            <option value="price-desc" className="dark:bg-slate-900">Price: High to Low</option>
            <option value="discount" className="dark:bg-slate-900">Biggest Discount</option>
          </select>
        </div>
      </div>

      {/* Empty state */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
          <p className="text-sm text-slate-500">No items match your selected filter.</p>
          <button
            type="button"
            onClick={() => {
              setSelectedFilter("all");
              setSortBy("featured");
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* 2-Column Mobile Grid / 4-Column Desktop Grid */
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-5">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
