import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Mail, Phone, MapPin, AlertTriangle } from "lucide-react";
import { SELLER_DETAILS } from "@/lib/invoice";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-white px-2.5 py-1.5 rounded-xl inline-block shadow-xs">
                <Image
                  src="/logo.png"
                  alt="Vercel Shop"
                  width={140}
                  height={38}
                  className="h-7 w-auto object-contain"
                />
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              India&apos;s premier certified pristine &amp; open-box electronics destination.
              Every single device is individually certified, factory calibrated, and backed
              by our comprehensive warranty and 7-day returns.
            </p>
            <div className="text-xs text-slate-400 space-y-1">
              <div>GSTIN: <span className="font-mono text-slate-200">{SELLER_DETAILS.gstin}</span></div>
              <div>CIN/PAN: <span className="font-mono text-slate-200">{SELLER_DETAILS.pan}</span></div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
              Product Categories
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/category/smartphones" className="hover:text-emerald-400 transition-colors">
                  Pristine Smartphones
                </Link>
              </li>
              <li>
                <Link href="/category/laptops" className="hover:text-emerald-400 transition-colors">
                  Open-Box &amp; Pristine Laptops
                </Link>
              </li>
              <li>
                <Link href="/category/televisions" className="hover:text-emerald-400 transition-colors">
                  Smart 4K &amp; OLED TVs
                </Link>
              </li>
              <li>
                <Link href="/category/appliances" className="hover:text-emerald-400 transition-colors">
                  Tested Home Appliances
                </Link>
              </li>
              <li>
                <Link href="/grading-guide" className="hover:text-emerald-400 transition-colors">
                  Quality Standards (Untouched to Mint)
                </Link>
              </li>
            </ul>
          </div>

          {/* Compliance & Consumer Protection (Section 9) */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
              Legal &amp; Consumer Policies
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/warranty-policy" className="hover:text-emerald-400 transition-colors">
                  Comprehensive Warranty Terms
                </Link>
              </li>
              <li>
                <Link href="/returns-policy" className="hover:text-emerald-400 transition-colors">
                  7-Day Return &amp; Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-emerald-400 transition-colors">
                  Terms of Service &amp; Margin Scheme
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-emerald-400 transition-colors">
                  Privacy Policy &amp; Data Deletion
                </Link>
              </li>
              <li>
                <Link href="/grievance" className="hover:text-emerald-400 transition-colors">
                  Consumer Grievance Redressal
                </Link>
              </li>
            </ul>
          </div>

          {/* Registered Office & Grievance Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
              Registered Office &amp; Help
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{SELLER_DETAILS.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Customer Care: {SELLER_DETAILS.phone} (9 AM - 8 PM IST)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>support@pristinetech.in</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer per Section 9 */}
        <div className="mt-10 pt-6 border-t border-slate-800 text-[11px] text-slate-500 space-y-2">
          <div className="flex items-center gap-2 text-slate-400 font-medium">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Trademark &amp; Non-Affiliation Disclaimer</span>
          </div>
          <p>
            Apple, Samsung, Sony, Dell, LG, OnePlus and other trademarks are the registered property of their respective owners. PristineTech is an independent testing, diagnostic, and certified electronics resale facility and is not an authorized distributor or affiliate of these manufacturers unless expressly stated. All devices undergo third-party multi-point certification.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-slate-500">
            <div>&copy; {new Date().getFullYear()} {SELLER_DETAILS.legalName}. All rights reserved.</div>
            <div className="mt-2 sm:mt-0">Payment Security: 256-Bit SSL Encrypted &bull; ISO 27001 Certified Gateway</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
