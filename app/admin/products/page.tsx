import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Layers, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductManagerClient } from "@/components/admin/ProductManagerClient";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const token = cookies().get("refurb_admin_token");
  if (!token?.value) {
    redirect("/admin");
  }

  const products = await prisma.product.findMany({
    include: {
      units: {
        select: {
          id: true,
          status: true,
          pricePaise: true,
          grade: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Breadcrumb Nav */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <Link
          href="/admin"
          className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Admin Dashboard</span>
        </Link>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Product Catalog &amp; Model Authority</span>
        </div>
      </div>

      <ProductManagerClient initialProducts={products as any} />
    </div>
  );
}
