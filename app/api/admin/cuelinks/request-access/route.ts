import { NextRequest, NextResponse } from "next/server";
import { cuelinksProvider } from "@/lib/affiliate/cuelinks-provider";
import { canRequestAccess, getCampaign, SMARTPICK_PROMOTION_DETAILS } from "@/lib/cuelinks";
import { recordAccessRequest } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * PHASE 5 & WORKFLOW OPTIMIZATION — CAMPAIGN ACCESS REQUEST ENDPOINT
 * 
 * POST /api/admin/cuelinks/request-access
 * 
 * Rules:
 * 1. Only allow request when access_status === "not_applied".
 * 2. Reject request for open, approved, pending, paused, or blocked campaigns.
 * 3. Submit truthful promotion_details anchored to https://smartpick-dealss.vercel.app/.
 * 4. Pass channel_id only if verified; otherwise omit so Cuelinks uses default channel.
 * 5. Record request audit to Supabase affiliate_access_requests table.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignId, channel_id } = body;

    if (!campaignId) {
      return NextResponse.json(
        { success: false, error: "campaignId is required." },
        { status: 400 }
      );
    }

    const numericCampaignId = Number(campaignId);
    if (isNaN(numericCampaignId)) {
      return NextResponse.json(
        { success: false, error: "campaignId must be a valid number." },
        { status: 400 }
      );
    }

    // 1. Verify current campaign status before submitting request
    const campaignRes = await getCampaign(numericCampaignId);
    const campaign = campaignRes?.data;

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: `Campaign with ID ${numericCampaignId} not found.` },
        { status: 404 }
      );
    }

    const check = canRequestAccess(campaign.access_status);
    if (!check.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: check.reason,
          access_status: campaign.access_status,
        },
        { status: 400 }
      );
    }

    // 2. Submit access application to Cuelinks V3
    const promotionDetails = SMARTPICK_PROMOTION_DETAILS;
    const result = await cuelinksProvider.requestAccess(numericCampaignId, {
      promotion_details: promotionDetails,
      channel_id: channel_id || undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.message || "Cuelinks rejected the application request.",
        },
        { status: 422 }
      );
    }

    // 3. Store request audit record in Supabase
    recordAccessRequest({
      requestId: result.id || null,
      campaignId: numericCampaignId,
      channelId: result.channelId || null,
      promotionDetails,
      requestStatus: result.status || "pending",
    }).catch((err) => console.error("Async Supabase request log error:", err));

    return NextResponse.json({
      success: true,
      message: "Request submitted",
      status: "pending",
      requestId: result.id,
      campaignId: numericCampaignId,
      channelId: result.channelId,
      createdAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to process access request",
      },
      { status: err.statusCode || 500 }
    );
  }
}
