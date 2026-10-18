"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ConditionBadge } from "./ConditionBadge";
import { WarrantyStrip } from "./WarrantyStrip";
import { formatINR, maskSerialOrImei } from "@/lib/utils";
import {
  ShieldCheck,
  Lock,
  QrCode,
  Copy,
  Check,
  Clock,
  ArrowRight,
  ExternalLink,
  AlertCircle,
  Sparkles,
  Smartphone,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface UnitWithProduct {
  id: string;
  serialOrImei: string;
  grade: string;
  source: string;
  pricePaise: number;
  floorPaise: number;
  batteryHealth?: number | null;
  repairNotes?: string | null;
  product: {
    id: string;
    title: string;
    brand: string;
    modelNumber: string;
    mrp: number;
    images: string;
    warrantyMonths: number;
    returnDays: number;
  };
}

interface CheckoutFlowProps {
  unit: UnitWithProduct;
  initialCoupon?: string;
}

export function CheckoutFlow({ unit, initialCoupon }: CheckoutFlowProps) {
  const router = useRouter();

  // Shipping form state
  const [shipping, setShipping] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "Karnataka",
    pincode: "",
  });

  // Coupon state
  const [couponCode, setCouponCode] = useState(initialCoupon || "");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(initialCoupon || null);
  const [couponDiscountPaise, setCouponDiscountPaise] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Checkout submission state
  const [step, setStep] = useState<"shipping" | "payment">("shipping");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Manual payment state
  const [orderData, setOrderData] = useState<{
    orderId: string;
    shortOrderId: string;
    amount: number;
    vpa: string;
    payeeName: string;
    upiLink: string;
    appLinks: { phonepe: string; gpay: string; paytm: string; generic: string };
    qrCode: string;
  } | null>(null);

  // UTR submission state
  const [utr, setUtr] = useState("");
  const [payerName, setPayerName] = useState("");
  const [submittingUtr, setSubmittingUtr] = useState(false);
  const [utrError, setUtrError] = useState<string | null>(null);
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [paymentModeTab, setPaymentModeTab] = useState<"app" | "qr">("app");

  // Countdown timer for 30 minutes
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(30 * 60);

  useEffect(() => {
    if (step !== "payment") return;
    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  // Apply initial coupon if provided
  useEffect(() => {
    if (initialCoupon) {
      applyCoupon(initialCoupon);
    }
  }, [initialCoupon]);

  const applyCoupon = async (codeToApply: string) => {
    if (!codeToApply.trim()) return;
    setIsApplyingCoupon(true);
    setCouponMessage(null);

    try {
      const res = await fetch("/api/coupons/exit-offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unitId: unit.id, code: codeToApply.trim() }),
      });
      const data = await res.json();

      if (data.ok) {
        setAppliedCoupon(data.code);
        setCouponDiscountPaise(data.savingsPaise);
        setCouponMessage(`Promo code applied! Saved ${formatINR(data.savingsPaise)}`);
      } else {
        setAppliedCoupon(null);
        setCouponDiscountPaise(0);
        setCouponMessage(data.error || "Unable to apply coupon");
      }
    } catch {
      setCouponMessage("Failed to validate coupon");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const payableAmount = Math.max(unit.pricePaise - couponDiscountPaise, unit.floorPaise);

  const handleInitiateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Basic validation
    if (!shipping.name || !shipping.phone || !shipping.address || !shipping.city || !shipping.pincode) {
      setErrorMsg("Please fill in all shipping details");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(shipping.phone)) {
      setErrorMsg("Please enter a valid 10-digit Indian mobile number");
      return;
    }
    if (!/^\d{6}$/.test(shipping.pincode)) {
      setErrorMsg("Please enter a valid 6-digit postal pincode");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId: unit.id,
          couponCode: appliedCoupon,
          shipping,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to create order");
        setLoading(false);
        return;
      }

      if (data.mode === "manual") {
        setOrderData(data);
        setPayerName(shipping.name);
        setStep("payment");
      } else {
        // Razorpay flow (Section 6.3)
        const options = {
          key: data.key,
          amount: data.amount,
          currency: "INR",
          order_id: data.rzpOrderId,
          name: "Vercel Shop",
          description: data.description,
          handler: async (response: any) => {
            await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            router.push(`/order/${data.orderId}`);
          },
          prefill: {
            name: shipping.name,
            contact: shipping.phone,
          },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Checkout connection error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderData) return;
    setUtrError(null);

    const cleanUtr = utr.trim();
    if (!/^\d{12}$/.test(cleanUtr)) {
      setUtrError("UTR must be exactly 12 numeric digits from your UPI transaction receipt");
      return;
    }
    if (!payerName.trim()) {
      setUtrError("Please enter the name of the bank account holder who paid");
      return;
    }

    setSubmittingUtr(true);

    try {
      const res = await fetch("/api/checkout/submit-utr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderData.orderId,
          utr: cleanUtr,
          payerName: payerName.trim(),
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setUtrError(result.error || "Failed to register UTR");
        setSubmittingUtr(false);
        return;
      }

      // Success: redirect to order status timeline
      router.push(`/order/${orderData.orderId}?just_ordered=1`);
    } catch (err: any) {
      setUtrError(err.message || "Network error while submitting UTR");
      setSubmittingUtr(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  const handlePasteUtr = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const clean = text.replace(/\D/g, "").slice(0, 12);
      if (clean) setUtr(clean);
    } catch {
      // Browser permissions or unsupported
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  let images: string[] = [];
  try {
    images = JSON.parse(unit.product.images);
  } catch {
    images = [];
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
      {/* Top Breadcrumb & Security Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 sm:pb-4 gap-2">
        <button
          onClick={() => (step === "payment" ? setStep("shipping") : router.back())}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1.5 self-start"
        >
          <ChevronLeft className="w-4 h-4" />
          {step === "payment" ? "Edit Shipping Details" : "Back to Product"}
        </button>

        <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-500">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>256-Bit SSL Encrypted &bull; Guaranteed Delivery</span>
        </div>
      </div>

      {/* Mobile Collapsible Order Summary Card (Only on Mobile) */}
      <div className="lg:hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
          className="w-full px-4 py-3 flex items-center justify-between text-left bg-slate-50/70 dark:bg-slate-850/60 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 shrink-0 flex items-center justify-center">
              <img
                src={images[0] || ""}
                alt={unit.product.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {unit.product.title}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1.5 mt-0.5">
                <span>{formatINR(payableAmount)}</span>
                <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                <span className="text-slate-500 font-normal flex items-center gap-0.5">
                  {mobileSummaryOpen ? "Hide breakdown" : "View breakdown"}
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      mobileSummaryOpen ? "rotate-180" : ""
                    }`}
                  />
                </span>
              </div>
            </div>
          </div>
          <span className="text-sm font-black text-slate-900 dark:text-slate-100 shrink-0 font-mono">
            {formatINR(payableAmount)}
          </span>
        </button>

        {mobileSummaryOpen && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-xs bg-white dark:bg-slate-900">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Listing Price</span>
              <span className="font-semibold">{formatINR(unit.pricePaise)}</span>
            </div>
            {couponDiscountPaise > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Coupon Discount ({appliedCoupon})
                </span>
                <span>- {formatINR(couponDiscountPaise)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Insured Shipping</span>
              <span className="text-emerald-600 font-bold uppercase text-[10px] bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                Free
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>GST Tax (Margin Scheme)</span>
              <span>Included</span>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between font-bold text-slate-900 dark:text-slate-100">
              <span>Total Amount</span>
              <span className="text-sm font-black font-mono">{formatINR(payableAmount)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Column: Flow Screens */}
        <div className="lg:col-span-7">
          {step === "shipping" ? (
            /* STEP 1: SHIPPING ADDRESS */
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xs space-y-5 sm:space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">
                  Delivery Address &amp; Contact
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  We require this for the GST tax invoice and insured door delivery.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleInitiateOrder} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="e.g. Rahul Sharma"
                      value={shipping.name}
                      onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
                      className="w-full px-3.5 py-3 sm:py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      10-Digit Mobile (For Delivery OTP) *
                    </label>
                    <input
                      type="tel"
                      required
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="e.g. 9876543210"
                      maxLength={10}
                      value={shipping.phone}
                      onChange={(e) => setShipping({ ...shipping, phone: e.target.value.replace(/\D/g, "") })}
                      className="w-full px-3.5 py-3 sm:py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Street Address / House No. / Flat / Landmark *
                  </label>
                  <textarea
                    required
                    rows={2}
                    autoComplete="street-address"
                    placeholder="e.g. Flat 402, Sunshine Heights, 12th Cross, Indiranagar"
                    value={shipping.address}
                    onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                    className="w-full px-3.5 py-3 sm:py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      autoComplete="address-level2"
                      placeholder="Bangalore"
                      value={shipping.city}
                      onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                      className="w-full px-3.5 py-3 sm:py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      autoComplete="address-level1"
                      value={shipping.state}
                      onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                      className="w-full px-3.5 py-3 sm:py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Postal Pincode *
                    </label>
                    <input
                      type="text"
                      required
                      inputMode="numeric"
                      autoComplete="postal-code"
                      placeholder="560038"
                      maxLength={6}
                      value={shipping.pincode}
                      onChange={(e) => setShipping({ ...shipping, pincode: e.target.value.replace(/\D/g, "") })}
                      className="w-full px-3.5 py-3 sm:py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>
                </div>

                {/* Promo Code box */}
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Promo / Coupon Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter EXIT5"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-mono text-base sm:text-sm uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                    <button
                      type="button"
                      onClick={() => applyCoupon(couponCode)}
                      disabled={isApplyingCoupon || !couponCode}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 shrink-0"
                    >
                      {isApplyingCoupon ? "Checking..." : "Apply"}
                    </button>
                  </div>
                  {couponMessage && (
                    <div
                      className={`text-xs mt-1.5 ${
                        appliedCoupon ? "text-emerald-600 font-medium" : "text-amber-600"
                      }`}
                    >
                      {couponMessage}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:bg-slate-300"
                  >
                    {loading ? (
                      <span>Reserving Unit &bull; Generating Payment Link...</span>
                    ) : (
                      <>
                        <span>Reserve Unit &amp; Pay {formatINR(payableAmount)}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <div className="text-center text-[11px] text-slate-500 mt-2">
                    Clicking locks this unique unit for you for 30 minutes.
                  </div>
                </div>
              </form>
            </div>
          ) : (
            /* STEP 2: MANUAL UPI PAYMENT (Section 6B) */
            orderData && (
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xs space-y-5 sm:space-y-6">
                {/* Hold Timer Banner */}
                <div className="p-3 sm:p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-amber-800 dark:text-amber-300">
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <Clock className="w-4 h-4 animate-spin text-amber-600" />
                    <span>Unit Reserved For:</span>
                  </div>
                  <span className="font-mono text-sm font-black bg-amber-200/60 dark:bg-amber-950 px-2 py-0.5 rounded">
                    {formatTimer(timeLeftSeconds)}
                  </span>
                </div>

                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">
                    Pay with UPI (Instant Verification)
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Pay exactly <strong className="text-emerald-600 font-bold">{formatINR(orderData.amount)}</strong>.
                    Amount and order reference are locked in the link &amp; QR code.
                  </p>
                </div>

                {/* Mobile View Switcher (1-Click App vs Scan QR) */}
                <div className="sm:hidden grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setPaymentModeTab("app")}
                    className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      paymentModeTab === "app"
                        ? "bg-white dark:bg-slate-900 text-emerald-600 shadow-xs"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Open UPI App</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentModeTab("qr")}
                    className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      paymentModeTab === "qr"
                        ? "bg-white dark:bg-slate-900 text-emerald-600 shadow-xs"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Scan QR Code</span>
                  </button>
                </div>

                {/* UPI Payment Container */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 items-center p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800">
                  {/* QR Code Column (Hidden on mobile if tab is 'app') */}
                  <div
                    className={`flex flex-col items-center ${
                      paymentModeTab === "app" ? "hidden sm:flex" : "flex"
                    }`}
                  >
                    <div className="w-44 h-44 sm:w-48 sm:h-48 bg-white p-2.5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center">
                      {orderData.qrCode ? (
                        <img
                          src={orderData.qrCode}
                          alt="UPI Payment QR Code"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <QrCode className="w-24 h-24 text-slate-400" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 mt-2 text-center font-medium">
                      Scan with any UPI App (GPay, PhonePe, Paytm, CRED)
                    </span>
                  </div>

                  {/* Direct Mobile Links Column (Hidden on mobile if tab is 'qr') */}
                  <div
                    className={`space-y-3.5 w-full ${
                      paymentModeTab === "qr" ? "hidden sm:block" : "block"
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Tap to Pay with Installed App:
                    </div>

                    <a
                      href={orderData.upiLink}
                      className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors active:scale-98"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Open Any UPI App</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-70" />
                    </a>

                    <div className="grid grid-cols-3 gap-2">
                      <a
                        href={orderData.appLinks.phonepe}
                        className="py-2.5 px-1 text-center rounded-xl bg-indigo-600 text-white text-[11px] font-bold hover:bg-indigo-500 transition-colors shadow-xs"
                      >
                        PhonePe
                      </a>
                      <a
                        href={orderData.appLinks.gpay}
                        className="py-2.5 px-1 text-center rounded-xl bg-blue-600 text-white text-[11px] font-bold hover:bg-blue-500 transition-colors shadow-xs"
                      >
                        Google Pay
                      </a>
                      <a
                        href={orderData.appLinks.paytm}
                        className="py-2.5 px-1 text-center rounded-xl bg-sky-600 text-white text-[11px] font-bold hover:bg-sky-500 transition-colors shadow-xs"
                      >
                        Paytm
                      </a>
                    </div>

                    {/* VPA Copy Fallback (Section 6B.3) */}
                    <div className="pt-1">
                      <div className="text-[11px] text-slate-500 mb-1 font-medium">
                        UPI ID / VPA:
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                        <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold select-all text-xs truncate mr-2">
                          {orderData.vpa}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(orderData.vpa)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold flex items-center gap-1 transition-colors shrink-0"
                        >
                          {copiedVpa ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3: Enter 12-Digit UTR */}
                <div className="p-4 sm:p-5 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20 space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                      Step 2: Confirm Payment
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                      Enter the 12-Digit UTR / Transaction Ref No.
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      After completing the payment in your UPI app, copy the 12-digit UTR from your transaction details and paste it below.
                    </p>
                  </div>

                  {utrError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{utrError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmitUtr} className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                          12-Digit Bank UTR / UPI Ref ID *
                        </label>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {utr.length}/12 Digits
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          inputMode="numeric"
                          maxLength={12}
                          placeholder="e.g. 428901928374"
                          value={utr}
                          onChange={(e) => setUtr(e.target.value.replace(/\D/g, ""))}
                          className="w-full pl-3.5 pr-20 py-3 sm:py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-base font-bold tracking-widest text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={handlePasteUtr}
                          className="absolute right-2 top-2 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-colors"
                        >
                          Paste
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Payer Bank Account Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Name as registered on bank account"
                        value={payerName}
                        onChange={(e) => setPayerName(e.target.value)}
                        className="w-full px-3.5 py-3 sm:py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingUtr || utr.length !== 12}
                      className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
                    >
                      {submittingUtr ? (
                        <span>Validating UTR &amp; Extending Hold...</span>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Submit UTR &amp; Secure Order</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Section 6B.8 copy */}
                  <div className="pt-2 text-[11px] text-slate-500 space-y-1">
                    <div>&bull; We confirm within 30 minutes (9am to 9pm). Your unit stays reserved for 12 hours once UTR is submitted.</div>
                    <div>&bull; Wrong amount or no credit received? We refund within 3 working days.</div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Right Column: Order Summary & Selected Unit Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
              Order Item Summary
            </h3>

            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-950 p-2 shrink-0 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                <img
                  src={images[0] || ""}
                  alt={unit.product.title}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">
                  {unit.product.brand} &bull; {unit.product.modelNumber}
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2">
                  {unit.product.title}
                </h4>
                <div className="flex items-center gap-2 pt-1">
                  <ConditionBadge grade={unit.grade} size="sm" />
                  <span className="text-xs font-mono text-slate-500">
                    IMEI: {maskSerialOrImei(unit.serialOrImei)}
                  </span>
                </div>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Unit Listing Price</span>
                <span className="font-semibold">{formatINR(unit.pricePaise)}</span>
              </div>

              {couponDiscountPaise > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Coupon Discount ({appliedCoupon})
                  </span>
                  <span>- {formatINR(couponDiscountPaise)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Insured Doorstep Shipping</span>
                <span className="text-emerald-600 font-bold uppercase text-[10px] bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                  Free
                </span>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>GST Tax (Margin Scheme)</span>
                <span>Included in Price</span>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline text-sm">
                <span className="font-bold text-slate-900 dark:text-slate-100">Total Payable</span>
                <span className="text-xl font-black text-slate-900 dark:text-slate-100">
                  {formatINR(payableAmount)}
                </span>
              </div>
            </div>
          </div>

          <WarrantyStrip
            warrantyMonths={unit.product.warrantyMonths}
            returnDays={unit.product.returnDays}
          />

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Buyer Protection Guarantee</span>
            </div>
            <p className="leading-relaxed">
              If the device received does not match the exact IMEI, condition grade, or repair disclosure specified, return it within 7 days for a 100% refund.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
