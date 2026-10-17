# Refurbished Electronics Store: Cursor Build Guide

> Drop this file into your Cursor project root. Tell Cursor: "Read guide.md and build it phase by phase. Do not skip phases."

## 0. What we are building

An ecommerce store selling **refurbished, open-box and repaired** electronics (phones, TVs, washing machines, laptops) at low prices.

Non-negotiable rules baked into the build (they protect you and make the store convert):

1. Every product shows its **real model, condition grade, and repair disclosure**. No listing may say "new" or hide that it was repaired.
2. Every product has a **warranty** and a **return window**, shown above the Buy button.
3. Payments go through **Razorpay (or Cashfree)**, never straight to a personal UPI ID. The gateway gives you dynamic UPI links, order notes, webhooks, refunds, settlement records and GST-ready reports.
4. Trust elements are **real** (verified reviews, actual warranty, real GST invoice, IMEI/serial shown). No fake badges or fake countdowns.
5. The 5% exit offer is a real coupon, applied by the server, and the price floor still keeps your margin.

---

## 1. Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| DB | PostgreSQL (Supabase or Neon) + Prisma |
| Auth | NextAuth (phone OTP via MSG91 or Twilio) |
| Payments | Razorpay Orders + Checkout (UPI intent, QR, cards, netbanking) |
| Storage | Cloudinary (product photos, repair proof photos) |
| Email / WhatsApp | Resend + WhatsApp Cloud API (order updates) |
| Hosting | Vercel + managed Postgres |
| Analytics | GA4 + Meta Pixel (server-side purchase event) |

---

## 2. Folder structure

```
/app
  /(shop)
    page.tsx                      # home
    /category/[slug]/page.tsx
    /product/[slug]/page.tsx      # product page with condition + warranty
    /cart/page.tsx
    /checkout/page.tsx            # pay page
    /order/[id]/page.tsx          # status + invoice
  /(admin)
    /admin/products/page.tsx
    /admin/inventory/page.tsx
    /admin/orders/page.tsx
  /api
    /checkout/create-order/route.ts
    /checkout/verify/route.ts
    /webhooks/razorpay/route.ts
    /coupons/exit-offer/route.ts
    /inventory/reserve/route.ts
/components
  ProductCard.tsx
  ConditionBadge.tsx
  WarrantyStrip.tsx
  RepairDisclosure.tsx
  PayButton.tsx
  ExitIntentOffer.tsx
  TrustBlock.tsx
/lib
  prisma.ts
  razorpay.ts
  pricing.ts
  grading.ts
  inventory.ts
  invoice.ts
/prisma/schema.prisma
.env.local
```

---

## 3. Environment variables

```
DATABASE_URL=
NEXTAUTH_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
CLOUDINARY_URL=
RESEND_API_KEY=
```

---

## 4. Database schema (Prisma)

```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }

enum Grade { A_PLUS A B C }              // cosmetic grade
enum Source { REFURBISHED OPEN_BOX REPAIRED PREOWNED }
enum OrderStatus { PENDING PAID FAILED SHIPPED DELIVERED CANCELLED REFUNDED }

model Product {
  id            String   @id @default(cuid())
  slug          String   @unique
  title         String                    // "Apple iPhone 15 Pro Max 256GB (Refurbished)"
  brand         String
  modelNumber   String                    // real model, never marketing fluff
  category      String
  description   String
  images        String[]
  mrp           Int                       // paise
  warrantyMonths Int     @default(6)
  returnDays    Int      @default(7)
  units         Unit[]
  createdAt     DateTime @default(now())
}

// Each physical item is its own row, because each has its own condition and price.
model Unit {
  id            String   @id @default(cuid())
  productId     String
  product       Product  @relation(fields: [productId], references: [id])
  serialOrImei  String   @unique
  grade         Grade
  source        Source
  costPaise     Int                       // what you paid + repair cost
  repairNotes   String?                   // e.g. "Screen replaced (OEM-grade), battery 91%"
  repairPhotos  String[]
  batteryHealth Int?
  pricePaise    Int
  floorPaise    Int                       // never sell below this
  status        String   @default("AVAILABLE") // AVAILABLE | RESERVED | SOLD
  reservedUntil DateTime?
}

model Order {
  id             String   @id @default(cuid())
  userId         String
  unitId         String   @unique
  amountPaise    Int
  couponCode     String?
  discountPaise  Int      @default(0)
  status         OrderStatus @default(PENDING)
  rzpOrderId     String?  @unique
  rzpPaymentId   String?
  shippingJson   Json
  invoiceNo      String?  @unique
  createdAt      DateTime @default(now())
}

model Coupon {
  code        String @id
  percentOff  Int
  maxUses     Int
  used        Int    @default(0)
  active      Boolean @default(true)
}
```

