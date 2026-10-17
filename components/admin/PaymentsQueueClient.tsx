"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatINR, maskSerialOrImei } from "@/lib/utils";
import { CheckCircle2, XCircle, AlertCircle, Copy, Check, Clock, ExternalLink } from "lucide-react";

interface OrderItem {
  id: string;
  amountPaise: number;
  utr: string | null;
  payerName: string | null;
  utrSubmittedAt: Date | string | null;
  screenshotUrl: string | null;
  status: string;
  unit: {
    id: string;
    serialOrImei: string;
    grade: string;
    product: {
      title: string;
      modelNumber: string;
    };
  };
}

export function PaymentsQueueClient({ initialOrders }: { initialOrders: OrderItem[] }) {
  const [orders, setOrders] = useState<OrderItem[]>(initialOrders);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const copyUtr = (utr: string) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtr(utr);
    setTimeout(() => setCopiedUtr(null), 2000);
  };

  const handleAction = async (orderId: string, action: "verify" | "reject", reason?: string) => {
    setProcessingId(orderId);
    setActionMessage(null);

    try {
      const res = await fetch("/api/admin/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          action,
          reason,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        setActionMessage(
          action === "verify"
            ? `Order #${orderId.slice(-6).toUpperCase()} verified! Unit marked SOLD & Invoice generated.`
            : `Order #${orderId.slice(-6).toUpperCase()} rejected. Unit released back to inventory.`
        );
      } else {
        alert(data.error || "Action failed");
      }
    } catch {
      alert("Network error");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {actionMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Queue Clear! No Pending UTR Submissions
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All submitted bank credits have been verified. Any new customer UTR submissions will appear here instantly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-slate-800 dark:text-slate-200">
                    Order #{ord.id.slice(-8).toUpperCase()}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-bold">
                    PAYMENT_SUBMITTED
                  </span>
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    Submitted: {ord.utrSubmittedAt ? new Date(ord.utrSubmittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Expected Credit */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="text-slate-400 uppercase font-semibold text-[10px]">
                    Expected Bank Credit
                  </div>
                  <div className="text-xl font-black text-emerald-600">
                    {formatINR(ord.amountPaise)}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Payer Name: <strong className="text-slate-800 dark:text-slate-200">{ord.payerName}</strong>
                  </div>
                </div>

                {/* 12-Digit UTR */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="text-slate-400 uppercase font-semibold text-[10px]">
                    Customer Submitted UTR
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-mono text-base font-bold text-slate-900 dark:text-slate-100 tracking-wider">
                      {ord.utr || "N/A"}
                    </span>
                    {ord.utr && (
                      <button
                        onClick={() => copyUtr(ord.utr!)}
                        className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                        title="Copy UTR to clipboard"
                      >
                        {copiedUtr === ord.utr ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400">Search this in your bank statement</div>
                </div>

                {/* Device details */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="text-slate-400 uppercase font-semibold text-[10px]">
                    Locked Inventory Unit
                  </div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                    {ord.unit.product.title}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    IMEI: ••••{ord.unit.serialOrImei.slice(-4)} &bull; Grade {ord.unit.grade}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Verify or Reject per Section 6B.6 */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs text-slate-500">
                  Check your bank account for credit of <strong>{formatINR(ord.amountPaise)}</strong> with Ref <strong>{ord.utr}</strong>.
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    disabled={processingId === ord.id}
                    onClick={() => {
                      const reason = prompt("Enter rejection reason (e.g. No credit received, wrong amount):");
                      if (reason !== null) {
                        handleAction(ord.id, "reject", reason);
                      }
                    }}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject &amp; Release Unit</span>
                  </button>

                  <button
                    disabled={processingId === ord.id}
                    onClick={() => handleAction(ord.id, "verify")}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify Credit &amp; Mark Sold</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
