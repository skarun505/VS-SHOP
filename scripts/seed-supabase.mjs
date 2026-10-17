const token = process.env.SUPABASE_ACCESS_TOKEN || "";
const projectRef = process.env.SUPABASE_PROJECT_REF || "mdattxewghzooverrrxe";

async function query(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });
  return res.json();
}

async function main() {
  console.log("Seeding Supabase database with products and units...");

  // 1. Coupon EXIT5
  await query(`
    INSERT INTO "Coupon" ("code", "percentOff", "maxUses", "used", "active")
    VALUES ('EXIT5', 5, 1000, 0, true)
    ON CONFLICT ("code") DO NOTHING;
  `);

  // 2. Products and Units
  const products = [
    {
      id: "prod_iphone15_promax",
      title: "Apple iPhone 15 Pro Max 256GB (Pristine Untouched)",
      slug: "apple-iphone-15-pro-max-256gb-pristine",
      brand: "Apple",
      modelNumber: "A3106",
      category: "smartphones",
      description: "Natural Titanium finish with Ceramic Shield front. Powered by the A17 Pro chip. 48MP main camera with 5x telephoto optical zoom. USB-C with USB 3 speeds. Inspected and certified through our comprehensive 42-point testing protocol.",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1695048133202-06b528a3014a?auto=format&fit=crop&w=1000&q=80"
      ]),
      mrp: 15990000,
      units: [
        {
          id: "unit_ip15pm_1",
          serialOrImei: "358921104829104",
          grade: "A_PLUS",
          source: "OPEN_BOX",
          costPaise: 9200000,
          pricePaise: 11999900,
          floorPaise: 10304000,
          batteryHealth: 96,
          repairNotes: "100% original Apple hardware. Flawless cosmetic condition. Battery health 96%. Passed comprehensive 42-point quality check.",
        },
        {
          id: "unit_ip15pm_2",
          serialOrImei: "358921104829105",
          grade: "A",
          source: "OPEN_BOX",
          costPaise: 8400000,
          pricePaise: 10999900,
          floorPaise: 9408000,
          batteryHealth: 92,
          repairNotes: "Pristine display with TrueTone and ProMotion 120Hz certified. Battery health 92%. Factory sanitized.",
        }
      ]
    },
    {
      id: "prod_iphone14",
      title: "Apple iPhone 14 128GB (Pristine Untouched)",
      slug: "apple-iphone-14-128gb-pristine",
      brand: "Apple",
      modelNumber: "A2882",
      category: "smartphones",
      description: "6.1-inch Super Retina XDR OLED display, A15 Bionic chip with 5-core GPU, Photonic Engine for rich low-light photography. Factory sealed and verified.",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?auto=format&fit=crop&w=1000&q=80"
      ]),
      mrp: 6990000,
      units: [
        {
          id: "unit_ip14_1",
          serialOrImei: "356781203491021",
          grade: "A_PLUS",
          source: "OPEN_BOX",
          costPaise: 3500000,
          pricePaise: 4899900,
          floorPaise: 3920000,
          batteryHealth: 93,
          repairNotes: "Pristine untouched unit. Cleaned, ultrasonic sanitized and re-sealed with water-resistant adhesive.",
        }
      ]
    },
    {
      id: "prod_s23_ultra",
      title: "Samsung Galaxy S23 Ultra 5G 256GB (Pristine Open-Box)",
      slug: "samsung-galaxy-s23-ultra-5g-256gb-pristine",
      brand: "Samsung",
      modelNumber: "SM-S918B/DS",
      category: "smartphones",
      description: "200MP camera system with integrated S-Pen stylus. Snapdragon 8 Gen 2 for Galaxy. Dynamic AMOLED 2X 120Hz display with Vision Booster. Tested against all CEIR security checks.",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1678911820864-e2c567c655d7?auto=format&fit=crop&w=1000&q=80"
      ]),
      mrp: 12499900,
      units: [
        {
          id: "unit_s23u_1",
          serialOrImei: "352904812309123",
          grade: "A_PLUS",
          source: "OPEN_BOX",
          costPaise: 7200000,
          pricePaise: 8999900,
          floorPaise: 8064000,
          batteryHealth: 98,
          repairNotes: "Corporate demo return. Unused accessories, pristine untouched condition. Battery test shows 98% capacity.",
        }
      ]
    },
    {
      id: "prod_oneplus_11",
      title: "OnePlus 11 5G 256GB 16GB RAM (Mint Edition)",
      slug: "oneplus-11-5g-256gb-mint",
      brand: "OnePlus",
      modelNumber: "CPH2447",
      category: "smartphones",
      description: "Hasselblad Camera for Mobile, 100W SUPERVOOC fast charging, Qualcomm Snapdragon 8 Gen 2, 2K 120Hz Super Fluid AMOLED display with Dolby Vision.",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1000&q=80"
      ]),
      mrp: 6199900,
      units: [
        {
          id: "unit_op11_1",
          serialOrImei: "860492051284910",
          grade: "A_PLUS",
          source: "OPEN_BOX",
          costPaise: 3100000,
          pricePaise: 3999900,
          floorPaise: 3472000,
          batteryHealth: 95,
          repairNotes: "Original OnePlus 100W charger included. Battery dual-cell health tested at 95%.",
        }
      ]
    },
    {
      id: "prod_macbook_air_m2",
      title: "Apple MacBook Air M2 13.6\" 256GB SSD 8GB (Pristine Open-Box)",
      slug: "apple-macbook-air-m2-13-6-256gb-open-box",
      brand: "Apple",
      modelNumber: "MLXY3HN/A",
      category: "laptops",
      description: "Midnight finish with MagSafe 3 charging, Liquid Retina display with 500 nits brightness, 1080p FaceTime HD camera, 18 hours battery life. Only 14 battery cycles logged.",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80"
      ]),
      mrp: 9990000,
      units: [
        {
          id: "unit_mba_m2_1",
          serialOrImei: "C02G90J0MD6R",
          grade: "A_PLUS",
          source: "OPEN_BOX",
          costPaise: 6100000,
          pricePaise: 7499900,
          floorPaise: 6832000,
          batteryHealth: 100,
          repairNotes: "Open-box return from authorized store. Original box and 30W adapter included. 14 battery cycles, 100% health.",
        }
      ]
    },
    {
      id: "prod_sony_bravia_55",
      title: "Sony Bravia 55\" 4K Ultra HD Smart Google TV (Pristine Open-Box)",
      slug: "sony-bravia-55-4k-google-tv-open-box",
      brand: "Sony",
      modelNumber: "KD-55X74L",
      category: "televisions",
      description: "X1 4K Processor with 4K X-Reality PRO upscaling, Motionflow XR 100, Dolby Audio with 20W Open Baffle Speaker, Google TV with voice remote control.",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=1000&q=80"
      ]),
      mrp: 6490000,
      units: [
        {
          id: "unit_sny_55_1",
          serialOrImei: "SNY55X74001",
          grade: "A_PLUS",
          source: "OPEN_BOX",
          costPaise: 3800000,
          pricePaise: 4499900,
          floorPaise: 4256000,
          batteryHealth: null,
          repairNotes: "Open-box unit with original protective peels on bezel. Zero dead pixels verified across RGB test patterns.",
        }
      ]
    },
    {
      id: "prod_lg_55_oled",
      title: "LG 55\" 4K OLED Smart TV (Certified Mint Condition)",
      slug: "lg-55-4k-oled-smart-tv-pristine",
      brand: "LG",
      modelNumber: "OLED55C3PSA",
      category: "televisions",
      description: "Self-lit OLED evo with Brightness Booster, α9 AI Processor 4K Gen6, Dolby Vision & Atmos, 0.1ms response time, 4K 120Hz VRR G-Sync & FreeSync gaming.",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1577979749830-f1d742b96791?auto=format&fit=crop&w=1000&q=80"
      ]),
      mrp: 14999000,
      units: [
        {
          id: "unit_lg_oled_1",
          serialOrImei: "LGC355OLED91",
          grade: "A_PLUS",
          source: "OPEN_BOX",
          costPaise: 7900000,
          pricePaise: 9499900,
          floorPaise: 8848000,
          batteryHealth: null,
          repairNotes: "Brand new OEM panel installed directly under LG technical certification. Zero burn-in, 0 hours runtime on panel.",
        }
      ]
    },
    {
      id: "prod_lg_wm_8kg",
      title: "LG 8.0 Kg Front Load Smart Inverter Washing Machine (Untouched Mint)",
      slug: "lg-8kg-front-load-washing-machine-pristine",
      brand: "LG",
      modelNumber: "FHM1408BDW",
      category: "appliances",
      description: "6 Motion Direct Drive technology, Steam wash allergy care, Smart Diagnosis with ThinQ, stainless steel drum, 1400 RPM spin speed, 5-star energy rating.",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=1000&q=80"
      ]),
      mrp: 4499000,
      units: [
        {
          id: "unit_lg_wm_1",
          serialOrImei: "LGWM8KGF1001",
          grade: "A_PLUS",
          source: "OPEN_BOX",
          costPaise: 2100000,
          pricePaise: 2999900,
          floorPaise: 2352000,
          batteryHealth: null,
          repairNotes: "Drum shock dampers and inlet valve tested to factory spec. Descaled and sanitized. Spin balance test passed.",
        }
      ]
    }
  ];

  for (const p of products) {
    const escapedDesc = p.description.replace(/'/g, "''");
    const escapedTitle = p.title.replace(/'/g, "''");
    const escapedImages = p.images.replace(/'/g, "''");

    await query(`
      INSERT INTO "Product" ("id", "slug", "title", "brand", "modelNumber", "category", "description", "images", "mrp", "warrantyMonths", "returnDays")
      VALUES ('${p.id}', '${p.slug}', '${escapedTitle}', '${p.brand}', '${p.modelNumber}', '${p.category}', '${escapedDesc}', '${escapedImages}', ${p.mrp}, 6, 7)
      ON CONFLICT ("slug") DO UPDATE SET
        "title" = EXCLUDED."title",
        "description" = EXCLUDED."description",
        "mrp" = EXCLUDED."mrp";
    `);

    for (const u of p.units) {
      const escapedNotes = (u.repairNotes || "").replace(/'/g, "''");
      await query(`
        INSERT INTO "Unit" ("id", "productId", "serialOrImei", "grade", "source", "costPaise", "pricePaise", "floorPaise", "batteryHealth", "repairNotes", "status")
        VALUES ('${u.id}', '${p.id}', '${u.serialOrImei}', '${u.grade}', '${u.source}', ${u.costPaise}, ${u.pricePaise}, ${u.floorPaise}, ${u.batteryHealth ?? 'NULL'}, '${escapedNotes}', 'AVAILABLE')
        ON CONFLICT ("serialOrImei") DO UPDATE SET
          "pricePaise" = EXCLUDED."pricePaise",
          "floorPaise" = EXCLUDED."floorPaise",
          "status" = EXCLUDED."status";
      `);
    }
  }

  const prodCount = await query('SELECT count(*) FROM "Product";');
  const unitCount = await query('SELECT count(*) FROM "Unit";');
  console.log("Seeding complete! Products in Supabase:", prodCount, "Units:", unitCount);
}

main().catch(console.error);
