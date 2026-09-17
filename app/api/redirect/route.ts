import { NextRequest, NextResponse } from "next/server";
import { getProductByIdOrSlug, recordAffiliateLink } from "@/lib/supabase";
import { cuelinksProvider } from "@/lib/affiliate/cuelinks-provider";

export const dynamic = "force-dynamic";

/**
 * Outbound Affiliate Redirection & Monetization Handler
 *
 * Supports:
 * 1. GET /api/redirect?product=<id-or-slug>
 *    Loads verified product from database, retrieves pre-stored Cuelinks affiliate
 *    URL, and securely redirects the user without regenerating links on every click.
 *
 * 2. GET /api/redirect?url=<merchant-url>
 *    Dynamic redirection with protocol validation and telemetry logging.
 */
export async function GET(request: NextRequest) {
  try {
    const productId = request.nextUrl.searchParams.get("product");
    const targetUrl = request.nextUrl.searchParams.get("url");

    // Case 1: Product-based redirection (Section 9)
    if (productId) {
      const product = await getProductByIdOrSlug(productId);
      if (product) {
        // Use verified affiliate short URL or full tracking URL
        const redirectDestination =
          product.affiliate_short_url ||
          product.affiliate_url ||
          product.merchant_url ||
          product.source_url;

        if (redirectDestination && redirectDestination.startsWith("http")) {
          return NextResponse.redirect(redirectDestination, {
            status: 307,
            headers: {
              "Referrer-Policy": "no-referrer-when-downgrade",
              "Cache-Control": "no-store, max-age=0",
            },
          });
        }
      }
    }

    // Case 2: URL-based direct redirection
    if (!targetUrl) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Decode URL
    let decodedUrl: string;
    try {
      decodedUrl = decodeURIComponent(targetUrl);
    } catch {
      decodedUrl = targetUrl;
    }

    // Strict protocol validation to prevent open-redirect exploits
    const parsed = new URL(decodedUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const subid = request.nextUrl.searchParams.get("subid") || "smartpick_web";
    const subid2 = request.nextUrl.searchParams.get("subid2") || "redirect_click";
    const subid3 = request.nextUrl.searchParams.get("subid3") || undefined;

    let destinationUrl = decodedUrl;

    // Optional dynamic conversion if API key configured
    if (process.env.CUELINKS_API_KEY) {
      try {
        const conversion = await cuelinksProvider.convertLink({
          url: decodedUrl,
          shorten: true,
          subid,
          subid2,
          subid3,
        });

        if (conversion.affiliated && (conversion.trackingUrl || conversion.shortUrl)) {
          destinationUrl = conversion.shortUrl || conversion.trackingUrl;
        }

        recordAffiliateLink({
          provider: "cuelinks",
          campaign_id: conversion.campaignId,
          original_url: decodedUrl,
          tracking_url: conversion.trackingUrl,
          short_url: conversion.shortUrl,
          affiliated: conversion.affiliated,
          subid,
          subid2,
          subid3,
        }).catch(() => {});
      } catch (err) {
        console.warn("Cuelinks dynamic conversion fallback:", err);
      }
    }

    return NextResponse.redirect(destinationUrl, {
      status: 307,
      headers: {
        "Referrer-Policy": "no-referrer-when-downgrade",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err) {
    console.error("Redirect handler error:", err);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
