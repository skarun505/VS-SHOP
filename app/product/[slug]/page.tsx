import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductDetailClient } from "@/components/ProductDetailClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  let product: any = null;
  try {
    product = await prisma.product.findUnique({
      where: { slug: params.slug },
    });
  } catch (e) {
    // fallback during static checks
  }

  if (!product) {
    return { title: "Product Not Found | PristineTech" };
  }

  let images: string[] = [];
  try {
    images = JSON.parse(product.images);
  } catch {
    images = [];
  }

  return {
    title: `${product.title} - Pristine Certified`,
    description: `Buy ${product.title} with verified condition grade, 42-point test, 6-month warranty, and 7-day doorstep return.`,
    openGraph: {
      title: product.title,
      description: product.description.slice(0, 160),
      images: images[0] ? [{ url: images[0] }] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await prisma.product.findUnique({
    where: {
      slug: params.slug,
    },
    include: {
      units: {
        orderBy: {
          pricePaise: "asc",
        },
      },
      reviews: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Schema.org JSON-LD for rich snippets (Phase 8 requirement)
  let images: string[] = [];
  try {
    images = JSON.parse(product.images);
  } catch {
    images = [];
  }

  const minPrice = product.units.length > 0
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
      availability:
        product.units.some((u) => u.status === "AVAILABLE")
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient product={product} />
    </div>
  );
}
