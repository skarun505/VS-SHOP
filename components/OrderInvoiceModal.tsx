"use client";

import React, { useState } from "react";
import { formatINR, maskSerialOrImei } from "@/lib/utils";
import { FileText, Printer, X, ShieldCheck } from "lucide-react";

interface OrderInvoiceModalProps {
  order: any;
  shipping: any;
  sellerDetails: any;
}

export function OrderInvoiceModal({ order, shipping, sellerDetails }: OrderInvoiceModalProps) {
  const [open, setOpen] = useState(false);

  const invoiceNo = order.invoiceNo || `RS-2026-${order.id.slice(-6).toUpperCase()}`;
  const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 transition-colors dark:bg-white dark:text-slate-900"
      >
        <FileText className="w-4 h-4 text-emerald-500" />
        <span>View GST Tax Invoice</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 my-8 text-slate-900 dark:text-slate-100 print:m-0 print:p-0 print:border-none print:shadow-none">
            {/* Header / Actions */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 print:hidden">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
                <span>GST Tax Invoice (Margin Scheme)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Invoice Printable Sheet */}
            <div className="space-y-6 text-xs" id="invoice-sheet">
              {/* Seller & Invoice Meta */}
              <div className="flex flex-col sm:flex-row justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
                <div>
                  <img
                    src="/logo.png"
                    alt="Vercel Shop"
                    className="h-8 w-auto mb-2 object-contain"
                  />
                  <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                    {sellerDetails.legalName}
                  </h2>
                  <div className="text-slate-500 mt-1 max-w-xs">{sellerDetails.address}</div>
                  <div className="mt-2 space-y-0.5 font-mono text-slate-700 dark:text-slate-300">
                    <div>GSTIN: <span className="font-bold">{sellerDetails.gstin}</span></div>
                    <div>PAN: {sellerDetails.pan} &bull; State Code: {sellerDetails.stateCode}</div>
                    <div>Support: {sellerDetails.phone}</div>
                  </div>
                </div>

                <div className="sm:text-right space-y-1">
                  <div className="text-xl font-black text-emerald-600">TAX INVOICE</div>
                  <div className="font-mono font-bold text-sm text-slate-800 dark:text-slate-200">
                    Invoice No: {invoiceNo}
                  </div>
                  <div className="text-slate-500">Invoice Date: {orderDate}</div>
                  <div className="font-mono text-slate-500">Order ID: {order.id}</div>
                  {order.utr && (
                    <div className="font-mono text-emerald-600 font-semibold">
                      Payment Ref: {order.utr}
                    </div>
                  )}
                </div>
              </div>

              {/* Bill To & Ship To */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="text-[11px] font-bold uppercase text-slate-400">Bill To / Ship To:</div>
                  <div className="font-bold text-sm mt-1">{shipping.name}</div>
                  <div className="text-slate-600 dark:text-slate-400 mt-0.5">{shipping.address}</div>
                  <div className="text-slate-600 dark:text-slate-400">
                    {shipping.city}, {shipping.state} - {shipping.pincode}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">Mobile: +91 {shipping.phone}</div>
                </div>

                <div className="sm:text-right">
                  <div className="text-[11px] font-bold uppercase text-slate-400">Transaction Mode:</div>
                  <div className="font-semibold mt-1">
                    {order.paymentMode === "MANUAL_UPI" ? "Direct UPI Transfer" : "Razorpay Payment Gateway"}
                  </div>
                  <div className="text-slate-500 mt-1">
                    Status: <span className="font-bold text-emerald-600">{order.status}</span>
                  </div>
                  <div className="text-slate-500">
                    Warranty Window: {order.unit.product.warrantyMonths} Months Active
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-300 dark:border-slate-700 font-bold text-[11px] uppercase text-slate-500">
                      <th className="py-2">Item Description</th>
                      <th className="py-2">Model</th>
                      <th className="py-2">Grade</th>
                      <th className="py-2">IMEI / Serial</th>
                      <th className="py-2 text-right">Taxable Margin / Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="py-3 font-semibold">
                        {order.unit.product.title}
                        <div className="text-[10px] text-slate-400 font-normal">
                          Disclosed repair: {order.unit.repairNotes || "None"}
                        </div>
                      </td>
                      <td className="py-3 font-mono">{order.unit.product.modelNumber}</td>
                      <td className="py-3 font-bold text-emerald-600">{order.unit.grade}</td>
                      <td className="py-3 font-mono">{maskSerialOrImei(order.unit.serialOrImei)}</td>
                      <td className="py-3 text-right font-bold">{formatINR(order.amountPaise)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Totals and GST declaration */}
              <div className="flex flex-col sm:flex-row justify-between gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="max-w-md space-y-1 text-[11px] text-slate-500">
                  <div className="font-bold text-slate-700 dark:text-slate-300">GST Declaration (Margin Scheme):</div>
                  <p>
                    Invoice issued under Rule 32(5) of CGST Rules, 2017 (Goods sold under margin scheme for pre-owned / tested electronics). GST is applicable on the value of margin only.
                  </p>
                </div>

                <div className="space-y-1.5 min-w-[200px] text-right">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-semibold">{formatINR(order.amountPaise)}</span>
                  </div>
                  {order.discountPaise > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount:</span>
                      <span>- {formatINR(order.discountPaise)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping:</span>
                    <span>₹0.00</span>
                  </div>
                  <div className="flex justify-between text-base font-black border-t border-slate-200 dark:border-slate-700 pt-2 text-slate-900 dark:text-white">
                    <span>Total Paid:</span>
                    <span>{formatINR(order.amountPaise)}</span>
                  </div>
                </div>
              </div>

              {/* Authorized Signatory */}
              <div className="pt-8 flex justify-between items-end text-[11px] text-slate-500">
                <div>
                  This is an electronically generated authentic tax invoice.<br />
                  For warranty claims, present this invoice and device serial.
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-700 dark:text-slate-300">
                    For {sellerDetails.legalName}
                  </div>
                  <div className="mt-8 text-slate-400 font-serif italic text-xs">
                    Authorized Signatory
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
