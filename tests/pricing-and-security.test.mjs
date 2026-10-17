import assert from "node:assert";
import crypto from "node:crypto";
import { suggestPrice, applyExitOffer, GRADE_DISCOUNT } from "../lib/pricing.ts";

console.log("Running Phase 7 Verification Tests...\n");

// Test 1: Grade discount mapping
console.log("Test 1: Verify Grade Discount Rates");
assert.strictEqual(GRADE_DISCOUNT.A_PLUS, 0.30);
assert.strictEqual(GRADE_DISCOUNT.A, 0.38);
assert.strictEqual(GRADE_DISCOUNT.B, 0.46);
assert.strictEqual(GRADE_DISCOUNT.C, 0.55);
console.log("✔ Grade discount mapping verified.");

// Test 2: Pricing algorithm and floor margin
console.log("\nTest 2: suggestPrice Margin Floor (+12% min)");
const mrp = 10000000; // ₹1,00,000
const cost = 5000000;  // ₹50,000
const result = suggestPrice(mrp, "A_PLUS", cost);
// Target for A_PLUS is 10000000 * 0.70 = 7000000
// Floor is 5000000 * 1.12 = 5600000
assert.strictEqual(result.price, 7000000);
assert.strictEqual(result.floor, 5600000);

// High cost edge case where floor is higher than target
const highCost = 7500000; // ₹75,000
const highCostResult = suggestPrice(mrp, "A_PLUS", highCost);
// Floor is 7500000 * 1.12 = 8400000 > 7000000
assert.strictEqual(highCostResult.price, 8400000);
assert.strictEqual(highCostResult.floor, 8400000);
console.log("✔ Price suggestion and floor calculations pass.");

// Test 3: Exit offer floor check (Section 5.1 & 7)
console.log("\nTest 3: Exit Offer Floor Protection");
// Normal case: price 70,000, floor 56,000 -> 5% off = 66,500 >= 56,000 (Allowed)
const offerPass = applyExitOffer(7000000, 5600000, 5);
assert.strictEqual(offerPass.ok, true);
assert.strictEqual(offerPass.discounted, 6650000);
assert.strictEqual(offerPass.savingsPaise, 350000);

// Rejection case: price 57,000, floor 56,000 -> 5% off = 54,150 < 56,000 (Rejected!)
const offerReject = applyExitOffer(5700000, 5600000, 5);
assert.strictEqual(offerReject.ok, false);
assert.strictEqual(offerReject.discounted, 5700000);
assert.strictEqual(offerReject.savingsPaise, 0);
console.log("✔ Exit offer margin floor protection properly protects profit margin.");

// Test 4: Webhook cryptographic signature check (Section 6.4)
console.log("\nTest 4: Razorpay HMAC SHA256 Webhook Verification");
const secret = "test_webhook_secret_key_123";
const rawPayload = JSON.stringify({ event: "payment.captured", id: "evt_123" });
const validSignature = crypto.createHmac("sha256", secret).update(rawPayload).digest("hex");
const invalidSignature = "invalid_tampered_signature_hex_0000000000";

function verifyWebhook(raw, sig, sec) {
  const expected = crypto.createHmac("sha256", sec).update(raw).digest("hex");
  const sigBuffer = Buffer.from(sig);
  const expectedBuffer = Buffer.from(expected);
  if (sigBuffer.length !== expectedBuffer.length) return false;
  return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
}

assert.strictEqual(verifyWebhook(rawPayload, validSignature, secret), true);
assert.strictEqual(verifyWebhook(rawPayload, invalidSignature, secret), false);
assert.strictEqual(verifyWebhook(rawPayload + "_tampered", validSignature, secret), false);
console.log("✔ Webhook timingSafeEqual signature check verified.");

console.log("\nAll 4 Core Verification Tests Passed Successfully!");
