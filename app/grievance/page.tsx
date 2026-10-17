import React from "react";
import Link from "next/link";
import { ArrowLeft, UserCheck, Mail, Phone, MapPin } from "lucide-react";
import { SELLER_DETAILS } from "@/lib/invoice";

export default function GrievancePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <Link href="/" className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1.5 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
        </Link>
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100">
          Consumer Grievance Redressal Mechanism
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          In accordance with Rule 5(9) of the Consumer Protection (E-Commerce) Rules, 2020.
        </p>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <span>Designated Grievance Officer</span>
        </h2>

        <div className="text-xs space-y-2 text-slate-700 dark:text-slate-300">
          <div><strong>Officer Name:</strong> Rajesh Krishnan</div>
          <div><strong>Designation:</strong> Head of Consumer Support &amp; Compliance</div>
          <div className="flex items-center gap-2 pt-1">
            <Mail className="w-4 h-4 text-emerald-600" />
            <span>Email: <strong>grievance@pristinetech.in</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-600" />
            <span>Direct Line: <strong>{SELLER_DETAILS.phone}</strong> (Monday - Saturday, 10:00 AM to 6:00 PM IST)</span>
          </div>
          <div className="flex items-start gap-2 pt-1">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Address: {SELLER_DETAILS.address}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
          Complaints are acknowledged within 48 hours and redressed within 30 days from the date of receipt as mandated by law.
        </div>
      </div>
    </div>
  );
}