---

## 5. Core algorithms

### 5.1 Pricing with margin floor (`lib/pricing.ts`)

```ts
export const GRADE_DISCOUNT: Record<string, number> = {
  A_PLUS: 0.30, A: 0.38, B: 0.46, C: 0.55, // off MRP
};

export function suggestPrice(mrpPaise: number, grade: keyof typeof GRADE_DISCOUNT, costPaise: number) {
  const target = Math.round(mrpPaise * (1 - GRADE_DISCOUNT[grade]));
  const floor = Math.round(costPaise * 1.12); // minimum 12% margin over cost incl. repair
  return { price: Math.max(target, floor), floor };
}

// Exit offer is allowed only if the discounted price stays above the floor
export function applyExitOffer(pricePaise: number, floorPaise: number, percent = 5) {
  const discounted = Math.round(pricePaise * (1 - percent / 100));
  if (discounted < floorPaise) return { ok: false as const, discounted: pricePaise };
  return { ok: true as const, discounted };
}
```

### 5.2 Inventory reservation (prevents double-selling a unique unit)

```ts
// lib/inventory.ts
import { prisma } from "./prisma";

export async function reserveUnit(unitId: string, minutes = 10) {
  const until = new Date(Date.now() + minutes * 60_000);
  const res = await prisma.unit.updateMany({
    where: {
      id: unitId,
      OR: [{ status: "AVAILABLE" }, { status: "RESERVED", reservedUntil: { lt: new Date() } }],
    },
    data: { status: "RESERVED", reservedUntil: until },
  });
  return res.count === 1;
}
```

### 5.3 Condition grading rubric (`lib/grading.ts`, shown on product page)

| Grade | Meaning shown to customer |
|---|---|
| A+ | Like new, no visible marks, battery 90%+ |
| A | Minor hairline marks, fully functional |
| B | Visible scratches or dents, fully functional |
| C | Heavy cosmetic wear, fully functional |

Any unit with a replaced part must fill `repairNotes`. The product page must render it.

---

## 6. Payment flow (the custom part, done properly)

### 6.1 How the dynamic UPI link and notes work

You do not hand-build `upi://pay?pa=...` links. Razorpay creates an order with your amount and **notes** (product name, unit serial, order ID), and its checkout opens whichever UPI app the customer picks (GPay, PhonePe, Paytm, BHIM, CRED, etc.) with the amount locked and the order reference attached. Your own price and notes change per product automatically because they come from the server-created order.

Flow:

1. Customer clicks Buy. Server reserves the unit for 10 minutes.
2. Server creates a Razorpay order (amount from DB, never from the browser).
3. Browser opens Razorpay Checkout with UPI shown first.
4. Customer pays in their UPI app.
5. Razorpay calls your **webhook**. After verifying the signature, you mark the order PAID. This is the source of truth, not the browser redirect.
6. Send invoice and confirmation by email and WhatsApp.

### 6.2 Create order (`app/api/checkout/create-order/route.ts`)

