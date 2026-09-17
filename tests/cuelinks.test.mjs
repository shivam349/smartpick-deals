import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

describe("Cuelinks V3 Client & Provider Test Suite", () => {
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

  test("1. Missing API key throws 401 CuelinksApiError", async () => {
    delete process.env.CUELINKS_API_KEY;
    const { ping } = await import("../lib/cuelinks.ts");

    await assert.rejects(
      async () => {
        await ping();
      },
      (err) => {
        assert.equal(err.statusCode, 401);
        assert.match(err.message, /Cuelinks API key is missing/);
        return true;
      }
    );
  });

  test("2. /ping parses publisher metadata and scopes correctly", async () => {
    process.env.CUELINKS_API_KEY = "mock_secret_token";
    const mockPing = {
      status: "ok",
      version: "3.0",
      publisher: {
        id: 273459,
        name: "SHIVAM GARG",
        email: "publisher@example.com",
        publisher_id: "273459",
        currency: "INR",
      },
      api_key: {
        name: "test_key",
        scopes: ["read:campaigns", "write:links"],
        last_used_at: "2026-09-17T00:00:00Z",
      },
    };

    global.fetch = async (url, opts) => {
      assert.match(opts.headers.Authorization, /^Token mock_secret_token/);
      assert.ok(url.includes("/ping"));
      return {
        ok: true,
        status: 200,
        json: async () => mockPing,
      };
    };

    const { ping } = await import("../lib/cuelinks.ts");
    const result = await ping();

    assert.equal(result.status, "ok");
    assert.equal(result.publisher.name, "SHIVAM GARG");
    assert.equal(result.publisher.currency, "INR");
    assert.deepEqual(result.api_key.scopes, ["read:campaigns", "write:links"]);
  });

  test("3. Campaign pagination handles pages and query parameters", async () => {
    process.env.CUELINKS_API_KEY = "mock_secret_token";
    let capturedUrl = "";

    global.fetch = async (url) => {
      capturedUrl = url;
      return {
        ok: true,
        status: 200,
        json: async () => ({
          data: [
            { id: 101, name: "Merchant A", access_status: "open", url: "https://merchanta.com" },
            { id: 102, name: "Merchant B", access_status: "not_applied", url: "https://merchantb.com" },
          ],
          meta: {
            page: 2,
            per_page: 25,
            total: 150,
            total_pages: 6,
            next_page: 3,
            prev_page: 1,
          },
        }),
      };
    };

    const { listCampaigns } = await import("../lib/cuelinks.ts");
    const result = await listCampaigns({ page: 2, per_page: 25, country_id: 100 });

    assert.ok(capturedUrl.includes("page=2"));
    assert.ok(capturedUrl.includes("per_page=25"));
    assert.ok(capturedUrl.includes("country_id=100"));
    assert.equal(result.data.length, 2);
    assert.equal(result.meta.total, 150);
  });

  test("4. Campaign access status classification into ACCESSIBLE, APPROVAL_REQUIRED, INACTIVE_UNAVAILABLE", async () => {
    const { getCampaignAccessGroup } = await import("../lib/cuelinks.ts");

    assert.equal(getCampaignAccessGroup("open"), "ACCESSIBLE");
    assert.equal(getCampaignAccessGroup("active"), "ACCESSIBLE");
    assert.equal(getCampaignAccessGroup("approved"), "ACCESSIBLE");

    assert.equal(getCampaignAccessGroup("not_applied"), "APPROVAL_REQUIRED");
    assert.equal(getCampaignAccessGroup("pending"), "APPROVAL_REQUIRED");
    assert.equal(getCampaignAccessGroup("paused"), "APPROVAL_REQUIRED");

    assert.equal(getCampaignAccessGroup("closed"), "INACTIVE_UNAVAILABLE");
    assert.equal(getCampaignAccessGroup("rejected"), "INACTIVE_UNAVAILABLE");
  });

  test("5. Successful link conversion with affiliated === true returns monetizable result", async () => {
    process.env.CUELINKS_API_KEY = "mock_secret_token";

    global.fetch = async (_url, opts) => {
      const parsedBody = JSON.parse(opts.body);
      assert.equal(parsedBody.url, "https://www.boat-lifestyle.com/products/airdopes-141");
      assert.equal(parsedBody.shorten, true);

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

    const { convertLink } = await import("../lib/cuelinks.ts");
    const res = await convertLink({
      url: "https://www.boat-lifestyle.com/products/airdopes-141",
      shorten: true,
      subid: "product_123",
      subid2: "sidebar_deal",
    });

    assert.equal(res.data.affiliated, true);
    assert.equal(res.data.short_url, "https://clnk.in/CBtA");
    assert.equal(res.data.campaign?.name, "Boat");
  });

  test("6. Link conversion with affiliated === false is explicitly flagged NOT MONETIZABLE", async () => {
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
    assert.match(result.statusReason, /NOT CURRENTLY MONETIZABLE/);
  });

  test("7. Invalid URL throws 422 validation error", async () => {
    process.env.CUELINKS_API_KEY = "mock_secret_token";
    const { convertLink } = await import("../lib/cuelinks.ts");

    await assert.rejects(
      async () => {
        await convertLink({ url: "not-a-valid-http-url" });
      },
      (err) => {
        assert.equal(err.statusCode, 422);
        assert.match(err.message, /Invalid URL/);
        return true;
      }
    );
  });

  test("8. 401 Unauthorized from Cuelinks returns sanitized error without leaking API key", async () => {
    process.env.CUELINKS_API_KEY = "secret_key_that_must_not_leak";

    global.fetch = async () => ({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      json: async () => ({ error: "Invalid API Token" }),
    });

    const { ping } = await import("../lib/cuelinks.ts");
    await assert.rejects(
      async () => {
        await ping();
      },
      (err) => {
        assert.equal(err.statusCode, 401);
        assert.match(err.message, /Authentication Failed/);
        // Ensure secret key is NEVER printed in error message
        assert.ok(!err.message.includes("secret_key_that_must_not_leak"));
        return true;
      }
    );
  });

  test("9. 403 Forbidden / missing scope handled safely", async () => {
    process.env.CUELINKS_API_KEY = "mock_token";

    global.fetch = async () => ({
      ok: false,
      status: 403,
      statusText: "Forbidden",
      json: async () => ({ error: "Missing write:links scope" }),
    });

    const { convertLink } = await import("../lib/cuelinks.ts");
    await assert.rejects(
      async () => {
        await convertLink({ url: "https://example.com" });
      },
      (err) => {
        assert.equal(err.statusCode, 403);
        assert.match(err.message, /Missing required API scope/);
        return true;
      }
    );
  });

  test("10. 422 Validation error returns clear error explanation", async () => {
    process.env.CUELINKS_API_KEY = "mock_token";

    global.fetch = async () => ({
      ok: false,
      status: 422,
      statusText: "Unprocessable Entity",
      json: async () => ({ message: "Domain not registered with Cuelinks" }),
    });

    const { convertLink } = await import("../lib/cuelinks.ts");
    await assert.rejects(
      async () => {
        await convertLink({ url: "https://unknown-merchant-store.com" });
      },
      (err) => {
        assert.equal(err.statusCode, 422);
        assert.match(err.message, /Domain not registered/);
        return true;
      }
    );
  });

  test("11. 429 Rate limiting response handles throttling with guidance", async () => {
    process.env.CUELINKS_API_KEY = "mock_token";

    global.fetch = async () => ({
      ok: false,
      status: 429,
      statusText: "Too Many Requests",
      json: async () => ({ message: "Rate limit exceeded" }),
    });

    const { ping } = await import("../lib/cuelinks.ts");
    await assert.rejects(
      async () => {
        await ping();
      },
      (err) => {
        assert.equal(err.statusCode, 429);
        assert.match(err.message, /Rate Limit Exceeded/);
        return true;
      }
    );
  });

  test("12. CuelinksProvider adheres to AffiliateProvider interface", async () => {
    const { CuelinksProvider } = await import("../lib/affiliate/cuelinks-provider.ts");
    const provider = new CuelinksProvider();

    assert.equal(provider.getName(), "cuelinks");
    assert.equal(typeof provider.ping, "function");
    assert.equal(typeof provider.searchCampaigns, "function");
    assert.equal(typeof provider.getCampaign, "function");
    assert.equal(typeof provider.requestAccess, "function");
    assert.equal(typeof provider.convertLink, "function");
  });
});
