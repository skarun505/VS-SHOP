"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/utils";
import {
  Search,
  Phone,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Loader2,
} from "lucide-react";

export default function OrderLookupPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setErrorMsg(null);
    setSearched(true);

    try {
      const res = await fetch(`/api/order/lookup?q=${encodeURIComponent(q)}`);
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to search orders. Please check your number.");
        setOrders([]);
      } else {
        setOrders(data.orders || []);
      }
    } catch (err: any) {
      setErrorMsg("Network error. Please try again.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAYMENT_VERIFIED":
      case "PROCESSING":
        return {
          label: "Confirmed &bull; Processing Dispatch",
          color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
          icon: CheckCircle2,
        };
      case "SHIPPED":
        return {
          label: "Shipped &bull; Out for Delivery",
          color: "bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800",
          icon: Truck,
        };
      case "DELIVERED":
        return {
          label: "Delivered Successfully",
          color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border-emerald-300",
          icon: CheckCircle2,
        };
      case "PAYMENT_SUBMITTED":
        return {
          label: "UTR Submitted &bull; Verifying Payment",
          color: "bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800",
          icon: Clock,
        };
      case "AWAITING_PAYMENT":
      default:
        return {
          label: "Awaiting Payment / UTR",
          color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
          icon: AlertCircle,
        };
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-16 space-y-6 pb-24">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
          <Truck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
          Track Your Order
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          Enter your <strong>10-digit mobile number</strong> used during checkout or your Order ID.
        </p>
      </div>

      {/* Search Input Box */}
      <form
        onSubmit={handleSearch}
        className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-4 shadow-sm"
      >
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mobile Number or Order Reference ID</span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              inputMode="tel"
              placeholder="e.g. 9876543210 or Order ID"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 shadow-inner"
            />
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Tip: You can search using just your 10-digit phone number.
          </span>
        </div>

        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Searching Orders...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Track Orders</span>
            </>
          )}
        </button>
      </form>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Results Section */}
      {searched && !loading && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>
              Found {orders.length} {orders.length === 1 ? "Order" : "Orders"}
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-3">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No Orders Found for &quot;{query}&quot;
              </div>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Please double-check the phone number entered during checkout. If you paid recently, order verification takes 10-15 minutes.
              </p>
              <Link
                href="/"
                className="inline-block mt-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
              >
                Browse Available Tech &rarr;
              </Link>
            </div>
          ) : (
            orders.map((ord) => {
              const statusInfo = getStatusBadge(ord.status);
              const StatusIcon = statusInfo.icon;
              const dateStr = new Date(ord.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <Link
                  key={ord.id}
                  href={`/order/${ord.id}`}
                  className="block rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 hover:border-emerald-500 transition-all shadow-xs group"
                >
                  <div className="flex items-start gap-3">
                    {/* Product Thumbnail */}
                    <div className="w-16 h-16 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                      {ord.product.image ? (
                        <img
                          src={ord.product.image}
                          alt={ord.product.title}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-slate-400" />
                      )}
                    </div>

                    {/* Order Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                          ID: #{ord.shortId}
                        </span>
                        <span className="text-[10px] text-slate-400">{dateStr}</span>
                      </div>

                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                        {ord.product.title}
                      </h3>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-sm font-black text-slate-900 dark:text-slate-100 font-mono">
                          {formatINR(ord.amountPaise)}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.color}`}
                          dangerouslySetInnerHTML={{ __html: statusInfo.label }}
                        />
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all self-center shrink-0" />
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}

      {/* Trust reassurance */}
      <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5 pt-4">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>Official Vercel Shop Customer Portal &bull; GST Invoices &bull; Live Status</span>
      </div>
    </div>
  );
}
