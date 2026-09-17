import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: string | number | null | undefined, currency?: string | null): string {
  if (price === null || price === undefined || price === "") return "";
  const str = String(price).trim();
  if (str.startsWith("₹") || str.startsWith("$") || str.startsWith("€") || str.startsWith("£")) {
    return str;
  }
  const isINR = currency === "INR" || /^(?:₹|INR)/i.test(str);
  const num = typeof price === "number" ? price : parseFloat(str.replace(/[^0-9.]/g, ""));
  if (!isNaN(num)) {
    if (isINR) {
      return `₹${num.toLocaleString("en-IN")}`;
    }
    return `$${num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }
  return isINR ? `₹${str}` : `$${str}`;
}

export function calculateDiscount(price: string | number, oldPrice: string | number): number {
  const p = typeof price === "number" ? price : parseFloat(String(price).replace(/[^0-9.]/g, ""));
  const op = typeof oldPrice === "number" ? oldPrice : parseFloat(String(oldPrice).replace(/[^0-9.]/g, ""));
  if (isNaN(p) || isNaN(op) || op <= p) return 0;
  return Math.round(((op - p) / op) * 100);
}

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://smartpick-dealss.vercel.app";
  return url.replace(/\/+$/, "");
}