```ts
import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reserveUnit } from "@/lib/inventory";
import { applyExitOffer } from "@/lib/pricing";

const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  const { unitId, userId, shipping, couponCode } = await req.json();

  const unit = await prisma.unit.findUnique({ where: { id: unitId }, include: { product: true } });
  if (!unit) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!(await reserveUnit(unitId))) {
    return NextResponse.json({ error: "Just sold. Try another unit." }, { status: 409 });
  }

  let amount = unit.pricePaise;
  let discount = 0;

  if (couponCode === "EXIT5") {
    const coupon = await prisma.coupon.findUnique({ where: { code: "EXIT5" } });
    if (coupon?.active && coupon.used < coupon.maxUses) {
      const r = applyExitOffer(unit.pricePaise, unit.floorPaise, coupon.percentOff);
      if (r.ok) { discount = unit.pricePaise - r.discounted; amount = r.discounted; }
    }
  }

  const order = await prisma.order.create({
    data: { userId, unitId, amountPaise: amount, discountPaise: discount,
            couponCode: discount ? couponCode : null, shippingJson: shipping },
  });

  const rzpOrder = await rzp.orders.create({
    amount,                       // paise
    currency: "INR",
    receipt: order.id,
    notes: {                      // these are your "auto notes"
      product: unit.product.title,
      grade: unit.grade,
      serial: unit.serialOrImei,
      order_id: order.id,
    },
  });

  await prisma.order.update({ where: { id: order.id }, data: { rzpOrderId: rzpOrder.id } });

  return NextResponse.json({
    orderId: order.id,
    rzpOrderId: rzpOrder.id,
    amount,
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    description: `${unit.product.title} (Grade ${unit.grade})`,
  });
}
```

### 6.3 Pay button (`components/PayButton.tsx`)

```tsx
"use client";
import Script from "next/script";

export function PayButton({ unitId, userId, shipping }: any) {
  async function pay() {
    const res = await fetch("/api/checkout/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unitId, userId, shipping }),
    });
    const d = await res.json();
    if (!res.ok) return alert(d.error);

    const rzp = new (window as any).Razorpay({
      key: d.key,
      amount: d.amount,
      currency: "INR",
      order_id: d.rzpOrderId,
      name: "YourStore",
      description: d.description,
      config: { display: { preferences: { show_default_blocks: true },
        sequence: ["block.upi", "block.cards", "block.netbanking"] } },
      handler: async (r: any) => {
        await fetch("/api/checkout/verify", { method: "POST",
          headers: { "Content-Type": "application/json" }, body: JSON.stringify(r) });
        window.location.href = `/order/${d.orderId}`;
      },
    });
    rzp.open();
  }

  return (<>
    <Script src="https://checkout.razorpay.com/v1/checkout.js" />
    <button onClick={pay} className="w-full rounded-xl bg-green-600 py-4 text-white font-semibold">
      Pay securely
    </button>
  </>);
}
```

### 6.4 Webhook (source of truth) (`app/api/webhooks/razorpay/route.ts`)

```ts
import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const raw = await req.text();                       // must be the raw body
  const sig = req.headers.get("x-razorpay-signature") || "";
  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(raw).digest("hex");

  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)))
    return NextResponse.json({ error: "bad signature" }, { status: 400 });

  const event = JSON.parse(raw);

  if (event.event === "payment.captured") {
    const p = event.payload.payment.entity;
    const order = await prisma.order.update({
      where: { rzpOrderId: p.order_id },
      data: { status: "PAID", rzpPaymentId: p.id },
    });
    await prisma.unit.update({ where: { id: order.unitId }, data: { status: "SOLD" } });
    // TODO: generate invoice, send email + WhatsApp
  }

  if (event.event === "payment.failed") {
    const p = event.payload.payment.entity;
    const order = await prisma.order.update({
      where: { rzpOrderId: p.order_id }, data: { status: "FAILED" },
    });
    await prisma.unit.update({
      where: { id: order.unitId }, data: { status: "AVAILABLE", reservedUntil: null },
    });
  }
  return NextResponse.json({ ok: true });
}
```

### 6.5 Client verify fallback (`app/api/checkout/verify/route.ts`)

```ts
import crypto from "crypto";
export async function POST(req: Request) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
  return Response.json({ valid: expected === razorpay_signature });
}
```

---

## 7. Exit-intent 5% offer

Show it once per session when the cursor leaves the viewport (desktop) or after 20s idle on the pay page (mobile). The server decides whether the discount is allowed (floor check above).

