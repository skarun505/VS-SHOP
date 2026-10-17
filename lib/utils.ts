import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

export function calculateSavingsPercent(mrpPaise: number, pricePaise: number): number {
  if (!mrpPaise || mrpPaise <= pricePaise) return 0;
  return Math.round(((mrpPaise - pricePaise) / mrpPaise) * 100);
}

export function maskSerialOrImei(serial: string): string {
  if (!serial || serial.length <= 4) return serial;
  return "•".repeat(Math.max(0, serial.length - 4)) + serial.slice(-4);
}
