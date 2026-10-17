import React from "react";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <Link href="/" className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1.5 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
        </Link>
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100">
          Privacy Policy &amp; Data Sanitization
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Commitment to customer privacy and DoD 5220.22-M certified data wiping.
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none text-xs text-slate-600 dark:text-slate-300 space-y-6">
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">1. Pre-Ownership Data Sanitization</h2>
          <p>
            Every device received at our certification and diagnostic laboratories undergoes a cryptographic factory data wipe compliant with NIST SP 800-88 and DoD 5220.22-M standards. Zero previous user data, photos, accounts, or telemetry remain on any unit dispatched to a customer.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">2. Customer Information Usage</h2>
          <p>
            Customer name, delivery address, and telephone number are utilized exclusively to fulfill orders, transmit invoice documentation, dispatch courier parcels, and provide warranty support. We do not sell or monetize customer data.
          </p>
        </section>
      </div>
    </div>
  );
}
