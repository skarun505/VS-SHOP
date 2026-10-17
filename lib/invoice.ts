export interface InvoiceData {
  invoiceNo: string;
  orderId: string;
  orderDate: string;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  buyerCity: string;
  buyerState: string;
  buyerPincode: string;
  productTitle: string;
  serialOrImei: string;
  grade: string;
  hsnCode: string;
  amountPaise: number;
  discountPaise: number;
  paymentMode: string;
  utrOrPaymentId?: string;
  warrantyMonths: number;
}

export const SELLER_DETAILS = {
  legalName: "Vercel Shop Electronics Pvt Ltd",
  tradeName: "Vercel Shop",
  gstin: "27AABCU9603R1ZM",
  pan: "AABCU9603R",
  address: "Plot 42, Electronics Zone, Tech Corridor, Bangalore, Karnataka - 560100",
  email: "support@vercelshop.in",
  phone: "+91 98765 43210",
  stateCode: "29", // Karnataka
};

export function generateInvoiceNumber(orderId: string): string {
  const year = new Date().getFullYear();
  const shortId = orderId.slice(-6).toUpperCase();
  return `VS-${year}-${shortId}`;
}

export function formatINR(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}
