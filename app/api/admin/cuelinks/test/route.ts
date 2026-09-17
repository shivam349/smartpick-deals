import { NextResponse } from "next/server";
import { ping, listCampaigns } from "@/lib/cuelinks";

export const dynamic = "force-dynamic";

/**
 * PHASE 1 — API HEALTH CHECK ENDPOINT
 * 
 * GET /api/admin/cuelinks/test
 * 
 * Verifies connectivity, publisher metadata, API key scopes, and counts
 * across accessibility tiers without exposing secrets.
 */
export async function GET() {
  try {
    // 1. Verify /ping
    const pingRes = await ping();

    // 2. Discover sample campaigns to compute accessibility breakdown
    // We fetch India campaigns first (country_id = 100)
    const indiaCampRes = await listCampaigns({
      country_id: 100,
      per_page: 100,
      page: 1,
    });

    // Also get general count from global meta
    const globalCampRes = await listCampaigns({
      per_page: 30,
      page: 1,
    });

    const indiaCampaigns = indiaCampRes.data || [];
    let accessibleCount = 0;
    let approvalRequiredCount = 0;
    let inactiveCount = 0;

    for (const c of indiaCampaigns) {
      const status = (c.access_status || "").toLowerCase();
      if (status === "open" || status === "active" || status === "approved") {
        accessibleCount++;
      } else if (status === "not_applied" || status === "pending" || status === "paused") {
        approvalRequiredCount++;
      } else {
        inactiveCount++;
      }
    }

    return NextResponse.json({
      connected: true,
      provider: "cuelinks",
      version: pingRes.version || "3.0",
      publisher: {
        id: pingRes.publisher.publisher_id || pingRes.publisher.id,
        name: pingRes.publisher.name,
        currency: pingRes.publisher.currency,
      },
      apiKey: {
        name: pingRes.api_key?.name,
        scopes: pingRes.api_key?.scopes || [],
        last_used_at: pingRes.api_key?.last_used_at,
      },
      campaigns: {
        total_global: globalCampRes.meta?.total || 0,
        total_india: indiaCampRes.meta?.total || 0,
        sample_analyzed: indiaCampaigns.length,
        accessible: accessibleCount,
        approval_required: approvalRequiredCount,
        inactive_unavailable: inactiveCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        connected: false,
        provider: "cuelinks",
        error: err.message || "Failed to communicate with Cuelinks API",
        statusCode: err.statusCode || 500,
        timestamp: new Date().toISOString(),
      },
      { status: err.statusCode && err.statusCode >= 400 && err.statusCode < 600 ? err.statusCode : 500 }
    );
  }
}
