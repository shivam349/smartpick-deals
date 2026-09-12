import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: string | number): string {
  if (typeof price === "number") {
    return `$${price.toFixed(2)}`;
  }
  if (!price) return "$0.00";
  return price.startsWith("$") ? price : `$${price}`;
}

export function calculateDiscount(price: string, oldPrice: string): number {
  const p = parseFloat(price.replace(/[^0-9.]/g, ""));
  const op = parseFloat(oldPrice.replace(/[^0-9.]/g, ""));
  if (isNaN(p) || isNaN(op) || op <= p) return 0;
  return Math.round(((op - p) / op) * 100);
}

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://smartpick-dealss.vercel.app";
  return url.replace(/\/+$/, "");
}
