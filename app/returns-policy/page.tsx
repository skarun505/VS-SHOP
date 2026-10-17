import React from "react";
import Link from "next/link";
import { RotateCcw, CheckCircle2, ArrowLeft } from "lucide-react";
import { SELLER_DETAILS } from "@/lib/invoice";

export default function ReturnsPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <Link href="/" className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1.5 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
        </Link>
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100">
          7-Day No-Questions-Asked Return Policy
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete peace of mind for every certified purchase.
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none text-xs text-slate-600 dark:text-slate-300 space-y-6">
        <section className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-900 dark:text-blue-200">
          <h2 className="text-sm font-bold flex items-center gap-2 mb-2">
            <RotateCcw className="w-5 h-5 text-blue-600" />
            100% Refund Window: 7 Calendar Days from Delivery
          </h2>
          <p>
            If your received item differs in any way from the disclosed cosmetic grade, battery health score, or hardware functionality, or if you simply change your mind, you can initiate a full refund return within 7 calendar days of delivery.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">1. Return Eligibility Guidelines</h3>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>The item must be in the exact physical condition as delivered, matching the laboratory photos taken prior to dispatch.</li>
            <li>The serial number / IMEI must match the serial printed on your tax invoice and recorded in our database.</li>
            <li>All personal cloud accounts (Apple iCloud, Google Account, Samsung Account, Windows BitLocker) must be signed out and factory reset.</li>
            <li>All included original accessories (charging cables, power adapters, wall mounts, remote controls) must be returned in the box.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">2. Refund Processing Time</h3>
          <p>
            Once our verification team receives and scans the device (typically 48 hours after courier pickup), refunds are initiated directly to your original payment method:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>UPI &amp; Netbanking:</strong> Credited within 24 to 48 hours.</li>
            <li><strong>Credit &amp; Debit Cards:</strong> Credited within 3 to 5 banking business days.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
