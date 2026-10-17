export const GRADE_DISCOUNT: Record<string, number> = {
  A_PLUS: 0.30,
  A: 0.38,
  B: 0.46,
  C: 0.55, // discount off MRP
};

export function suggestPrice(
  mrpPaise: number,
  grade: string,
  costPaise: number
): { price: number; floor: number } {
  const discountRate = GRADE_DISCOUNT[grade] ?? 0.38;
  const target = Math.round(mrpPaise * (1 - discountRate));
  const floor = Math.round(costPaise * 1.12); // minimum 12% margin over cost incl. repair
  return { price: Math.max(target, floor), floor };
}

// Exit offer is allowed only if the discounted price stays above the floor
export function applyExitOffer(
  pricePaise: number,
  floorPaise: number,
  percent = 5
): { ok: boolean; discounted: number; savingsPaise: number } {
  const discounted = Math.round(pricePaise * (1 - percent / 100));
  if (discounted < floorPaise) {
    return { ok: false, discounted: pricePaise, savingsPaise: 0 };
  }
  return { ok: true, discounted, savingsPaise: pricePaise - discounted };
}
