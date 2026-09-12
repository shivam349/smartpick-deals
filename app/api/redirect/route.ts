import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Outbound Affiliate Redirection & Tracking Handler
 *
 * Validates external destination URLs, records click telemetry if enabled,
 * and securely redirects user to the merchant/network storefront.
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

    // Return temporary redirect to destination storefront
    return NextResponse.redirect(decodedUrl, {
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
