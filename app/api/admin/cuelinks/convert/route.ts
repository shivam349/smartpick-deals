import { NextRequest, NextResponse } from "next/server";
import { cuelinksProvider } from "@/lib/affiliate/cuelinks-provider";
import { recordAffiliateLink } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * PHASE 4 & 10 — LINK CONVERSION & ATTRIBUTION TEST ENDPOINT
 * 
 * POST /api/admin/cuelinks/convert
 * 
 * Securely converts merchant URLs via Cuelinks V3.
 * Enforces rule: affiliated === true is required for monetization.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      url,
      shorten = true,
      subid = "admin_test",
      subid2,
      subid3,
      subid4,
      subid5,
      channel_id,
    } = body;

    if (!url || typeof url !== "string" || !url.startsWith("http")) {
      return NextResponse.json(
        {
          success: false,
          error: "A valid merchant HTTP/HTTPS URL is required.",
        },
        { status: 422 }
      );
    }

    const conversion = await cuelinksProvider.convertLink({
      url,
      shorten,
      subid,
      subid2,
      subid3,
      subid4,
      subid5,
      channelId: channel_id,
    });

    // Save conversion record to Supabase
    recordAffiliateLink({
      provider: conversion.provider,
      campaign_id: conversion.campaignId,
      original_url: conversion.originalUrl,
      tracking_url: conversion.trackingUrl,
      short_url: conversion.shortUrl,
      affiliated: conversion.affiliated,
      channel_id,
      subid,
      subid2,
      subid3,
      subid4,
      subid5,
    }).catch((err) => console.error("Async Supabase link recording error:", err));

    return NextResponse.json({
      success: true,
      data: {
        ...conversion,
        statusBadge: conversion.affiliated ? "MONETIZABLE" : "NOT CURRENTLY MONETIZABLE",
        statusReason: conversion.statusReason || (conversion.affiliated ? "Active & approved for publisher commission" : "Lacks publisher approval"),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to convert URL",
      },
      { status: err.statusCode || 500 }
    );
  }
}
