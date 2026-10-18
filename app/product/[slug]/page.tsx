import React, { cache } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductDetailClient } from "@/components/ProductDetailClient";
import type { Metadata } from "next";

export const revalidate = 60;

interface ProductPageProps {
  params: {
    slug: string;
  };
}

// Cached product fetcher shared between generateMetadata and ProductPage
const getProduct = cache(async (slug: string) => {
  try {
    return await prisma.product.findUnique({
      where: { slug },
      include: {
        units: {
          orderBy: { pricePaise: "asc" },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  } catch (err) {
    console.warn("Product fetch error:", err);
    return null;
  }
});

// Pre-render product routes at build time for 0ms instant loading
export async function generateStaticParams() {
  try {
    const products = await prisma.product.findMany({
      select: { slug: true },
      take: 50,
    });
    return products.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(params.slug);

  if (!product) {
    return { title: "Product Not Found | Vercel Shop" };
  }

  let images: string[] = [];
  try {
    images = JSON.parse(product.images);
  } catch {
    images = [];
  }

  return {
    title: `${product.title} - Certified Untouched Mint | Vercel Shop`,
    description: `Buy ${product.title} with verified condition grade, 42-point test, 6-month warranty, and 7-day doorstep return.`,
    openGraph: {
      title: product.title,
      description: product.description.slice(0, 160),
      images: images[0] ? [{ url: images[0] }] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.slug);

  if (!product) {
    notFound();
  }

  let images: string[] = [];
  try {
    images = JSON.parse(product.images);
  } catch {
    images = [];
  }

  const minPrice =
    product.units.length > 0
      ? Math.min(...product.units.map((u) => u.pricePaise)) / 100
      : product.mrp / 100;

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.title,
    image: images,
    description: product.description,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    model: product.modelNumber,
    itemCondition: "https://schema.org/OpenBoxCondition",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: minPrice,
      offerCount: product.units.length,
      availability: product.units.some((u) => u.status === "AVAILABLE")
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient product={product} />
    </div>
  );
}
