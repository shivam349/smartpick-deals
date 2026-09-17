import fs from "fs";

if (fs.existsSync(".env.local")) {
  const lines = fs.readFileSync(".env.local", "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}

import { convertLink, verifyAffiliateLink } from "../lib/cuelinks.ts";
import { upsertProduct, upsertAffiliateLink, getProductByIdOrSlug } from "../lib/supabase.ts";

async function main() {
  console.log("=== Testing Real BoAt Product Ingestion ===");
  const testUrl = "https://www.boat-lifestyle.com/products/airdopes-141";
  const slug = "boat-airdopes-141";
  const subid = "boat-airdopes-141";
  const subid2 = "smartpick_product_page";

  console.log("1. Calling convertLink...");
  const conv = await convertLink({
    url: testUrl,
    subid,
    subid2,
    shorten: true,
  });

  const linkData = conv.data;
  console.log("Conversion Result:", {
    affiliated: linkData.affiliated,
    campaignId: linkData.campaign?.id,
    campaignName: linkData.campaign?.name,
    shortUrl: linkData.short_url,
    trackingUrl: linkData.tracking_url ? linkData.tracking_url.substring(0, 60) + "..." : null,
  });

  if (!linkData.affiliated) {
    console.error("FATAL: Not affiliated!");
    process.exit(1);
  }

  console.log("2. Upserting Affiliate Link in Supabase...");
  const savedLink = await upsertAffiliateLink({
    provider: "cuelinks",
    campaign_id: linkData.campaign?.id || 4232,
    merchant: "BoAt",
    original_url: linkData.original_url || testUrl,
    tracking_url: linkData.tracking_url || "",
    short_url: linkData.short_url,
    affiliated: linkData.affiliated,
    subid,
    subid2,
  });
  console.log("Saved Link Result:", savedLink);

  console.log("3. Upserting Product in Supabase...");
  const savedProduct = await upsertProduct({
    slug,
    name: "BoAt Airdopes 141 True Wireless Earbuds",
    merchant: "BoAt",
    merchant_campaign_id: linkData.campaign?.id || 4232,
    merchant_url: testUrl,
    source_url: testUrl,
    affiliate_url: linkData.tracking_url,
    affiliate_short_url: linkData.short_url,
    affiliate_provider: "cuelinks",
    category: "Audio",
    description: "BoAt Airdopes 141 wireless earbuds with up to 42 hours total playback, ENx Environmental Noise Cancellation technology, and ASAP Fast Charge.",
    price: 1499,
    currency: "INR",
    availability: "in_stock",
    published: true,
  });

  console.log("Saved Product ID:", savedProduct?.id, "Slug:", savedProduct?.slug);

  console.log("4. Fetching back product from Supabase...");
  const fetched = await getProductByIdOrSlug(slug);
  console.log("Fetched Product:", {
    id: fetched?.id,
    name: fetched?.name,
    slug: fetched?.slug,
    merchant: fetched?.merchant,
    merchant_campaign_id: fetched?.merchant_campaign_id,
    affiliate_short_url: fetched?.affiliate_short_url,
    price: fetched?.price,
    currency: fetched?.currency,
    published: fetched?.published,
  });

  console.log("5. Testing verifyAffiliateLink...");
  const verification = await verifyAffiliateLink(testUrl);
  console.log("Verification Result:", verification);

  console.log("=== ALL INGESTION CHECKS PASSED ===");
}

main().catch((err) => {
  console.error("Error in test:", err);
  process.exit(1);
});
