import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const GRADE_DISCOUNT = {
  A_PLUS: 0.30,
  A: 0.38,
  B: 0.46,
  C: 0.55,
};

function suggestPrice(mrpPaise, grade, costPaise) {
  const discountRate = GRADE_DISCOUNT[grade] || 0.38;
  const target = Math.round(mrpPaise * (1 - discountRate));
  const floor = Math.round(costPaise * 1.12);
  return { price: Math.max(target, floor), floor };
}

async function main() {
  console.log("Seeding database with Pristine Untouched products and units...");

  // Clean existing records
  await prisma.review.deleteMany();
  await prisma.order.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.product.deleteMany();
  await prisma.coupon.deleteMany();

  // Seed Coupons
  await prisma.coupon.create({
    data: {
      code: "EXIT5",
      percentOff: 5,
      maxUses: 1000,
      used: 0,
      active: true,
    },
  });

  const productsData = [
    {
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
      mrp: 15990000, // ₹1,59,900
      warrantyMonths: 6,
      returnDays: 7,
      units: [
        {
          serialOrImei: "358921104829104",
          grade: "A_PLUS",
          source: "OPEN_BOX",
          costPaise: 9200000,
          repairNotes: "100% original Apple hardware. Flawless cosmetic condition. Battery health 96%. Passed comprehensive 42-point quality check.",
          repairPhotos: JSON.stringify(["https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=600&q=80"]),
          batteryHealth: 96,
        },
        {
          serialOrImei: "358921104829105",
          grade: "A",
          source: "OPEN_BOX",
          costPaise: 8400000,
          repairNotes: "Pristine display with TrueTone and ProMotion 120Hz certified. Battery health 92%. Factory sanitized.",
          repairPhotos: JSON.stringify(["https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=600&q=80"]),
          batteryHealth: 92,
        },
        {
          serialOrImei: "358921104829106",
          grade: "B",
          source: "REFURBISHED",
          costPaise: 7300000,
          repairNotes: "Screen 100% scratch-free. Minor hairline micro-mark near charging port. Battery health 88%.",
          repairPhotos: JSON.stringify(["https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=600&q=80"]),
          batteryHealth: 88,
        }
      ],
      reviews: [
        { userName: "Aditya S.", rating: 5, comment: "Ordered Grade A+ and honestly cannot distinguish from brand new. Battery health is at 96% as promised." },
        { userName: "Kavita Rao", rating: 5, comment: "Genuine GST invoice provided. Tested IMEI on Apple coverage and everything checks out." }
      ]
    },
    {
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
      mrp: 6990000, // ₹69,900
      warrantyMonths: 6,
      returnDays: 7,
      units: [
        {
          serialOrImei: "356781203491021",
          grade: "A_PLUS",
          source: "OPEN_BOX",
          costPaise: 3500000,
          repairNotes: "Pristine untouched unit. Cleaned, ultrasonic sanitized and re-sealed with water-resistant adhesive.",
          repairPhotos: JSON.stringify([]),
          batteryHealth: 93,
        },
        {
          serialOrImei: "356781203491022",
          grade: "A",
          source: "OPEN_BOX",
          costPaise: 3100000,
          repairNotes: "Flawless screen with tempered glass pre-installed. Battery health 89%. 100% factory spec.",
          repairPhotos: JSON.stringify([]),
          batteryHealth: 89,
        }
      ],
      reviews: [
        { userName: "Rohan Verma", rating: 5, comment: "Great savings of over 25k compared to retail. Battery health was 93% and looks brand new." }
      ]
    },
    {
      title: "Samsung Galaxy S23 Ultra 5G 256GB (Pristine Open-Box)",
      slug: "samsung-galaxy-s23-ultra-5g-256gb-pristine",
      brand: "Samsung",
      modelNumber: "SM-S918B/DS",
      category: "smartphones",
      description: "200MP camera system with integrated S-Pen stylus. Snapdragon 8 Gen 2 for Galaxy. Dynamic AMOLED 2X 120Hz display with Vision Booster. Tested against all CEIR security checks.",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1678911820864-e2c567c655d7?auto=format&fit=crop&w=1000&q=80"
      ]),
      mrp: 12499900, // ₹1,24,999
      warrantyMonths: 6,
      returnDays: 7,
      units: [
        {
          serialOrImei: "352904812309123",
          grade: "A_PLUS",
          source: "OPEN_BOX",
          costPaise: 7200000,
          repairNotes: "Corporate demo return. Unused accessories, pristine untouched condition. Battery test shows 98% capacity.",
          repairPhotos: JSON.stringify([]),
          batteryHealth: 98,
        },
        {
          serialOrImei: "352904812309124",
          grade: "A",
          source: "OPEN_BOX",
          costPaise: 6500000,
          repairNotes: "S-Pen pressure sensor verified. No hardware defects. Battery capacity 94%.",
          repairPhotos: JSON.stringify([]),
          batteryHealth: 94,
        }
      ],
      reviews: [
        { userName: "Anand M.", rating: 5, comment: "Camera zoom and S-Pen work flawlessly. Looks completely untouched!" }
      ]
    },
    {
      title: "OnePlus 11 5G 256GB 16GB RAM (Mint Edition)",
      slug: "oneplus-11-5g-256gb-mint",
      brand: "OnePlus",
      modelNumber: "CPH2447",
      category: "smartphones",
      description: "Hasselblad Camera for Mobile, 100W SUPERVOOC fast charging, Qualcomm Snapdragon 8 Gen 2, 2K 120Hz Super Fluid AMOLED display with Dolby Vision.",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1000&q=80"
      ]),
      mrp: 6199900, // ₹61,999
      warrantyMonths: 6,
      returnDays: 7,
      units: [
        {
          serialOrImei: "860492051284910",
          grade: "A_PLUS",
          source: "OPEN_BOX",
          costPaise: 3100000,
          repairNotes: "Original OnePlus 100W charger included. Battery dual-cell health tested at 95%.",
          repairPhotos: JSON.stringify([]),
          batteryHealth: 95,
        },
        {
          serialOrImei: "860492051284911",
          grade: "A",
          source: "OPEN_BOX",
          costPaise: 2700000,
          repairNotes: "Factory calibrated display and 100W SUPERVOOC charging port. Mint finish.",
          repairPhotos: JSON.stringify([]),
          batteryHealth: 90,
        }
      ],
      reviews: [
        { userName: "Deepak N.", rating: 4, comment: "Fast phone, 100W charging works properly. Value for money." }
      ]
    },
    {
      title: "Apple MacBook Air M2 13.6\" 256GB SSD 8GB (Pristine Open-Box)",
      slug: "apple-macbook-air-m2-13-6-256gb-open-box",
      brand: "Apple",
      modelNumber: "MLXY3HN/A",
      category: "laptops",
      description: "Midnight finish with MagSafe 3 charging, Liquid Retina display with 500 nits brightness, 1080p FaceTime HD camera, 18 hours battery life. Only 14 battery cycles logged.",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1000&q=80"
      ]),
      mrp: 9990000, // ₹99,900
      warrantyMonths: 12,
      returnDays: 7,
      units: [
        {
          serialOrImei: "C02G90J0MD6R",
          grade: "A_PLUS",
          source: "OPEN_BOX",
          costPaise: 6100000,
          repairNotes: "Open-box return from authorized store. Original box and 30W adapter included. 14 battery cycles, 100% health.",
          repairPhotos: JSON.stringify([]),
          batteryHealth: 100,
        },
        {
          serialOrImei: "C02G90J0MD6S",
          grade: "A",
          source: "OPEN_BOX",
          costPaise: 5400000,
          repairNotes: "Board diagnostics pristine, 45 battery cycles (97% battery capacity). No physical marks.",
          repairPhotos: JSON.stringify([]),
          batteryHealth: 97,
        }
      ],
      reviews: [
        { userName: "Siddharth J.", rating: 5, comment: "Practically brand new with 14 battery cycles! Saved nearly 30k." }
      ]
    },
    {
      title: "Dell XPS 13 Plus 9320 i7 16GB 512GB (Pristine Edition)",
      slug: "dell-xps-13-plus-9320-i7-repaired",
      brand: "Dell",
      modelNumber: "XPS 9320",
      category: "laptops",
      description: "13.4\" 3.5K OLED InfinityEdge touch display, Intel Core i7-1260P, capacitive touch function row, zero-lattice keyboard, and seamless glass haptic touchpad.",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1000&q=80"
      ]),
      mrp: 18999000, // ₹1,89,990
      warrantyMonths: 6,
      returnDays: 7,
      units: [
        {
          serialOrImei: "8FXK392",
          grade: "A_PLUS",
          source: "OPEN_BOX",
          costPaise: 8900000,
          repairNotes: "Dual-cooling module calibrated. Arctic MX-4 thermal interface. Stress-tested 48h to factory standard.",
          repairPhotos: JSON.stringify(["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80"]),
          batteryHealth: 94,
        },
        {
          serialOrImei: "8FXK393",
          grade: "A",
          source: "OPEN_BOX",
          costPaise: 7800000,
          repairNotes: "Tested display panel 100% uniformity without burn-in. Battery health 89%.",
          repairPhotos: JSON.stringify([]),
          batteryHealth: 89,
        }
      ],
      reviews: [
        { userName: "Pooja Nair", rating: 5, comment: "Gorgeous 3.5K OLED screen and great thermal performance. Excellent condition." }
      ]
    },
    {
      title: "Sony Bravia 55\" 4K Ultra HD Smart Google TV (Pristine Open-Box)",
      slug: "sony-bravia-55-4k-google-tv-open-box",
      brand: "Sony",
      modelNumber: "KD-55X74L",
      category: "televisions",
      description: "X1 4K Processor with 4K X-Reality PRO upscaling, Motionflow XR 100, Dolby Audio with 20W Open Baffle Speaker, Google TV with voice remote control.",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=1000&q=80"
      ]),
      mrp: 6490000, // ₹64,900
      warrantyMonths: 12,
      returnDays: 7,
      units: [
        {
          serialOrImei: "SNY55X74001",
          grade: "A_PLUS",
          source: "OPEN_BOX",
          costPaise: 3800000,
          repairNotes: "Open-box unit with original protective peels on bezel. Zero dead pixels verified across RGB test patterns.",
          repairPhotos: JSON.stringify([]),
          batteryHealth: null,
        },
        {
          serialOrImei: "SNY55X74002",
          grade: "A",
          source: "OPEN_BOX",
          costPaise: 3400000,
          repairNotes: "Power logic checked & certified. Wall mount brackets & factory remote included.",
          repairPhotos: JSON.stringify([]),
          batteryHealth: null,
        }
      ],
      reviews: [
        { userName: "Vikas Joshi", rating: 5, comment: "Panel has zero dead pixels and Dolby sound is great. Looks brand new." }
      ]
    },
    {
      title: "LG 55\" 4K OLED Smart TV (Certified Mint Condition)",
      slug: "lg-55-4k-oled-smart-tv-pristine",
      brand: "LG",
      modelNumber: "OLED55C3PSA",
      category: "televisions",
      description: "Self-lit OLED evo with Brightness Booster, α9 AI Processor 4K Gen6, Dolby Vision & Atmos, 0.1ms response time, 4K 120Hz VRR G-Sync & FreeSync gaming.",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1577979749830-f1d742b96791?auto=format&fit=crop&w=1000&q=80"
      ]),
      mrp: 14999000, // ₹1,49,990
      warrantyMonths: 12,
      returnDays: 7,
      units: [
        {
          serialOrImei: "LGC355OLED91",
          grade: "A_PLUS",
          source: "OPEN_BOX",
          costPaise: 7900000,
          repairNotes: "Brand new OEM panel installed directly under LG technical certification. Zero burn-in, 0 hours runtime on panel.",
          repairPhotos: JSON.stringify(["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80"]),
          batteryHealth: null,
        },
        {
          serialOrImei: "LGC355OLED92",
          grade: "A",
          source: "OPEN_BOX",
          costPaise: 7100000,
          repairNotes: "Motherboard HDMI 2.1 chip verified with 4K 120Hz test console. Display is pristine.",
          repairPhotos: JSON.stringify([]),
          batteryHealth: null,
        }
      ],
      reviews: [
        { userName: "Suraj G.", rating: 5, comment: "OLED blacks are breathtaking. Certified mint condition is an incredible deal." }
      ]
    },
    {
      title: "LG 8.0 Kg Front Load Smart Inverter Washing Machine (Untouched Mint)",
      slug: "lg-8kg-front-load-washing-machine-pristine",
      brand: "LG",
      modelNumber: "FHM1408BDW",
      category: "appliances",
      description: "6 Motion Direct Drive technology, Steam wash allergy care, Smart Diagnosis with ThinQ, stainless steel drum, 1400 RPM spin speed, 5-star energy rating.",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=1000&q=80"
      ]),
      mrp: 4499000, // ₹44,990
      warrantyMonths: 6,
      returnDays: 7,
      units: [
        {
          serialOrImei: "LGWM8KGF1001",
          grade: "A_PLUS",
          source: "OPEN_BOX",
          costPaise: 2100000,
          repairNotes: "Drum shock dampers and inlet valve tested to factory spec. Descaled and sanitized. Spin balance test passed.",
          repairPhotos: JSON.stringify([]),
          batteryHealth: null,
        },
        {
          serialOrImei: "LGWM8KGF1002",
          grade: "A",
          source: "OPEN_BOX",
          costPaise: 1600000,
          repairNotes: "Completely sanitized drum, motor runs quiet, tested 5 full wash cycles.",
          repairPhotos: JSON.stringify([]),
          batteryHealth: null,
        }
      ],
      reviews: [
        { userName: "Manju Patel", rating: 5, comment: "Works like a charm. Silent motor and looks untouched. Technicians helped unpack too." }
      ]
    },
    {
      title: "Samsung 7.0 Kg Fully-Automatic Top Load Washing Machine (Pristine Open-Box)",
      slug: "samsung-7kg-top-load-washing-machine-open-box",
      brand: "Samsung",
      modelNumber: "WA70A4002GS",
      category: "appliances",
      description: "Diamond Drum, Wobble technology for gentle fabric care, Magic Filter, Air Turbo drying system, Child Lock, 5-star energy rated.",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?auto=format&fit=crop&w=1000&q=80"
      ]),
      mrp: 2100000, // ₹21,000
      warrantyMonths: 6,
      returnDays: 7,
      units: [
        {
          serialOrImei: "SMWM7KGT2001",
          grade: "A_PLUS",
          source: "OPEN_BOX",
          costPaise: 1100000,
          repairNotes: "Open-box return. Unused unit in factory wrap. Complete water drain and spin test completed.",
          repairPhotos: JSON.stringify([]),
          batteryHealth: null,
        },
        {
          serialOrImei: "SMWM7KGT2002",
          grade: "A",
          source: "OPEN_BOX",
          costPaise: 900000,
          repairNotes: "Pristine condition. Motor calibrated. 100% operational.",
          repairPhotos: JSON.stringify([]),
          batteryHealth: null,
        }
      ],
      reviews: [
        { userName: "Arun K.", rating: 5, comment: "Looks unused and washes properly. Great quality." }
      ]
    }
  ];

  let totalProducts = 0;
  let totalUnits = 0;

  for (const p of productsData) {
    const { units, reviews, ...prodData } = p;
    const createdProduct = await prisma.product.create({
      data: prodData,
    });
    totalProducts++;

    for (const u of units) {
      const { price, floor } = suggestPrice(createdProduct.mrp, u.grade, u.costPaise);
      await prisma.unit.create({
        data: {
          productId: createdProduct.id,
          serialOrImei: u.serialOrImei,
          grade: u.grade,
          source: u.source,
          costPaise: u.costPaise,
          repairNotes: u.repairNotes,
          repairPhotos: u.repairPhotos,
          batteryHealth: u.batteryHealth,
          pricePaise: price,
          floorPaise: floor,
          status: "AVAILABLE",
        },
      });
      totalUnits++;
    }

    if (reviews && reviews.length > 0) {
      for (const rev of reviews) {
        await prisma.review.create({
          data: {
            productId: createdProduct.id,
            userName: rev.userName,
            rating: rev.rating,
            comment: rev.comment,
            verifiedPurchase: true,
          },
        });
      }
    }
  }

  console.log(`Database seeded with pristine untouched products! Created ${totalProducts} products and ${totalUnits} units.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
