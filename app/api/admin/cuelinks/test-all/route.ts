import { NextResponse } from "next/server";
import { listCampaigns, convertLink } from "@/lib/cuelinks";
import { recordAffiliateLink } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * PHASE 6 — BROAD AUTOMATED TEST ENDPOINT
 * 
 * POST /api/admin/cuelinks/test-all
 * 
 * Tests a safe, rate-limited sample of campaigns across diverse categories
 * using legitimate merchant URLs. Never hammers the API.
 */
export async function POST() {
  try {
    // 1. Fetch campaigns for India
    const campRes = await listCampaigns({
      country_id: 100,
      per_page: 60,
      page: 1,
    });

    const campaigns = campRes.data || [];

    // 2. Select a curated safe sample of diverse categories:
    // Electronics, Fashion, Beauty, Home, Food/Grocery, Travel, Services
    const targetCategories = [
      "Electronics",
      "Fashion",
      "Health & Beauty",
      "Home & Kitchen",
      "Food & Grocery",
      "Travel",
    ];

    const sampleCampaigns: typeof campaigns = [];
    const seenCategories = new Set<string>();

    // First, pick 1-2 campaigns per category
    for (const cat of targetCategories) {
      const match = campaigns.find(
        (c) =>
          c.categories?.some((cc) => cc.name.toLowerCase() === cat.toLowerCase()) &&
          !sampleCampaigns.some((sc) => sc.id === c.id) &&
          c.url &&
          c.url.startsWith("http")
      );
      if (match) {
        sampleCampaigns.push(match);
        seenCategories.add(cat);
      }
    }

    // Also ensure we test BoAt (known active monetizable) and sample e-commerce
    const boatCamp = campaigns.find((c) => c.name.toLowerCase().includes("boat"));
    if (boatCamp && !sampleCampaigns.some((sc) => sc.id === boatCamp.id)) {
      sampleCampaigns.push(boatCamp);
    }

    // Include representative test cases from Phase 5 if found
    const keyMerchants = ["flipkart", "amazon", "croma", "nykaa"];
    for (const km of keyMerchants) {
      const match = campaigns.find((c) => c.name.toLowerCase().includes(km));
      if (match && !sampleCampaigns.some((sc) => sc.id === match.id)) {
        sampleCampaigns.push(match);
      }
    }

    // Limit safe test size to maximum 8 campaigns
    const testBatch = sampleCampaigns.slice(0, 8);

    const testResults: any[] = [];
    let monetizableCount = 0;
    let nonMonetizableCount = 0;

    // 3. Sequentially test each campaign with rate limiting (300ms pause)
    for (const c of testBatch) {
      const testUrl = c.url;
      try {
        const convertRes = await convertLink({
          url: testUrl,
          shorten: true,
          subid: "batch_test",
          subid2: "admin_auto",
        });

        const isAffiliated = Boolean(convertRes.data.affiliated);
        if (isAffiliated) {
          monetizableCount++;
        } else {
          nonMonetizableCount++;
        }

        const resultItem = {
          campaignId: c.id,
          merchantName: c.name,
          category: c.categories?.[0]?.name || "Other",
          accessStatus: c.access_status,
          testUrl,
          trackingUrl: convertRes.data.tracking_url,
          shortUrl: convertRes.data.short_url || convertRes.data.shorten_url,
          affiliated: isAffiliated,
          monetizable: isAffiliated,
          statusReason: isAffiliated
            ? "Monetizable: Active publisher permissions verified"
            : `Non-Monetizable: Campaign access is ${c.access_status}`,
        };

        testResults.push(resultItem);

        // Record to Supabase
        await recordAffiliateLink({
          provider: "cuelinks",
          campaign_id: c.id,
          original_url: testUrl,
          tracking_url: convertRes.data.tracking_url,
          short_url: convertRes.data.short_url,
          affiliated: isAffiliated,
          subid: "batch_test",
          subid2: "admin_auto",
        }).catch(() => {});

        // Polite rate-limiting sleep (300ms)
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (err: any) {
        testResults.push({
          campaignId: c.id,
          merchantName: c.name,
          category: c.categories?.[0]?.name || "Other",
          accessStatus: c.access_status,
          testUrl,
          error: err.message,
          affiliated: false,
          monetizable: false,
          statusReason: `Conversion error: ${err.message}`,
        });
        nonMonetizableCount++;
      }
    }

    return NextResponse.json({
      success: true,
      testedCount: testResults.length,
      monetizableCount,
      nonMonetizableCount,
      summary: `${monetizableCount} of ${testResults.length} tested merchant campaigns are monetizable (affiliated === true).`,
      results: testResults,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to execute batch test",
      },
      { status: err.statusCode || 500 }
    );
  }
}
