import React from "react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { InventoryManagerClient } from "@/components/admin/InventoryManagerClient";
import { ArrowLeft, Package } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const token = cookies().get("refurb_admin_token");
  if (!token?.value) {
    redirect("/admin");
  }

  const products = await prisma.product.findMany({
    select: {
      id: true,
      title: true,
      brand: true,
      modelNumber: true,
      mrp: true,
    },
    orderBy: {
      title: "asc",
    },
  });

  const units = await prisma.unit.findMany({
    include: {
      product: {
        select: {
          id: true,
          title: true,
          modelNumber: true,
          mrp: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <Link
            href="/admin"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-600" />
            <span>Unit Inventory &amp; Price Floor Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Section 4 &amp; 5: Each physical item has its own IMEI, condition grade, cost, and minimum 12% margin floor.
          </p>
        </div>
      </div>

      <InventoryManagerClient products={products} initialUnits={units} />
    </div>
  );
}
