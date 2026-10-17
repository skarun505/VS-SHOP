import React from "react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatINR, maskSerialOrImei } from "@/lib/utils";
import { ArrowLeft, ShoppingBag, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const token = cookies().get("refurb_admin_token");
  if (!token?.value) {
    redirect("/admin");
  }

  const orders = await prisma.order.findMany({
    orderBy: {
      createdAt: "desc",
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
            <ShoppingBag className="w-6 h-6 text-blue-600" />
            <span>Customer Orders &amp; Tax Invoices</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            History of all customer orders, payment modes, UTR submissions, and delivery details.
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="p-3.5">Order ID</th>
                <th className="p-3.5">Customer &amp; Phone</th>
                <th className="p-3.5">Product &amp; Unit</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Payment Mode / Ref</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Invoice No</th>
                <th className="p-3.5 text-right">View Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {orders.map((o) => {
                let ship: any = {};
                try {
                  ship = JSON.parse(o.shippingJson);
                } catch {
                  ship = {};
                }

                return (
                  <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                    <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-slate-100">
                      {o.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{ship.name}</div>
                      <div className="text-slate-400 text-[11px]">+91 {ship.phone}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {o.unit.product.title}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        IMEI: ••••{o.unit.serialOrImei.slice(-4)} &bull; Grade {o.unit.grade}
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100 font-mono">
                      {formatINR(o.amountPaise)}
                    </td>
                    <td className="p-3.5">
                      <div className="font-medium text-slate-700 dark:text-slate-300">
                        {o.paymentMode}
                      </div>
                      {o.utr && (
                        <div className="font-mono text-emerald-600 text-[11px] font-semibold">
                          UTR: {o.utr}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          o.status === "VERIFIED" || o.status === "PAID"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : o.status === "PAYMENT_SUBMITTED"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : o.status === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-500">
                      {o.invoiceNo || "-"}
                    </td>
                    <td className="p-3.5 text-right">
                      <Link
                        href={`/order/${o.id}`}
                        className="text-xs font-semibold text-emerald-600 hover:underline inline-flex items-center gap-1"
                      >
                        <span>Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
