import { NextRequest, NextResponse } from "next/server";
import { verifyAffiliateLink } from "@/lib/cuelinks";
import { upsertProduct, upsertAffiliateLink } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * End-to-End Affiliate Product Ingestion Endpoint
 * 
 * POST /api/admin/cuelinks/product
 * 
 * Workflow:
 * 1. Validate merchant destination URL and domain.
 * 2. Convert through Cuelinks V3 and verify affiliated === true.
 * 3. If affiliated === false: ABORT. Do NOT publish.
 * 4. Persist affiliate link record into Supabase (deduplicated).
 * 5. Persist verified product record into Supabase.
 * 6. Return created product and affiliate details.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      merchant = "BoAt",
      campaignId = 4232,
      url,
      slug,
      title,
      imageUrl,
      description,
      price,
      category = "Audio & Electronics",
      subid = "boat-airdopes-141",
      subid2 = "smartpick_product_page",
    } = body;

    // 1. Validate inputs
    if (!url || typeof url !== "string" || !url.startsWith("http")) {
      return NextResponse.json(
        { success: false, error: "A valid merchant HTTP/HTTPS URL is required." },
        { status: 400 }
      );
    }

    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        { success: false, error: "A valid product slug is required." },
        { status: 400 }
      );
    }

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { success: false, error: "A product title is required." },
        { status: 400 }
      );
    }

    // Domain validation for BoAt or specific merchants
    if (merchant.toLowerCase() === "boat" && !url.includes("boat-lifestyle.com")) {
      return NextResponse.json(
        { success: false, error: "URL does not match BoAt merchant domain (boat-lifestyle.com)." },
        { status: 422 }
      );
    }

    // 2. Server-side conversion and monetization verification
    const verification = await verifyAffiliateLink(url, {
      subid,
      subid2,
      campaignId: Number(campaignId),
    });

    // 3. Strict monetization rule: affiliated === true
    if (!verification.affiliated) {
      return NextResponse.json(
        {
          success: false,
          error: "Not currently monetizable — access/campaign status must be reviewed.",
          details: verification.statusReason,
          affiliated: false,
        },
        { status: 422 }
      );
    }

    // 4. Save/update affiliate link in Supabase
    await upsertAffiliateLink({
      provider: "cuelinks",
      campaign_id: Number(campaignId),
      merchant,
      original_url: url,
      tracking_url: verification.trackingUrl,
      short_url: verification.shortUrl,
      affiliated: true,
      subid,
      subid2,
    });

    // 5. Save/update product record in Supabase
    const cleanPrice = price && String(price).trim() !== "" ? String(price).trim() : null;

    const productRecord = await upsertProduct({
      name: title.trim(),
      slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
      merchant,
      merchant_campaign_id: Number(campaignId),
      merchant_url: url,
      source_url: url,
      affiliate_url: verification.trackingUrl,
      affiliate_short_url: verification.shortUrl,
      affiliate_provider: "cuelinks",
      category,
      description: description || "",
      image_url: imageUrl || "",
      price: cleanPrice,
      currency: "INR",
      availability: "in_stock",
      published: true,
      last_verified_at: verification.lastVerifiedAt,
    });

    return NextResponse.json({
      success: true,
      monetizable: true,
      product: productRecord,
      affiliateLink: {
        originalUrl: url,
        trackingUrl: verification.trackingUrl,
        shortUrl: verification.shortUrl,
        affiliated: true,
        campaignId: Number(campaignId),
      },
      productUrl: `/product/${slug}`,
      message: `Product successfully ingested and monetized for ${merchant}!`,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to ingest affiliate product",
      },
      { status: err.statusCode || 500 }
    );
  }
}
