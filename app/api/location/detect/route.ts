import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Known Indian pincode zone map for instant local resolution
const PIN_ZONE_MAP: Record<string, { city: string; state: string }> = {
  "56": { city: "Bengaluru", state: "Karnataka" },
  "57": { city: "Mangaluru", state: "Karnataka" },
  "58": { city: "Hubballi", state: "Karnataka" },
  "59": { city: "Belagavi", state: "Karnataka" },
  "40": { city: "Mumbai", state: "Maharashtra" },
  "41": { city: "Pune", state: "Maharashtra" },
  "42": { city: "Nashik", state: "Maharashtra" },
  "44": { city: "Nagpur", state: "Maharashtra" },
  "11": { city: "New Delhi", state: "Delhi" },
  "12": { city: "Gurugram / Faridabad", state: "Haryana" },
  "20": { city: "Noida / Ghaziabad", state: "Uttar Pradesh" },
  "60": { city: "Chennai", state: "Tamil Nadu" },
  "64": { city: "Coimbatore", state: "Tamil Nadu" },
  "62": { city: "Madurai", state: "Tamil Nadu" },
  "50": { city: "Hyderabad", state: "Telangana" },
  "53": { city: "Visakhapatnam", state: "Andhra Pradesh" },
  "52": { city: "Vijayawada", state: "Andhra Pradesh" },
  "70": { city: "Kolkata", state: "West Bengal" },
  "38": { city: "Ahmedabad", state: "Gujarat" },
  "39": { city: "Surat / Vadodara", state: "Gujarat" },
  "68": { city: "Kochi", state: "Kerala" },
  "69": { city: "Thiruvananthapuram", state: "Kerala" },
  "30": { city: "Jaipur", state: "Rajasthan" },
  "16": { city: "Chandigarh", state: "Punjab" },
  "22": { city: "Lucknow", state: "Uttar Pradesh" },
  "45": { city: "Indore", state: "Madhya Pradesh" },
  "46": { city: "Bhopal", state: "Madhya Pradesh" },
  "80": { city: "Patna", state: "Bihar" },
  "75": { city: "Bhubaneswar", state: "Odisha" },
  "78": { city: "Guwahati", state: "Assam" },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  // 1. If GPS coordinates provided from browser navigator.geolocation
  if (lat && lon) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);

      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(
          lat
        )}&lon=${encodeURIComponent(lon)}&zoom=18&addressdetails=1`,
        {
          signal: controller.signal,
          headers: {
            "User-Agent": "PristineTechEcommerce/1.0 (support@pristinetech.in)",
          },
        }
      );
      clearTimeout(timeout);

      if (geoRes.ok) {
        const data = await geoRes.json();
        const address = data.address || {};
        const city =
          address.city ||
          address.town ||
          address.city_district ||
          address.suburb ||
          address.state_district ||
          "Bengaluru";
        const pincode = address.postcode || "560038";
        const state = address.state || "Karnataka";
        const area = address.suburb || address.neighbourhood || "";

        return NextResponse.json({
          success: true,
          city,
          pincode,
          state,
          area,
          source: "gps",
          formatted: area ? `${area}, ${city} ${pincode}` : `${city} ${pincode}`,
        });
      }
    } catch (err) {
      console.warn("GPS reverse geocoding failed or timed out:", err);
    }
  }

  // 2. Check Vercel GeoIP Headers (Available in production on Vercel)
  const vercelCity = req.headers.get("x-vercel-ip-city");
  const vercelPostal = req.headers.get("x-vercel-ip-postal-code");
  const vercelRegion = req.headers.get("x-vercel-ip-country-region");

  if (vercelCity) {
    const decodedCity = decodeURIComponent(vercelCity);
    const pin = vercelPostal || "560001";
    return NextResponse.json({
      success: true,
      city: decodedCity,
      pincode: pin,
      state: vercelRegion || "",
      source: "vercel_geoip",
      formatted: `${decodedCity} ${pin}`,
    });
  }

  // 3. Fallback to public IP lookup for local testing or dev
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const ipRes = await fetch("https://ipwho.is/", {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (ipRes.ok) {
      const data = await ipRes.json();
      if (data && data.success !== false) {
        const city = data.city || "Bengaluru";
        const pincode = data.postal || "560001";
        const state = data.region || "Karnataka";
        return NextResponse.json({
          success: true,
          city,
          pincode,
          state,
          source: "ipwhois",
          formatted: `${city} ${pincode}`,
        });
      }
    }
  } catch (err) {
    console.warn("IP Geo lookup fallback skipped:", err);
  }

  // 4. Default baseline
  return NextResponse.json({
    success: true,
    city: "Bengaluru",
    pincode: "560038",
    state: "Karnataka",
    source: "default",
    formatted: "Bengaluru 560038",
  });
}

// Manual Pincode Validation / Lookup
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cleanPin = String(body.pincode || "").trim().replace(/\D/g, "");

    if (cleanPin.length !== 6) {
      return NextResponse.json(
        { error: "Please enter a valid 6-digit Indian delivery pincode" },
        { status: 400 }
      );
    }

    const prefix = cleanPin.substring(0, 2);
    const mapped = PIN_ZONE_MAP[prefix] || {
      city: "India",
      state: "Standard Delivery",
    };

    return NextResponse.json({
      success: true,
      pincode: cleanPin,
      city: mapped.city,
      state: mapped.state,
      formatted: `${mapped.city} ${cleanPin}`,
      sameDayEligible: ["56", "40", "11", "50", "60", "41"].includes(prefix),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 500 }
    );
  }
}
