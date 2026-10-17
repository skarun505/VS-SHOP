import QRCode from "qrcode";

export interface UpiLinkOptions {
  vpa: string;
  payeeName: string;
  amountPaise: number;
  orderId: string;
  productTitle: string;
}

/**
 * Builds the standard dynamic UPI payment URL with auto-filled note and exact amount
 * (Section 6B.3 of guide.md)
 */
export function buildUpiLink(opts?: Partial<UpiLinkOptions>): string {
  const vpa = opts?.vpa || process.env.MERCHANT_VPA || "6380640087@upi";
  const amount = opts?.amountPaise ? (opts.amountPaise / 100).toFixed(2) : "0.00";
  const cleanTitle = (opts?.productTitle || "Vercel Shop").replace(/[^a-zA-Z0-9 ]/g, "").slice(0, 25);
  const note = `ORD-${opts?.orderId || "REF"} ${cleanTitle}`.slice(0, 50);

  const params = new URLSearchParams({
    pa: vpa,
    pn: opts?.payeeName || process.env.MERCHANT_NAME || "Vercel Shop",
    am: amount,
    cu: "INR",
    tn: note,
  });

  return `upi://pay?${params.toString()}`;
}

/**
 * Generates specific app deep links (GPay, PhonePe, Paytm)
 */
export function buildSpecificUpiLinks(opts: UpiLinkOptions) {
  const generic = buildUpiLink(opts);
  const queryString = generic.replace("upi://pay?", "");

  return {
    generic,
    phonepe: `phonepe://pay?${queryString}`,
    gpay: `tez://upi/pay?${queryString}`,
    paytm: `paytmmp://pay?${queryString}`,
  };
}

/**
 * Generates a base64 Data URL for the QR code of the dynamic UPI string
 */
export async function generateUpiQrCode(upiUrl: string): Promise<string> {
  try {
    return await QRCode.toDataURL(upiUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    });
  } catch (err) {
    console.error("Failed to generate UPI QR code:", err);
    return "";
  }
}
