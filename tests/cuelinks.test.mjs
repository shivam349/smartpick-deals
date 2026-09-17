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
});
