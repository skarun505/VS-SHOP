import React from "react";
import Link from "next/link";
import { ShieldCheck, FileCheck, CheckCircle2, MessageCircle, MapPin, Lock } from "lucide-react";
import { SELLER_DETAILS } from "@/lib/invoice";

export function TrustBlock() {
  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 p-6 space-y-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          The Vercel Shop Quality &amp; Authenticity Guarantee
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 font-semibold text-sm text-slate-900 dark:text-slate-100 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Verified Hardware Testing
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Every device passes 42 individual laboratory diagnostics. Guaranteed to look and perform like brand new with zero operational compromises.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 font-semibold text-sm text-slate-900 dark:text-slate-100 mb-1">
            <FileCheck className="w-4 h-4 text-blue-600" />
            Official GST Tax Invoice
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Each shipment includes an official B2C or B2B Tax Invoice with registered GSTIN ({SELLER_DETAILS.gstin}), claiming margin scheme compliance.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 font-semibold text-sm text-slate-900 dark:text-slate-100 mb-1">
            <Lock className="w-4 h-4 text-indigo-600" />
            Encrypted &amp; Direct Payments
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Bank-grade verification with dynamic UPI deep links and Razorpay orders. No arbitrary price manipulation or hidden fees.
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>Tech Labs: Bangalore, Karnataka</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>WhatsApp Support: {SELLER_DETAILS.phone}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/warranty-policy" className="text-emerald-600 hover:underline">
            Warranty Terms
          </Link>
          <span className="text-slate-300">&bull;</span>
          <Link href="/returns-policy" className="text-emerald-600 hover:underline">
            7-Day Return Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
