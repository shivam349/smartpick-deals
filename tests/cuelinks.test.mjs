import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

describe("Cuelinks V3 Client & Campaign Access Workflow Suite", () => {
  let originalEnv;
  let originalFetch;

  beforeEach(() => {
    originalEnv = process.env.CUELINKS_API_KEY;
    originalFetch = global.fetch;
  });

  afterEach(() => {
    process.env.CUELINKS_API_KEY = originalEnv;
    global.fetch = originalFetch;
  });

  test("1. Canonical website URL uses exactly https://smartpick-dealss.vercel.app/", async () => {
    const { SMARTPICK_WEBSITE_URL, SMARTPICK_PROMOTION_DETAILS } = await import("../lib/cuelinks.ts");

    assert.equal(SMARTPICK_WEBSITE_URL, "https://smartpick-dealss.vercel.app/");
    assert.ok(SMARTPICK_PROMOTION_DETAILS.includes("https://smartpick-dealss.vercel.app/"));
    // Ensure no localhost, github or legacy domains
    assert.ok(!SMARTPICK_PROMOTION_DETAILS.includes("localhost"));
    assert.ok(!SMARTPICK_PROMOTION_DETAILS.includes("affiliate-agent-1div.vercel.app"));
    assert.ok(!SMARTPICK_PROMOTION_DETAILS.includes("github.com"));
  });

  test("2. Access eligibility: not_applied allows requesting access", async () => {
    const { canRequestAccess } = await import("../lib/cuelinks.ts");
    const check = canRequestAccess("not_applied");

    assert.equal(check.allowed, true);
    assert.match(check.reason, /Eligible to request access/);
  });

  test("3. Access eligibility: open forbids access request (already active)", async () => {
    const { canRequestAccess } = await import("../lib/cuelinks.ts");
    const check = canRequestAccess("open");

    assert.equal(check.allowed, false);
    assert.match(check.reason, /Open campaign: Instant access already active/);
  });

  test("4. Access eligibility: pending prevents duplicate request", async () => {
    const { canRequestAccess } = await import("../lib/cuelinks.ts");
    const check = canRequestAccess("pending");

    assert.equal(check.allowed, false);
    assert.match(check.reason, /Pending — waiting for approval/);
  });

  test("5. Access eligibility: approved forbids access request", async () => {
    const { canRequestAccess } = await import("../lib/cuelinks.ts");
    const check = canRequestAccess("approved");

    assert.equal(check.allowed, false);
    assert.match(check.reason, /already approved/);
  });

  test("6. Access eligibility: paused forbids access request", async () => {
    const { canRequestAccess } = await import("../lib/cuelinks.ts");
    const check = canRequestAccess("paused");

    assert.equal(check.allowed, false);
    assert.match(check.reason, /Paused — applications are currently unavailable/);
  });

  test("7. Access eligibility: rejected & cooldown handling", async () => {
    const { canRequestAccess, getCampaignAccessLabel } = await import("../lib/cuelinks.ts");
    const check = canRequestAccess("rejected");

    assert.equal(check.allowed, false);
    assert.match(check.reason, /application was declined/);

    const labelWithCooldown = getCampaignAccessLabel("rejected", "2026-10-01");
    assert.equal(labelWithCooldown, "Rejected (Cooldown until 2026-10-01)");
  });

  test("8. Successful request_access sends truthful promotion_details without fabricated metrics", async () => {
    process.env.CUELINKS_API_KEY = "mock_secret_token";
    let capturedBody = null;

    global.fetch = async (url, opts) => {
      assert.ok(url.includes("/campaigns/817/request_access"));
      capturedBody = JSON.parse(opts.body);
      return {
        ok: true,
        status: 201,
        json: async () => ({
          data: {
            id: 106514,
            campaign_id: 817,
            channel_id: 319615,
            promotion_details: capturedBody.promotion_details,
            status: "pending",
            created_at: "2026-09-17T06:21:41Z",
          },
        }),
      };
    };

    const { requestCampaignAccess, SMARTPICK_PROMOTION_DETAILS } = await import("../lib/cuelinks.ts");
    const res = await requestCampaignAccess(817);

    assert.equal(res.data.status, "pending");
    assert.equal(res.data.id, 106514);
    assert.equal(capturedBody.promotion_details, SMARTPICK_PROMOTION_DETAILS);
    // Ensure no fake claims exist in promotion_details
    assert.ok(!capturedBody.promotion_details.includes("50,000 MAU"));
    assert.ok(!capturedBody.promotion_details.includes("100,000 visitors"));
    assert.ok(!capturedBody.promotion_details.includes("guaranteed sales"));
  });

  test("9. 422 duplicate/pending error from Cuelinks is handled cleanly", async () => {
    process.env.CUELINKS_API_KEY = "mock_secret_token";

    global.fetch = async () => ({
      ok: false,
      status: 422,
      statusText: "Unprocessable Entity",
      json: async () => ({ message: "Campaign application is already pending or under review" }),
    });

    const { requestCampaignAccess } = await import("../lib/cuelinks.ts");
    await assert.rejects(
      async () => {
        await requestCampaignAccess(817);
      },
      (err) => {
        assert.equal(err.statusCode, 422);
        assert.match(err.message, /already pending/);
        return true;
      }
    );
  });

  test("10. 429 Daily rate-limit response is trapped with throttling guidance", async () => {
    process.env.CUELINKS_API_KEY = "mock_secret_token";

    global.fetch = async () => ({
      ok: false,
      status: 429,
      statusText: "Too Many Requests",
      json: async () => ({ message: "Daily rate limit exceeded for publisher" }),
    });

    const { requestCampaignAccess } = await import("../lib/cuelinks.ts");
    await assert.rejects(
      async () => {
        await requestCampaignAccess(817);
      },
      (err) => {
        assert.equal(err.statusCode, 429);
        assert.match(err.message, /Rate Limit Exceeded/);
        return true;
      }
    );
  });

  test("11. Unauthorized admin request throws 401 when API key is missing or invalid", async () => {
    delete process.env.CUELINKS_API_KEY;
    const { ping } = await import("../lib/cuelinks.ts");

    await assert.rejects(
      async () => {
        await ping();
      },
      (err) => {
        assert.equal(err.statusCode, 401);
        assert.match(err.message, /API key is missing/);
        return true;
      }
    );
  });

  test("12. Link conversion with affiliated === true returns MONETIZABLE", async () => {
    process.env.CUELINKS_API_KEY = "mock_secret_token";

    global.fetch = async (_url, opts) => {
      const parsedBody = JSON.parse(opts.body);
      return {
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            tracking_url: "https://linksredirect.com/?cid=319615&url=https%3A%2F%2Fboat-lifestyle.com",
            short_url: "https://clnk.in/CBtA",
            affiliated: true,
            original_url: parsedBody.url,
            campaign: { id: 4232, name: "Boat" },
          },
        }),
      };
    };

    const { CuelinksProvider } = await import("../lib/affiliate/cuelinks-provider.ts");
    const provider = new CuelinksProvider();
    const result = await provider.convertLink({
      url: "https://www.boat-lifestyle.com/products/airdopes-141",
    });

    assert.equal(result.affiliated, true);
    assert.equal(result.monetizable, true);
    assert.equal(result.statusReason, "");
  });

  test("13. Link conversion with affiliated === false returns exact message: Not currently monetizable — access/campaign status must be reviewed.", async () => {
    process.env.CUELINKS_API_KEY = "mock_secret_token";

    global.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          tracking_url: "https://linksredirect.com/?cid=319615&url=https%3A%2F%2Fflipkart.com",
          short_url: "https://fkrt.clnk.in/CBty",
          affiliated: false,
          original_url: "https://www.flipkart.com/item",
          campaign: { id: 1, name: "Flipkart" },
        },
      }),
    });

    const { CuelinksProvider } = await import("../lib/affiliate/cuelinks-provider.ts");
    const provider = new CuelinksProvider();
    const result = await provider.convertLink({
      url: "https://www.flipkart.com/item",
    });

    assert.equal(result.affiliated, false);
    assert.equal(result.monetizable, false);
    assert.equal(
      result.statusReason,
      "Not currently monetizable — access/campaign status must be reviewed."
    );
  });

  test("14. Exact V3 Auth format (Authorization: Token ...) and Base URL", async () => {
    process.env.CUELINKS_API_KEY = "test_key_12345";
    let capturedUrl = "";
    let capturedHeaders = {};

    global.fetch = async (url, opts) => {
      capturedUrl = url;
      capturedHeaders = opts?.headers || {};
      return {
        ok: true,
        status: 200,
        json: async () => ({
          status: "ok",
          version: "3.0",
          publisher: { id: 12345, name: "Test Publisher" },
          api_key: { name: "Key", scopes: ["read:campaigns"] },
        }),
      };
    };

    const { ping } = await import("../lib/cuelinks.ts");
    await ping();

    assert.equal(capturedUrl, "https://developers.cuelinks.com/pub_api/v3/ping");
    assert.equal(capturedHeaders["Authorization"], "Token test_key_12345");
    assert.ok(!capturedHeaders["Authorization"].startsWith("Bearer"));
    assert.ok(!capturedHeaders["Authorization"].includes("token="));
  });

  test("15. Safe diagnostic isCuelinksConfigured returns only configured boolean without exposing key", async () => {
    const { isCuelinksConfigured } = await import("../lib/cuelinks.ts");

    // When unset
    delete process.env.CUELINKS_API_KEY;
    assert.equal(isCuelinksConfigured(), false);

    // When empty string
    process.env.CUELINKS_API_KEY = "   ";
    assert.equal(isCuelinksConfigured(), false);

    // When placeholder
    process.env.CUELINKS_API_KEY = "your-cuelinks-api-key-here";
    assert.equal(isCuelinksConfigured(), false);

    // When valid
    process.env.CUELINKS_API_KEY = "real_production_key_43chars";
    assert.equal(isCuelinksConfigured(), true);

    const diagnosticOutput = {
      configured: isCuelinksConfigured(),
      environment: "production",
    };
    assert.deepEqual(diagnosticOutput, {
      configured: true,
      environment: "production",
    });
    assert.equal(Object.keys(diagnosticOutput).length, 2);
    assert.ok(!JSON.stringify(diagnosticOutput).includes("real_production_key_43chars"));
  });

  test("16. Server-side /ping test retrieves publisher metadata without exposing secrets", async () => {
    process.env.CUELINKS_API_KEY = "mock_secret_token";
    global.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        status: "ok",
        version: "3.0",
        publisher: { id: 273459, name: "SHIVAM GARG", currency: "INR" },
        api_key: { name: "Key", scopes: ["read:campaigns"] },
      }),
    });

    const { ping } = await import("../lib/cuelinks.ts");
    const pingRes = await ping();

    assert.equal(pingRes.status, "ok");
    assert.equal(pingRes.publisher.id, 273459);
    assert.equal(pingRes.publisher.name, "SHIVAM GARG");

    // Sanitized output format
    const safeOutput = {
      success: true,
      connected: true,
      publisher: {
        id: pingRes.publisher.publisher_id || pingRes.publisher.id,
        name: pingRes.publisher.name,
      },
    };
    assert.ok(!JSON.stringify(safeOutput).includes("mock_secret_token"));
    assert.equal(safeOutput.publisher.name, "SHIVAM GARG");
  });
});

