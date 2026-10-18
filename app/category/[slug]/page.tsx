import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { ArrowLeft, Tag } from "lucide-react";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

const CATEGORY_NAMES: Record<string, { title: string; desc: string }> = {
  smartphones: {
    title: "Pristine Smartphones (Untouched & Like New)",
    desc: "Apple iPhones, Samsung Galaxy Ultra, OnePlus, and more. Clean IMEIs, verified battery health, and 6-month warranty.",
  },
  laptops: {
    title: "Pristine & Open-Box Laptops",
    desc: "Apple MacBooks, Dell XPS, Lenovo ThinkPads. Thermal testing completed, screens certified 100% scratch-free.",
  },
  televisions: {
    title: "Certified 4K & OLED Smart TVs",
    desc: "OLED and 4K HDR displays with zero dead-pixel guarantee. Wall mount and pristine remote included.",
  },
  appliances: {
    title: "Pristine Home Appliances",
    desc: "Front-load and top-load smart inverter washing machines. Deep sanitized, drum vibration tested, and 6-month warranty.",
  },
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const categoryInfo = CATEGORY_NAMES[params.slug];
  if (!categoryInfo) {
    notFound();
  }

  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      where: {
        category: params.slug,
      },
      include: {
      units: true,
      reviews: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  } catch (err) {
    console.warn("Prisma query skipped in category page:", err);
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-10 space-y-6 sm:space-y-8 pb-20">
      {/* Breadcrumb / Back button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to all categories
        </Link>
      </div>

      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4 sm:pb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">
          <Tag className="w-3.5 h-3.5" />
          Category Showcase
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
          {categoryInfo.title}
        </h1>
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          {categoryInfo.desc}
        </p>
      </div>

      {/* Product count and grid */}
      <div>
        <div className="text-xs font-medium text-slate-500 mb-3 sm:mb-4">
          Showing {products.length} models with verified physical inventory
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500">No units currently available in this category.</p>
            <Link href="/" className="mt-4 inline-block text-xs font-semibold text-emerald-600">
              Browse other categories &rarr;
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