```tsx
"use client";
import { useEffect, useState } from "react";

export function ExitIntentOffer({ onApply }: { onApply: (code: string) => void }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("exit_shown")) return;
    const show = () => { setOpen(true); sessionStorage.setItem("exit_shown", "1"); };
    const onLeave = (e: MouseEvent) => { if (e.clientY <= 0) show(); };
    document.addEventListener("mouseleave", onLeave);
    const t = setTimeout(show, 20000);
    return () => { document.removeEventListener("mouseleave", onLeave); clearTimeout(t); };
  }, []);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50">
      <div className="max-w-sm rounded-2xl bg-white p-6 text-center">
        <h3 className="text-xl font-bold">Wait, take 5% off</h3>
        <p className="mt-2 text-sm text-gray-600">Applied automatically if you pay in the next 10 minutes.</p>
        <button className="mt-4 w-full rounded-xl bg-green-600 py-3 text-white"
                onClick={() => { onApply("EXIT5"); setOpen(false); }}>
          Apply 5% off
        </button>
        <button className="mt-2 text-sm text-gray-500" onClick={() => setOpen(false)}>No thanks</button>
      </div>
    </div>
  );
}
```

---

## 8. Product page requirements

Render in this order above the fold:

1. Title with the words **Refurbished** / **Repaired** / **Open-box** in it.
2. Price, MRP, and % saved.
3. `ConditionBadge` (grade + one-line meaning).
4. `WarrantyStrip`: "6-month warranty · 7-day return · GST invoice".
5. `RepairDisclosure`: parts replaced, battery health, test checklist passed, serial/IMEI (last 4 digits), repair photos.
6. Buy button.

`TrustBlock` contents (all must be true and verifiable):

- Real warranty terms page and returns page.
- Verified buyer reviews only (review allowed after delivered order).
- GST invoice with every order.
- Customer support WhatsApp number and registered business address in footer.
- Razorpay secure payment note (only after you are live on Razorpay).

---

## 9. Business and legal checklist (do before launch)

- Register the business (proprietorship or Pvt Ltd), get **GSTIN**. Refurbished goods can use the **margin scheme** (GST on margin), confirm with a CA.
- Razorpay KYC needs business PAN, bank account, website with policies live.
- Publish: Terms, Privacy, Refund and Return, Shipping, Warranty, Grievance Officer details (required under Indian e-commerce rules).
- Never use brand logos to imply authorisation. Say "Refurbished Apple iPhone", not "Apple Authorised".
- Keep supplier invoices and repair records per unit.
- Check IMEI against the CEIR/blacklist before listing phones.
- Sell only units you physically hold and have tested.

---

## 10. Build phases and Cursor prompts

Paste one prompt at a time. Do not move on until the previous phase runs.

**Phase 1: Setup**
> Read guide.md. Create a Next.js 14 TypeScript app with Tailwind and shadcn/ui, set up Prisma with the schema in section 4, and add a seed script with 10 sample products and 20 units across all grades.

**Phase 2: Catalog**
> Build home, category and product pages per section 8. Product page must show ConditionBadge, WarrantyStrip, RepairDisclosure and the price/MRP/savings block. Use server components and ISR.

**Phase 3: Admin**
> Build /admin with login (single admin role). Add product and unit CRUD, Cloudinary image upload, and auto price suggestion using lib/pricing.ts. Block saving a unit with price below floor.

**Phase 4: Checkout**
> Implement section 6 exactly: create-order, PayButton, webhook, verify. Amount must always come from the DB. Add 10-minute unit reservation and a cron route that releases expired reservations.

**Phase 5: Exit offer**
> Implement section 7 with the floor check on the server. Show once per session.

**Phase 6: Post-purchase**
> On payment.captured, generate a PDF GST invoice, email it with Resend, and send a WhatsApp confirmation. Build /order/[id] with status timeline.

**Phase 7: Hardening**
> Add rate limiting on API routes, zod validation on all inputs, idempotent webhook handling (ignore duplicate events), error logging with Sentry, and tests for pricing.ts and the webhook signature check.

**Phase 8: Launch**
> Add GA4 and Meta Pixel with server-side Purchase event from the webhook. Add sitemap, robots, product JSON-LD schema, and a Lighthouse pass targeting 90+ on mobile.

---

## 11. Test checklist before going live

- Pay with Razorpay test keys using UPI success and failure test IDs.
- Two browsers try to buy the same unit; only one succeeds.
- Tamper the amount in the browser; server ignores it.
- Replay a webhook; order is not processed twice.
- Exit offer refuses to apply when it would break the floor.
- Refund flow works from the admin panel via Razorpay refund API.

---

# 6B. Manual UPI + UTR payment mode (use until a gateway approves you)