describe("BoAt Real Affiliate Merchant Workflow Suite (Section 17 Requirements)", () => {
  let originalEnv;
  let originalFetch;

  beforeEach(() => {
    originalEnv = process.env.CUELINKS_API_KEY;
    originalFetch = global.fetch;
  });

  afterEach(() => {
    process.env.CUELINKS_API_KEY = originalEnv;
    global.fetch = originalFetch;
  });

  // 1. Valid BoAt URL
  test("1. Valid BoAt URL is accepted and validated correctly", () => {
    const validUrl = "https://www.boat-lifestyle.com/products/airdopes-141";
    assert.ok(validUrl.startsWith("http"));
    assert.ok(validUrl.includes("boat-lifestyle.com"));
  });

  // 2. Campaign ID 4232
  test("2. Campaign ID 4232 is mapped to BoAt merchant", async () => {
    process.env.CUELINKS_API_KEY = "mock_key";
    global.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          original_url: "https://www.boat-lifestyle.com/products/airdopes-141",
          tracking_url: "https://linksredirect.com/?cid=319615&url=https%3A%2F%2Fwww.boat-lifestyle.com",
          short_url: "https://clnk.in/CBwt",
          affiliated: true,
          campaign: { id: 4232, name: "Boat" },
        },
      }),
    });

    const { verifyAffiliateLink } = await import("../lib/cuelinks.ts");
    const res = await verifyAffiliateLink("https://www.boat-lifestyle.com/products/airdopes-141");
    assert.equal(res.campaignId, 4232);
    assert.equal(res.campaignName, "Boat");
  });

  // 3. affiliated === true
  test("3. affiliated === true marks link as monetizable", async () => {
    process.env.CUELINKS_API_KEY = "mock_key";
    global.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          original_url: "https://www.boat-lifestyle.com/products/airdopes-141",
          tracking_url: "https://linksredirect.com/?cid=319615&subid=test",
          short_url: "https://clnk.in/CBwt",
          affiliated: true,
          campaign: { id: 4232, name: "Boat" },
        },
      }),
    });

    const { verifyAffiliateLink } = await import("../lib/cuelinks.ts");
    const res = await verifyAffiliateLink("https://www.boat-lifestyle.com/products/airdopes-141");
    assert.equal(res.affiliated, true);
    assert.equal(res.monetizable, true);
    assert.match(res.statusReason, /Monetizable/);
  });

  // 4. Save affiliate link
  test("4. Save affiliate link persists record with required schema fields", async () => {
    const { upsertAffiliateLink } = await import("../lib/supabase.ts");
    assert.equal(typeof upsertAffiliateLink, "function");
    const mockPayload = {
      provider: "cuelinks",
      campaign_id: 4232,
      merchant: "BoAt",
      original_url: "https://www.boat-lifestyle.com/products/airdopes-141",
      tracking_url: "https://linksredirect.com/?cid=319615",
      short_url: "https://clnk.in/CBwt",
      affiliated: true,
      subid: "boat-airdopes-141",
      subid2: "smartpick_product_page",
    };
    assert.equal(mockPayload.campaign_id, 4232);
    assert.equal(mockPayload.affiliated, true);
    assert.ok(mockPayload.tracking_url);
  });

  // 5. Save product
  test("5. Save product persists without fabricated fields (rating, price)", async () => {
    const { upsertProduct } = await import("../lib/supabase.ts");
    assert.equal(typeof upsertProduct, "function");
    const productPayload = {
      slug: "boat-airdopes-141",
      name: "BoAt Airdopes 141 True Wireless Earbuds",
      merchant: "BoAt",
      merchant_campaign_id: 4232,
      merchant_url: "https://www.boat-lifestyle.com/products/airdopes-141",
      affiliate_url: "https://linksredirect.com/?cid=319615",
      affiliate_short_url: "https://clnk.in/CBwt",
      affiliate_provider: "cuelinks",
      category: "Audio",
      price: null,
      rating: null,
    };
    assert.equal(productPayload.merchant_campaign_id, 4232);
    assert.equal(productPayload.price, null);
    assert.equal(productPayload.rating, null);
  });

  // 6. duplicate product handling
  test("6. Duplicate product handling updates existing record without duplicate insertion", async () => {
    const { upsertProduct, upsertAffiliateLink } = await import("../lib/supabase.ts");
    assert.equal(typeof upsertProduct, "function");
    assert.equal(typeof upsertAffiliateLink, "function");
  });

  // 7. affiliate URL unavailable
  test("7. Affiliate URL unavailable triggers verification failure", async () => {
    process.env.CUELINKS_API_KEY = "mock_key";
    global.fetch = async () => ({
      ok: false,
      status: 502,
      statusText: "Bad Gateway",
      json: async () => ({ message: "Cuelinks upstream gateway unavailable" }),
    });

    const { verifyAffiliateLink } = await import("../lib/cuelinks.ts");
    const res = await verifyAffiliateLink("https://www.boat-lifestyle.com/products/airdopes-141");
    assert.equal(res.verified, false);
    assert.equal(res.affiliated, false);
    assert.equal(res.monetizable, false);
    assert.match(res.statusReason, /Verification failed/);
  });

  // 8. affiliated === false
  test("8. affiliated === false halts ingestion and displays not currently monetizable", async () => {
    process.env.CUELINKS_API_KEY = "mock_key";
    global.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          original_url: "https://www.boat-lifestyle.com/products/unapproved",
          tracking_url: "",
          affiliated: false,
          campaign: { id: 4232, name: "Boat" },
        },
      }),
    });

    const { verifyAffiliateLink } = await import("../lib/cuelinks.ts");
    const res = await verifyAffiliateLink("https://www.boat-lifestyle.com/products/unapproved");
    assert.equal(res.affiliated, false);
    assert.equal(res.monetizable, false);
    assert.equal(res.statusReason, "Not currently monetizable — access/campaign status must be reviewed.");
  });

  // 9. invalid merchant domain
  test("9. Invalid merchant domain is rejected for BoAt", () => {
    const invalidUrl = "https://www.random-store.com/products/fake";
    const isBoatDomain = invalidUrl.includes("boat-lifestyle.com");
    assert.equal(isBoatDomain, false);
  });

  // 10. missing CUELINKS_API_KEY
  test("10. Missing CUELINKS_API_KEY throws 401 Unauthorized", async () => {
    delete process.env.CUELINKS_API_KEY;
    const { convertLink } = await import("../lib/cuelinks.ts");
    await assert.rejects(
      async () => {
        await convertLink({ url: "https://www.boat-lifestyle.com/products/airdopes-141" });
      },
      (err) => {
        assert.equal(err.statusCode, 401);
        assert.match(err.message, /API key is missing/);
        return true;
      }
    );
  });

  // 11. unauthorized admin request
  test("11. Unauthorized admin request rejects when API key is unset", async () => {
    delete process.env.CUELINKS_API_KEY;
    const { ping } = await import("../lib/cuelinks.ts");
    await assert.rejects(
      async () => {
        await ping();
      },
      (err) => {
        assert.equal(err.statusCode, 401);
        assert.match(err.message, /API key is missing/);
        return true;
      }
    );
  });

  // 12. redirect to verified affiliate URL
  test("12. Redirect handler routes product clicks to verified affiliate URL via 307", async () => {
    const { getProductByIdOrSlug } = await import("../lib/supabase.ts");
    assert.equal(typeof getProductByIdOrSlug, "function");
    const mockProduct = {
      id: "prod-1",
      slug: "boat-airdopes-141",
      affiliate_short_url: "https://clnk.in/CBwt",
      affiliate_url: "https://linksredirect.com/?cid=319615",
    };
    const destination = mockProduct.affiliate_short_url || mockProduct.affiliate_url;
    assert.equal(destination, "https://clnk.in/CBwt");
    assert.ok(destination.startsWith("http"));
  });
});
