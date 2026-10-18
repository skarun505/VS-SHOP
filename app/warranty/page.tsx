import React from "react";
import Link from "next/link";
import { ShieldCheck, CheckCircle2, AlertCircle, Phone, ArrowLeft, Clock, Truck, FileText, Check, HelpCircle } from "lucide-react";
import { SELLER_DETAILS } from "@/lib/invoice";

export const metadata = {
  title: "Warranty & Doorstep Claims | PristineTech Certified",
  description: "Learn about PristineTech 6-12 month hardware warranty protection, doorstep courier pickup across India, and claim instructions.",
};

export default function WarrantyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 pb-24">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
        </Link>
        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
          Official GST Warranty
        </span>
      </div>

      {/* Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border border-emerald-800/40 p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Guaranteed Protection</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            6 to 12 Months Doorstep Hardware Warranty
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Every pristine device purchased on PristineTech comes backed with a full hardware warranty. In the rare event of a hardware issue, we provide <strong>free doorstep pickup</strong> across 19,000+ Indian pincodes.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <a
              href={`https://wa.me/91${SELLER_DETAILS.phone.replace(/[^0-9]/g, "")}?text=Hi%20PristineTech%2C%20I%20would%20like%20to%20claim%20warranty%20for%20my%20device.`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>Claim Warranty on WhatsApp</span>
            </a>
            <Link
              href="/order/lookup"
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 border border-white/20 active:scale-95 transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Check Order &amp; Invoice</span>
            </Link>
          </div>
        </div>

        <div className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none">
          <ShieldCheck className="w-64 h-64 text-emerald-400" />
        </div>
      </div>

      {/* 3 Step Warranty Process */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 font-black flex items-center justify-center text-sm">
            1
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Raise Claim Online</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Send us your Order ID or registered mobile number on WhatsApp. Our engineers diagnose the issue in under 2 hours.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 font-black flex items-center justify-center text-sm">
            2
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Free Doorstep Pickup</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Our insured courier partners collect your device from your doorstep in safe, tamper-evident packaging.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 font-black flex items-center justify-center text-sm">
            3
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Repair or Replacement</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            We repair using original OEM components or replace the unit if unrepairable. Shipped back in 5-7 business days.
          </p>
        </div>
      </div>

      {/* Coverage Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* What is Covered */}
        <div className="p-6 rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-4">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-black text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>What is 100% Covered</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Motherboard &amp; Processor:</strong> Logic board, GPU, SoC, and memory failures.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Touchscreen &amp; Display:</strong> Touch digitizer unresponsiveness, spontaneous panel lines without external crack.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Cameras &amp; Sensors:</strong> Optical Image Stabilization (OIS) defect, focus motor failure, FaceID / fingerprint scanner.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Battery Degradation:</strong> If maximum capacity drops below 80% during the first 90 days.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Connectivity:</strong> Wi-Fi, Bluetooth, 5G modem, charging port, microphones and speakers.</span>
            </li>
          </ul>
        </div>

        {/* What is Not Covered */}
        <div className="p-6 rounded-3xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 space-y-4">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-black text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <span>Exclusions &amp; Void Conditions</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <span className="w-4 h-4 text-rose-500 font-bold shrink-0 mt-0.5">&times;</span>
              <span><strong>Physical Impact:</strong> Drops, cracked screens, bent casing, or blunt force trauma occurring post-delivery.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-4 h-4 text-rose-500 font-bold shrink-0 mt-0.5">&times;</span>
              <span><strong>Liquid Ingress:</strong> Submersion, water or tea spills (waterproofing gaskets are non-guaranteed on refurbished items).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-4 h-4 text-rose-500 font-bold shrink-0 mt-0.5">&times;</span>
              <span><strong>Unauthorized Repair:</strong> Opening device screws or repairs done at non-authorized 3rd party shops.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-4 h-4 text-rose-500 font-bold shrink-0 mt-0.5">&times;</span>
              <span><strong>Software Jailbreak / Rooting:</strong> Flashing modified unofficial ROMs that brick the bootloader.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Helpful links */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Want to understand our 4-Tier Cosmetic Grades?</h3>
          <p className="text-xs text-slate-500">Read our strict grading guide for A+, A, B, and C condition benchmarks.</p>
        </div>
        <Link
          href="/grading-guide"
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-xs shrink-0"
        >
          View Cosmetic Grading Guide &rarr;
        </Link>
      </div>
    </div>
  );
}