Set `PAYMENT_MODE=manual` in `.env.local`. Keep the Razorpay code from section 6 in the repo and switch `PAYMENT_MODE=razorpay` once approved. Same Order table, same checkout page.

## 6B.1 Rules (these keep you out of trouble)

1. Receive money in a **current/business bank account with its own UPI ID**, not your personal savings VPA. Personal VPAs get flagged and frozen when many strangers pay them.
2. Ship **only after the credit is visible in your bank statement**. A UTR typed by a customer proves nothing by itself.
3. Hold the unit for 30 minutes at checkout, extended to 12 hours once a UTR is submitted.
4. Every UTR can be used once, ever (unique constraint).
5. Show the real policies, warranty, GST invoice and repair disclosure exactly like in the gateway mode.
6. Apply for a gateway in parallel (Cashfree, PayU, Easebuzz, Instamojo, or the PhonePe/Paytm business gateways). Rejections are usually about missing policy pages, a prelaunch site, or listings that look like "new product at 70% off". Fix the listing language and reapply.

## 6B.2 Schema patch

```prisma
enum PaymentMode { RAZORPAY MANUAL_UPI }

// add to enum OrderStatus:
//   AWAITING_PAYMENT  PAYMENT_SUBMITTED  VERIFIED  REJECTED

// add to model Order:
//   paymentMode   PaymentMode @default(MANUAL_UPI)
//   utr           String?     @unique
//   utrSubmittedAt DateTime?
//   payerName     String?
//   screenshotUrl String?
//   verifiedBy    String?
//   verifiedAt    DateTime?
//   rejectReason  String?
```

## 6B.3 Dynamic UPI link, QR and notes (`lib/upi.ts`)

```ts
export function buildUpiLink(opts: {
  vpa: string; payeeName: string; amountPaise: number; orderId: string; productTitle: string;
}) {
  const amount = (opts.amountPaise / 100).toFixed(2);
  const note = `${opts.orderId} ${opts.productTitle}`.slice(0, 50); // apps truncate long notes
  const p = new URLSearchParams({
    pa: opts.vpa,
    pn: opts.payeeName,
    am: amount,
    cu: "INR",
    tn: note,                 // the auto note shown inside the UPI app
  });
  return `upi://pay?${p.toString()}`;
}
```

Notes:
- Do not add `tr` or `mc` unless the VPA is a registered merchant VPA. Some apps (GPay especially) decline "for security reasons" when those are set on a personal-style VPA.
- Show three things on the pay page: an **Open UPI app** button (the link above, works on mobile), a **QR code** of the same link (`qrcode` npm package) for desktop users, and the **VPA with a copy button** as a fallback. Amount and note are locked in the link and QR, and the page also prints them so users can type them if an app ignores the link.
- Individual app buttons: `phonepe://pay?...`, `tez://upi/pay?...`, `paytmmp://pay?...` use the same query string. Keep the generic `upi://` button first.

## 6B.4 Create manual order (`app/api/checkout/create-manual-order/route.ts`)

```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reserveUnit } from "@/lib/inventory";
import { applyExitOffer } from "@/lib/pricing";
import { buildUpiLink } from "@/lib/upi";

export async function POST(req: Request) {
  const { unitId, userId, shipping, couponCode } = await req.json();
  const unit = await prisma.unit.findUnique({ where: { id: unitId }, include: { product: true } });
  if (!unit) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!(await reserveUnit(unitId, 30))) return NextResponse.json({ error: "Just sold" }, { status: 409 });

  let amount = unit.pricePaise, discount = 0;
  if (couponCode === "EXIT5") {
    const r = applyExitOffer(unit.pricePaise, unit.floorPaise, 5);
    if (r.ok) { discount = unit.pricePaise - r.discounted; amount = r.discounted; }
  }

  const order = await prisma.order.create({
    data: { userId, unitId, amountPaise: amount, discountPaise: discount,
            couponCode: discount ? couponCode : null, shippingJson: shipping,
            paymentMode: "MANUAL_UPI", status: "AWAITING_PAYMENT" },
  });

  const upiLink = buildUpiLink({
    vpa: process.env.MERCHANT_VPA!, payeeName: process.env.MERCHANT_NAME!,
    amountPaise: amount, orderId: order.id.slice(-8).toUpperCase(),
    productTitle: unit.product.title,
  });

  return NextResponse.json({ orderId: order.id, amount, upiLink, vpa: process.env.MERCHANT_VPA });
}
```

