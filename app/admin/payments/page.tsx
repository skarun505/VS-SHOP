import React from "react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PaymentsQueueClient } from "@/components/admin/PaymentsQueueClient";
import { ArrowLeft, CreditCard } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const token = cookies().get("refurb_admin_token");
  if (!token?.value) {
    redirect("/admin");
  }

  const pendingOrders = await prisma.order.findMany({
    where: {
      status: "PAYMENT_SUBMITTED",
    },
    orderBy: {
      utrSubmittedAt: "asc",
    },
    include: {
      unit: {
        include: {
          product: true,
        },
      },
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
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
            <CreditCard className="w-6 h-6 text-amber-500" />
            <span>Manual UPI Payment Verification Queue</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Section 6B: Orders awaiting bank statement UTR matching. Verifying marks the unit SOLD and generates a GST tax invoice.
          </p>
        </div>
      </div>

      <PaymentsQueueClient initialOrders={pendingOrders} />
    </div>
  );
}
