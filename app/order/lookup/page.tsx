"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, ShieldCheck } from "lucide-react";

export default function OrderLookupPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    router.push(`/order/${orderId.trim()}`);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center">
          <Search className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
          Track Your PristineTech Order
        </h1>
        <p className="text-xs text-slate-500">
          Enter your Order ID (received upon checkout or in SMS/WhatsApp)
        </p>
      </div>

      <form onSubmit={handleLookup} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Order Reference ID
          </label>
          <input
            type="text"
            required
            placeholder="e.g. clx..."
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <span>Find Order &amp; Invoice</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>Official PristineTech Order Verification Portal</span>
      </div>
    </div>
  );
}