## 6B.5 Submit UTR (`app/api/checkout/submit-utr/route.ts`)

```ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  orderId: z.string(),
  utr: z.string().regex(/^\d{12}$/, "UTR is 12 digits"),
  payerName: z.string().min(2),
  screenshotUrl: z.string().url().optional(),
});

export async function POST(req: Request) {
  const body = schema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: body.error.issues[0].message }, { status: 400 });
  const { orderId, utr, payerName, screenshotUrl } = body.data;

  const dup = await prisma.order.findUnique({ where: { utr } });
  if (dup) return NextResponse.json({ error: "This UTR is already used" }, { status: 409 });

  const order = await prisma.order.update({
    where: { id: orderId, status: "AWAITING_PAYMENT" },
    data: { utr, payerName, screenshotUrl, status: "PAYMENT_SUBMITTED", utrSubmittedAt: new Date() },
  });
  // extend hold to 12 hours while we verify
  await prisma.unit.update({
    where: { id: order.unitId },
    data: { reservedUntil: new Date(Date.now() + 12 * 3600_000) },
  });
  // TODO: notify admin on WhatsApp/Telegram: "New UTR to verify: order, amount, utr"
  return NextResponse.json({ ok: true });
}
```

## 6B.6 Admin verification

Admin page `/admin/payments` lists orders in `PAYMENT_SUBMITTED` with: order ID, amount expected, UTR, payer name, screenshot, time submitted. The admin checks the bank app or statement for a credit with the **same amount and UTR**, then clicks Verify or Reject.

```ts
// app/api/admin/verify-payment/route.ts  (admin-only)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { orderId, action, reason, adminId } = await req.json(); // action: "verify" | "reject"
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.status !== "PAYMENT_SUBMITTED")
    return NextResponse.json({ error: "Invalid state" }, { status: 400 });

  if (action === "verify") {
    await prisma.order.update({ where: { id: orderId },
      data: { status: "VERIFIED", verifiedBy: adminId, verifiedAt: new Date() } });
    await prisma.unit.update({ where: { id: order.unitId }, data: { status: "SOLD" } });
    // TODO: generate GST invoice, email + WhatsApp confirmation
  } else {
    await prisma.order.update({ where: { id: orderId },
      data: { status: "REJECTED", rejectReason: reason ?? "Payment not received" } });
    await prisma.unit.update({ where: { id: order.unitId },
      data: { status: "AVAILABLE", reservedUntil: null } });
  }
  return NextResponse.json({ ok: true });
}
```

## 6B.7 Optional auto-matching (removes most manual work)

Most banks email or SMS a credit alert containing amount and UTR/ref number. Build an n8n or Zapier flow: Gmail trigger on the bank's alert sender, parse amount and UTR with regex, call `POST /api/admin/auto-match` with a secret header. The endpoint finds the `PAYMENT_SUBMITTED` order with the same UTR and amount and verifies it. Anything that does not match exactly stays in the manual queue.

## 6B.8 Pay page copy (put this on the page)

- "Pay exactly ₹{amount}. Amount and note are pre-filled."
- "After paying, enter the 12-digit UTR from your UPI app's payment details."
- "We confirm within 30 minutes (9am to 9pm). Your unit stays reserved for you."
- "Wrong amount or no credit received? We refund within 3 working days."

## 6B.9 Cursor prompt for this phase

> Implement section 6B of guide.md. Add the schema patch, lib/upi.ts, create-manual-order, submit-utr with zod validation and unique UTR, the /admin/payments verification page with verify/reject actions, and a pay page with Open UPI app button, QR code, copy-VPA fallback, and a UTR entry form. Gate everything behind PAYMENT_MODE so the Razorpay flow in section 6 still works when the env var is razorpay.

## 6B.10 Extra tests for manual mode

- Same UTR submitted on two orders is rejected.
- UTR that is not 12 digits is rejected.
- Verify is blocked unless status is PAYMENT_SUBMITTED.
- Expired reservation with no UTR releases the unit back to AVAILABLE.
- Customer cannot mark their own order verified (admin route requires admin session).
