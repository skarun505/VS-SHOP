const token = process.env.SUPABASE_ACCESS_TOKEN || "";
const projectRef = process.env.SUPABASE_PROJECT_REF || "mdattxewghzooverrrxe";

const sql = `
CREATE TABLE IF NOT EXISTS "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL UNIQUE,
    "title" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "modelNumber" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "images" TEXT NOT NULL DEFAULT '[]',
    "mrp" INTEGER NOT NULL,
    "warrantyMonths" INTEGER NOT NULL DEFAULT 6,
    "returnDays" INTEGER NOT NULL DEFAULT 7,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Unit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "serialOrImei" TEXT NOT NULL UNIQUE,
    "grade" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "costPaise" INTEGER NOT NULL,
    "repairNotes" TEXT,
    "repairPhotos" TEXT,
    "batteryHealth" INTEGER,
    "pricePaise" INTEGER NOT NULL,
    "floorPaise" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "reservedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL DEFAULT 'guest',
    "unitId" TEXT NOT NULL UNIQUE REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    "amountPaise" INTEGER NOT NULL,
    "couponCode" TEXT,
    "discountPaise" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'AWAITING_PAYMENT',
    "paymentMode" TEXT NOT NULL DEFAULT 'MANUAL_UPI',
    "rzpOrderId" TEXT UNIQUE,
    "rzpPaymentId" TEXT,
    "utr" TEXT UNIQUE,
    "utrSubmittedAt" TIMESTAMP(3),
    "payerName" TEXT,
    "screenshotUrl" TEXT,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "rejectReason" TEXT,
    "shippingJson" TEXT NOT NULL,
    "invoiceNo" TEXT UNIQUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Coupon" (
    "code" TEXT NOT NULL PRIMARY KEY,
    "percentOff" INTEGER NOT NULL,
    "maxUses" INTEGER NOT NULL,
    "used" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "userName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "comment" TEXT NOT NULL,
    "verifiedPurchase" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Product_category_idx" ON "Product"("category");
CREATE INDEX IF NOT EXISTS "Unit_productId_idx" ON "Unit"("productId");
CREATE INDEX IF NOT EXISTS "Unit_status_idx" ON "Unit"("status");
CREATE INDEX IF NOT EXISTS "Order_status_idx" ON "Order"("status");
CREATE INDEX IF NOT EXISTS "Review_productId_idx" ON "Review"("productId");
`;

async function main() {
  console.log("Connecting to Supabase project:", projectRef);
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });

  const data = await res.json();
  console.log("Schema creation response:", data);

  // Check created tables in public schema
  const checkRes = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';",
    }),
  });

  const checkData = await checkRes.json();
  console.log("Verified Public Tables in Supabase:", checkData);
}

main().catch(console.error);
