import { NextRequest, NextResponse } from "next/server";
import { cuelinksProvider } from "@/lib/affiliate/cuelinks-provider";
import { recordAffiliateLink } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * Outbound Affiliate Redirection & Monetization Handler
 *
 * Validates external destination URLs, performs server-side conversion via
 * Cuelinks V3 when available, records conversion metrics to Supabase,
 * and securely redirects the visitor to the monetized destination.
 */
export async function GET(request: NextRequest) {
  try {
    const targetUrl = request.nextUrl.searchParams.get("url");

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

    // Check if Cuelinks API key is configured
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

        // Record telemetry to Supabase
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
        // Fallback silently to direct URL if conversion fails
        console.warn("Cuelinks dynamic conversion fallback:", err);
      }
    }

    // Return temporary redirect to destination storefront
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
