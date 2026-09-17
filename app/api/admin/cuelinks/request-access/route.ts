import { NextRequest, NextResponse } from "next/server";
import { cuelinksProvider } from "@/lib/affiliate/cuelinks-provider";

export const dynamic = "force-dynamic";

/**
 * PHASE 5 — CAMPAIGN ACCESS REQUEST ENDPOINT
 * 
 * POST /api/admin/cuelinks/request-access
 * 
 * Submits access application for campaigns requiring approval.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignId } = body;

    if (!campaignId) {
      return NextResponse.json(
        { success: false, error: "campaignId is required." },
        { status: 400 }
      );
    }

    const result = await cuelinksProvider.requestAccess(campaignId);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to request access",
      },
      { status: err.statusCode || 500 }
    );
  }
}
