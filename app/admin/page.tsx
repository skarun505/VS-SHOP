import React from "react";
import { cookies } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { formatINR } from "@/lib/utils";
import {
  CreditCard,
  Package,
  ShoppingBag,
  TrendingUp,
  AlertCircle,
  PlusCircle,
  CheckCircle2,
  Clock,
  LogOut,
  Layers,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const token = cookies().get("refurb_admin_token");
  const isAuthenticated = !!token?.value;

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <AdminLoginForm />
      </div>
    );
  }

  // Fetch admin dashboard stats
  const totalUnits = await prisma.unit.count();
  const availableUnits = await prisma.unit.count({ where: { status: "AVAILABLE" } });
  const reservedUnits = await prisma.unit.count({ where: { status: "RESERVED" } });
  const soldUnits = await prisma.unit.count({ where: { status: "SOLD" } });

  const pendingPayments = await prisma.order.count({
    where: { status: "PAYMENT_SUBMITTED" },
  });

  const allOrders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      unit: {
        include: { product: true },
      },
    },
  });

  const totalRevenuePaise = (
    await prisma.order.findMany({
      where: { status: { in: ["VERIFIED", "PAID", "SHIPPED", "DELIVERED"] } },
      select: { amountPaise: true },
    })
  ).reduce((acc, curr) => acc + curr.amountPaise, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            Control Center
          </span>
          <div className="flex items-center gap-3 mt-1">
            <div className="bg-white px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs inline-block">
              <Image
                src="/logo.png"
                alt="Vercel Shop"
                width={120}
                height={32}
                className="h-7 w-auto object-contain"
              />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              Admin Portal
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/products"
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Layers className="w-4 h-4" />
            <span>Product Catalog</span>
          </Link>
          <Link
            href="/admin/inventory"
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add / Manage Units</span>
          </Link>
          <Link
            href="/admin/payments"
            className="relative px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            <span>Verify Payments</span>
            {pendingPayments > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-bold">
                {pendingPayments}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Pending UTR Queue</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {pendingPayments} orders
          </div>
          <Link href="/admin/payments" className="text-xs text-emerald-600 hover:underline inline-block">
            Review bank credits &rarr;
          </Link>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Available Inventory</span>
            <Package className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {availableUnits} / {totalUnits}
          </div>
          <div className="text-xs text-slate-400">{reservedUnits} reserved in checkout</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Sold Units</span>
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{soldUnits}</div>
          <div className="text-xs text-slate-400">Lifetime fulfilled devices</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Settled Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatINR(totalRevenuePaise)}
          </div>
          <div className="text-xs text-slate-400">Verified bank credits</div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/products"
          className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-500/30 hover:border-indigo-500 transition-colors shadow-xs group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
              <Layers className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-indigo-600">
              Manage Models
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">
            Product Catalog
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Add new products, edit official MRPs, update photos, warranty, descriptions, or delete models.
          </p>
        </Link>

        <Link
          href="/admin/inventory"
          className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 hover:border-emerald-500 transition-colors shadow-xs group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
              <Package className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
              {totalUnits} Units
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors">
            Inventory &amp; Fix Prices
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Add physical units, adjust selling prices, change stock status, and delete units.
          </p>
        </Link>

        <Link
          href="/admin/payments"
          className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 hover:border-amber-500 transition-colors shadow-xs group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300">
              <CreditCard className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
              {pendingPayments} Pending
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 transition-colors">
            UPI Verification Queue
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Verify submitted 12-digit UTRs against bank credit. 1-click verify generates GST invoice.
          </p>
        </Link>

        <Link
          href="/admin/orders"
          className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/30 hover:border-blue-500 transition-colors shadow-xs group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 rounded-xl bg-blue-500/20 text-blue-700 dark:text-blue-300">
              <ShoppingBag className="w-5 h-5" />
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
            Orders &amp; GST Invoices
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            View customer shipping details, courier tracking, and printable Rule 32(5) tax invoices.
          </p>
        </Link>
      </div>

      {/* Recent Orders table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Recent Order Activity
          </h2>
          <Link href="/admin/orders" className="text-xs font-semibold text-emerald-600 hover:underline">
            View All Orders &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-2.5">Order ID</th>
                <th className="py-2.5">Product &amp; Unit</th>
                <th className="py-2.5">Amount</th>
                <th className="py-2.5">Payment Mode</th>
                <th className="py-2.5">Status</th>
                <th className="py-2.5">Date</th>
                <th className="py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {allOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                  <td className="py-3 font-mono font-medium">{ord.id.slice(-8).toUpperCase()}</td>
                  <td className="py-3">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {ord.unit.product.title}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      IMEI: ••••{ord.unit.serialOrImei.slice(-4)} &bull; Grade {ord.unit.grade}
                    </div>
                  </td>
                  <td className="py-3 font-bold text-slate-900 dark:text-slate-100">
                    {formatINR(ord.amountPaise)}
                  </td>
                  <td className="py-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                    {ord.paymentMode}
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ord.status === "VERIFIED" || ord.status === "PAID"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : ord.status === "PAYMENT_SUBMITTED"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : ord.status === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500">
                    {new Date(ord.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      href={`/order/${ord.id}`}
                      className="text-xs font-semibold text-emerald-600 hover:underline"
                    >
                      View &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
