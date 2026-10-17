export interface GradeInfo {
  code: "A_PLUS" | "A" | "B" | "C";
  label: string;
  tag: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export const GRADES: Record<string, GradeInfo> = {
  A_PLUS: {
    code: "A_PLUS",
    label: "Pristine Untouched",
    tag: "Brand New Feel",
    description: "Flawless condition, zero marks, battery health 90%+, factory verified",
    badgeBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    badgeBorder: "border-emerald-300 dark:border-emerald-800",
  },
  A: {
    code: "A",
    label: "Mint (Like New)",
    tag: "Mint Condition",
    description: "Super clean, practically untouched at arm's length, 100% factory performance",
    badgeBg: "bg-blue-500/10 dark:bg-blue-500/20",
    badgeText: "text-blue-700 dark:text-blue-300",
    badgeBorder: "border-blue-300 dark:border-blue-800",
  },
  B: {
    code: "B",
    label: "Very Good",
    tag: "Pristine Screen",
    description: "Flawless screen, light handling micro-marks on outer frame",
    badgeBg: "bg-amber-500/10 dark:bg-amber-500/20",
    badgeText: "text-amber-700 dark:text-amber-300",
    badgeBorder: "border-amber-300 dark:border-amber-800",
  },
  C: {
    code: "C",
    label: "Smart Choice",
    tag: "Certified Value",
    description: "Minor cosmetic handling marks, verified 100% factory performance",
    badgeBg: "bg-orange-500/10 dark:bg-orange-500/20",
    badgeText: "text-orange-700 dark:text-orange-300",
    badgeBorder: "border-orange-300 dark:border-orange-800",
  },
};

export const SOURCE_LABELS: Record<string, string> = {
  REFURBISHED: "Certified Quality Assured",
  OPEN_BOX: "Open-Box (Pristine Unused)",
  REPAIRED: "Factory Tested & Calibrated",
  PREOWNED: "Quality Inspected",
};

export function getGradeInfo(grade: string): GradeInfo {
  return (
    GRADES[grade] ?? {
      code: "A",
      label: "Certified Mint",
      tag: "Untouched Feel",
      description: "Tested and certified 100% functional",
      badgeBg: "bg-emerald-50",
      badgeText: "text-emerald-800",
      badgeBorder: "border-emerald-300",
    }
  );
}
