import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ConditionBadge } from "@/components/ConditionBadge";
import { WarrantyStrip } from "@/components/WarrantyStrip";
import { OrderInvoiceModal } from "@/components/OrderInvoiceModal";
import { formatINR, maskSerialOrImei } from "@/lib/utils";
import { SELLER_DETAILS } from "@/lib/invoice";
import {
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  FileText,
  AlertTriangle,
  ArrowRight,
  Package,
} from "lucide-react";

interface OrderPageProps {
  params: {
    id: string;
  };
  searchParams: {
    just_ordered?: string;
  };
}

export default async function OrderPage({ params, searchParams }: OrderPageProps) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      unit: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  let shipping: any = {};
  try {
    shipping = JSON.parse(order.shippingJson);
  } catch {
    shipping = {};
  }

  let productImages: string[] = [];
  try {
    productImages = JSON.parse(order.unit.product.images);
  } catch {
    productImages = [];
  }

  // Determine timeline steps
  const steps = [
    {
      key: "CREATED",
      label: "Order Created",
      desc: "Unit locked in inventory",
      completed: true,
      current: order.status === "AWAITING_PAYMENT",
    },
    {
      key: "SUBMITTED",
      label: "Payment Submitted",
      desc: order.utr ? `UTR: ${order.utr}` : "Waiting for UPI transfer",
      completed: ["PAYMENT_SUBMITTED", "VERIFIED", "PAID", "SHIPPED", "DELIVERED"].includes(
        order.status
      ),
      current: order.status === "PAYMENT_SUBMITTED",
    },
    {
      key: "VERIFIED",
      label: "Bank Verified & Invoice Issued",
      desc: order.verifiedAt
        ? `Verified on ${new Date(order.verifiedAt).toLocaleDateString()}`
        : "Automated statement match",
      completed: ["VERIFIED", "PAID", "SHIPPED", "DELIVERED"].includes(order.status),
      current: ["VERIFIED", "PAID"].includes(order.status),
    },
    {
      key: "SHIPPED",
      label: "Dispatched with Courier",
      desc: "Insured express delivery",
      completed: ["SHIPPED", "DELIVERED"].includes(order.status),
      current: order.status === "SHIPPED",
    },
    {
      key: "DELIVERED",
      label: "Delivered to Doorstep",
      desc: "7-day return period begins",
      completed: order.status === "DELIVERED",
      current: order.status === "DELIVERED",
    },
  ];

  const isVerifiedOrPaid = ["VERIFIED", "PAID", "SHIPPED", "DELIVERED"].includes(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Just Ordered Banner */}
      {searchParams.just_ordered && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <div className="text-sm font-bold">Order Registered Successfully!</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Your unit is safely reserved. Our verification desk is confirming your payment.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-500 mb-1">
            <span>ORDER #{order.id.slice(-8).toUpperCase()}</span>
            <span>&bull;</span>
            <span>Placed {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            Order Status &amp; Tracking
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <OrderInvoiceModal order={order} shipping={shipping} sellerDetails={SELLER_DETAILS} />
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          Fulfillment Timeline
        </h2>

        <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-6 pl-6">
          {steps.map((st, i) => (
            <div key={i} className="relative">
              {/* Circle Marker */}
              <div
                className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  st.completed
                    ? "bg-emerald-600 text-white"
                    : st.current
                    ? "bg-amber-500 text-white animate-pulse"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                }`}
              >
                {st.completed ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>

              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>{st.label}</span>
                  {st.current && (
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full">
                      Current Stage
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{st.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {order.status === "PAYMENT_SUBMITTED" && (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Bank credit verification is in progress (usually completed in 15-30 minutes during 9am - 9pm).
              Your unit remains locked in reserved status.
            </span>
          </div>
        )}
      </div>

      {/* Item & Shipping Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Device details */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
            Purchased Device
          </h3>

          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-950 p-2 shrink-0 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
              <img
                src={productImages[0] || ""}
                alt={order.unit.product.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-500 uppercase">
                {order.unit.product.brand} &bull; {order.unit.product.modelNumber}
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {order.unit.product.title}
              </h4>
              <div className="flex items-center gap-2 pt-1">
                <ConditionBadge grade={order.unit.grade} size="sm" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between">
              <span>IMEI / Serial No:</span>
              <span className="font-mono font-medium text-slate-900 dark:text-slate-200">
                {maskSerialOrImei(order.unit.serialOrImei)}
              </span>
            </div>
            {order.unit.batteryHealth && (
              <div className="flex justify-between">
                <span>Battery Health:</span>
                <span className="font-semibold text-emerald-600">{order.unit.batteryHealth}%</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Paid Amount:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {formatINR(order.amountPaise)}
              </span>
            </div>
            {order.utr && (
              <div className="flex justify-between">
                <span>UTR Reference:</span>
                <span className="font-mono text-emerald-600 font-bold">{order.utr}</span>
              </div>
            )}
          </div>
        </div>

        {/* Shipping details */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
            Delivery Destination
          </h3>

          <div className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
            <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{shipping.name}</div>
            <div>Phone: +91 {shipping.phone}</div>
            <div className="text-slate-500 pt-1">{shipping.address}</div>
            <div className="text-slate-500">
              {shipping.city}, {shipping.state} - {shipping.pincode}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1.5">
              <Truck className="w-4 h-4" />
              <span>Free Insured Express Delivery Included</span>
            </div>
          </div>
        </div>
      </div>

      <WarrantyStrip
        warrantyMonths={order.unit.product.warrantyMonths}
        returnDays={order.unit.product.returnDays}
      />
    </div>
  );
}
