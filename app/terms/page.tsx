import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { SELLER_DETAILS } from "@/lib/invoice";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <Link href="/" className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1.5 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
        </Link>
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100">
          Terms of Service &amp; Margin Scheme
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Operated by {SELLER_DETAILS.legalName} &bull; GSTIN: {SELLER_DETAILS.gstin}
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none text-xs text-slate-600 dark:text-slate-300 space-y-6">
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">1. Nature of Business</h2>
          <p>
            PristineTech sells certified pristine, open-box, and quality-tested electronic devices. In accordance with Rule 32(5) of the Central Goods and Services Tax (CGST) Rules, 2017, all second-hand and open-box goods are sold under the GST margin scheme. Tax invoices issued under this scheme reflect the purchase consideration and margin compliance.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">2. IMEI &amp; Hardware Verification</h2>
          <p>
            Prior to listing, all cellular and computing equipment are checked against official Indian CEIR and global IMEI blacklists to ensure zero counterfeit, lost, or stolen hardware. Customers receive the exact unit with the disclosed serial/IMEI number printed on their invoice.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">3. Non-Affiliation Trademark Notice</h2>
          <p>
            Product names, logos, brands, and other trademarks featured or referred to within the website are the property of their respective trademark holders. PristineTech is an independent testing, diagnostic, and certified hardware provider and is not endorsed or sponsored by Apple, Samsung, Sony, Dell, LG, or OnePlus.
          </p>
        </section>
      </div>
    </div>
  );
}
