import { NextRequest, NextResponse } from "next/server";
import { cuelinksProvider } from "@/lib/affiliate/cuelinks-provider";
import { upsertAffiliateCampaigns } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * PHASE 2 — DISCOVER CAMPAIGNS ENDPOINT
 * 
 * GET /api/admin/cuelinks/campaigns
 * 
 * Retrieves campaigns, maps metadata, categorizes into access groups,
 * and saves to Supabase affiliate_campaigns.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const perPage = parseInt(searchParams.get("per_page") || "30", 10);
    const query = searchParams.get("query") || undefined;
    const country = searchParams.get("country");
    const category = searchParams.get("category") || undefined;
    const accessStatus = searchParams.get("access_status") || undefined;

    // By default, if country is 'india' or '100' or default, use countryId = 100
    let countryId: number | undefined;
    if (country === "india" || country === "100" || country === "IN") {
      countryId = 100;
    } else if (country === "all") {
      countryId = undefined;
    } else if (!country) {
      // default to India for SmartPick
      countryId = 100;
    }

    const result = await cuelinksProvider.searchCampaigns({
      page,
      perPage,
      query,
      countryId,
      category,
      accessStatus,
    });

    // Background sync into Supabase
    if (result.campaigns.length > 0) {
      upsertAffiliateCampaigns(result.campaigns).catch((err) =>
        console.error("Async Supabase upsert error:", err)
      );
    }

    return NextResponse.json({
      success: true,
      data: result.campaigns,
      pagination: {
        page: result.page,
        per_page: perPage,
        total: result.total,
        total_pages: result.totalPages,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to retrieve campaigns",
      },
      { status: err.statusCode || 500 }
    );
  }
}
