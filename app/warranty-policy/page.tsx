import React from "react";
import Link from "next/link";
import { ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { SELLER_DETAILS } from "@/lib/invoice";

export default function WarrantyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <Link href="/" className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1.5 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
        </Link>
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100">
          PristineTech Hardware Warranty Policy
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Last Updated: 2026 &bull; Compliant with Indian E-Commerce Consumer Guidelines
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none text-xs text-slate-600 dark:text-slate-300 space-y-6">
        <section className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300">
          <h2 className="text-sm font-bold flex items-center gap-2 mb-2 text-emerald-900 dark:text-emerald-200">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Summary of Coverage: 6 to 12 Months Doorstep Protection
          </h2>
          <p>
            Every certified device sold on PristineTech carries a mandatory minimum 6-month limited hardware warranty (and up to 12 months for select open-box units as marked on your GST invoice).
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">1. What is Covered</h3>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Motherboard, processor, integrated GPU, and power logic board defects.</li>
            <li>Display touch responsiveness, digitizer failure, or unexplained vertical/horizontal panel lines not caused by physical impact.</li>
            <li>Camera sensor failure, mechanical optical image stabilization (OIS) defect, or autofocus failure.</li>
            <li>Microphone, ear-speaker, and stereo loudspeaker hardware degradation.</li>
            <li>Battery degradation dropping below 80% maximum capacity within the first 90 days.</li>
            <li>Charging port, vibration motor, Wi-Fi 6E/Bluetooth antennary failures.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">2. What is Not Covered</h3>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Physical damage, screen cracks, casing dents caused by drops or accidental impact after delivery.</li>
            <li>Liquid immersion, water ingress, or moisture damage (water resistance seals are not guaranteed on pre-owned items).</li>
            <li>Unauthorized third-party disassembly, rooting/jailbreaking, or modification of the firmware.</li>
            <li>Normal cosmetic wear and tear matching the documented purchase grade (A+, A, B, C).</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">3. How to Claim Warranty</h3>
          <p>
            Contact our WhatsApp Support Desk at <strong>{SELLER_DETAILS.phone}</strong> or email <strong>support@pristinetech.in</strong> with your Order ID and photo/video of the issue. We provide free doorstep courier pickup across 19,000+ Indian postal pincodes. Turnaround time for certified repair or replacement is 5 to 7 business days.
          </p>
        </section>
      </div>
    </div>
  );
}
