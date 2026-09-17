/**
 * Cuelinks Publisher API V3 Server-Side Client
 * 
 * Secure server-side wrapper for Cuelinks Publisher API V3:
 * https://developers.cuelinks.com/pub_api/v3
 * 
 * Requirements:
 * - Read CUELINKS_API_KEY from server environment ONLY.
 * - NEVER log or leak the API key in client responses, exceptions, or console logs.
 * - Require affiliated === true for a link to be deemed monetizable.
 */

export type CampaignAccessGroup = "ACCESSIBLE" | "APPROVAL_REQUIRED" | "INACTIVE_UNAVAILABLE";

/** Canonical SmartPick live website URL for all Cuelinks applications */
export const SMARTPICK_WEBSITE_URL = "https://smartpick-dealss.vercel.app/";

/** Exact verified promotion details submitted for Cuelinks campaign access applications */
export const SMARTPICK_PROMOTION_DETAILS =
  "SmartPick (https://smartpick-dealss.vercel.app/) is a technology and shopping-content website focused on product recommendations, buying guides, product comparisons, electronics, gadgets and relevant e-commerce offers. I plan to promote this campaign through original SEO-focused content and relevant product recommendations for users researching products before purchase. I will use compliant affiliate links and follow the campaign's traffic-source and promotional rules.";

const CUELINKS_V3_BASE_URL = "https://developers.cuelinks.com/pub_api/v3";

export interface CuelinksPublisher {
  id: number;
  name: string;
  email: string;
  publisher_id: string;
  currency: string;
}

export interface CuelinksApiKeyInfo {
  name: string;
  scopes: string[];
  last_used_at: string;
}

export interface CuelinksPingResponse {
  status: string;
  version: string;
  publisher: CuelinksPublisher;
  api_key: CuelinksApiKeyInfo;
}

export interface CuelinksCategory {
  id: number;
  name: string;
}

export interface CuelinksCountry {
  id: number;
  iso: string;
  name: string;
}

export interface CuelinksPayoutStructureItem {
  name: string;
  payout_type: string;
  payout: string;
  is_header?: boolean;
}

export interface CuelinksPlatforms {
  allowed: string[];
  disallowed: string[];
}

export interface CuelinksMedia {
  allowed: string[];
  disallowed: string[];
}

export interface CuelinksCampaign {
  id: number;
  name: string;
  url: string;
  domain: string;
  image?: string;
  payout_type?: string;
  payout?: string;
  payout_currency?: string;
  campaign_type?: string;
  access_status: string; // 'open' | 'active' | 'approved' | 'not_applied' | 'pending' | 'paused' | 'rejected'
  categories?: CuelinksCategory[];
  countries?: CuelinksCountry[];
  reporting_type?: string;
  deeplink_allowed: boolean;
  sub_ids_allowed: boolean;
  cashback_publishers_allowed?: boolean;
  social_media_publishers_allowed?: boolean;
  missing_transactions_accepted?: boolean;
  cookie_duration?: string;
  is_featured?: boolean;
  epc_7d?: string;
  epc_90d?: string;
  tracking_url?: string;
  updated_at?: string;
  payout_structure?: CuelinksPayoutStructureItem[];
  platforms?: CuelinksPlatforms;
  media?: CuelinksMedia;
  tracking_time?: string;
  validation_time?: string;
  payment_time?: string;
  conversion_flow?: Record<string, string>;
}

export interface CuelinksPaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  next_page: number | null;
  prev_page: number | null;
}

export interface CuelinksCampaignsResponse {
  data: CuelinksCampaign[];
  meta: CuelinksPaginationMeta;
}

export interface CuelinksRequestAccessResponse {
  data: {
    id: number;
    campaign_id: number;
    channel_id: number;
    promotion_details: string | null;
    status: string;
    created_at: string;
  };
}

export interface CuelinksConvertOptions {
  url: string;
  shorten?: boolean;
  subid?: string;
  subid2?: string;
  subid3?: string;
  subid4?: string;
  subid5?: string;
  channel_id?: string;
}

export interface CuelinksConvertResponse {
  data: {
    tracking_url: string;
    original_url: string;
    affiliated: boolean;
    campaign?: {
      id: number;
      name: string;
    };
    short_url?: string;
    shorten_url?: string;
    affiliate_url?: string;
  };
}

export class CuelinksApiError extends Error {
  statusCode: number;
  code?: string;
  details?: any;

  constructor(message: string, statusCode = 500, details?: any) {
    super(message);
    this.name = "CuelinksApiError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Categorize a campaign's access status into SmartPick standard groups
 */
export function getCampaignAccessGroup(accessStatus: string): CampaignAccessGroup {
  const status = (accessStatus || "").toLowerCase().trim();
  if (status === "open" || status === "active" || status === "approved") {
    return "ACCESSIBLE";
  }
  if (status === "not_applied" || status === "pending" || status === "paused") {
    return "APPROVAL_REQUIRED";
  }
  return "INACTIVE_UNAVAILABLE";
}

/**
 * Validates whether a campaign is currently eligible for an access request.
 * Rule: Only allow request when access_status === "not_applied".
 * Do NOT request access for open, approved, pending, paused, or blocked.
 */
export function canRequestAccess(accessStatus: string): { allowed: boolean; reason: string } {
  const status = (accessStatus || "").toLowerCase().trim();

  if (status === "not_applied") {
    return { allowed: true, reason: "Eligible to request access." };
  }
  if (status === "open") {
    return { allowed: false, reason: "Open campaign: Instant access already active, no application required." };
  }
  if (status === "approved" || status === "active") {
    return { allowed: false, reason: "Campaign is already approved for your publisher account." };
  }
  if (status === "pending") {
    return { allowed: false, reason: "Pending — waiting for approval from merchant." };
  }
  if (status === "paused") {
    return { allowed: false, reason: "Paused — applications are currently unavailable." };
  }
  if (status === "rejected") {
    return { allowed: false, reason: "Rejected — application was declined by merchant." };
  }
  if (status === "blocked") {
    return { allowed: false, reason: "Blocked — publisher access restricted." };
  }

  return { allowed: false, reason: `Access status '${accessStatus}' is not eligible for application.` };
}

/**
 * Returns user-friendly status description adhering to Cuelinks guidelines
 */
export function getCampaignAccessLabel(accessStatus: string, cooldownDate?: string): string {
  const status = (accessStatus || "").toLowerCase().trim();
  switch (status) {
    case "open":
      return "Open";
    case "approved":
    case "active":
      return "Approved";
    case "pending":
      return "Pending — waiting for approval";
    case "not_applied":
      return "Not Applied";
    case "paused":
      return "Paused — applications unavailable";
    case "rejected":
      return cooldownDate ? `Rejected (Cooldown until ${cooldownDate})` : "Rejected";
    case "blocked":
      return "Blocked";
    default:
      return accessStatus || "Unknown";
  }
}

/**
 * Retrieve the Cuelinks API key safely from environment
 */
function getApiKey(): string {
  const key = process.env.CUELINKS_API_KEY;
  if (!key || key.trim() === "" || key === "your-cuelinks-api-key-here") {
    throw new CuelinksApiError(
      "Cuelinks API key is missing or not configured. Set CUELINKS_API_KEY in server environment.",
      401
    );
  }
  return key.trim();
}

/**
 * Server-side internal fetch wrapper for Cuelinks API V3
 */
async function cuelinksFetch<T>(
  endpoint: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: any;
    params?: Record<string, string | number | boolean | undefined>;
    timeoutMs?: number;
  } = {}
): Promise<T> {
  const apiKey = getApiKey();
  const { method = "GET", body, params, timeoutMs = 15000 } = options;

  let url = `${CUELINKS_V3_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  if (params) {
    const searchParams = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") {
        searchParams.append(k, String(v));
      }
    }
    const qs = searchParams.toString();
    if (qs) {
      url += (url.includes("?") ? "&" : "?") + qs;
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timer);

    // Handle common HTTP error statuses
    if (!res.ok) {
      let errorData: any = null;
      try {
        errorData = await res.json();
      } catch {
        // quiet fallback
      }

      if (res.status === 401) {
        throw new CuelinksApiError(
          "Cuelinks Authentication Failed: Invalid or unauthorized API key.",
          401,
          errorData
        );
      }
      if (res.status === 403) {
        throw new CuelinksApiError(
          "Cuelinks Authorization Error: Missing required API scope or permission.",
          403,
          errorData
        );
      }
      if (res.status === 404) {
        throw new CuelinksApiError(
          `Cuelinks Resource Not Found: ${endpoint}`,
          404,
          errorData
        );
      }
      if (res.status === 422) {
        throw new CuelinksApiError(
          `Cuelinks Validation Error: ${errorData?.message || "Invalid parameters provided"}`,
          422,
          errorData
        );
      }
      if (res.status === 429) {
        throw new CuelinksApiError(
          "Cuelinks Rate Limit Exceeded. Please throttle requests and retry.",
          429,
          errorData
        );
      }
      if (res.status >= 500) {
        throw new CuelinksApiError(
          `Cuelinks Upstream Server Error (${res.status}). Service may be temporarily unavailable.`,
          res.status,
          errorData
        );
      }

      throw new CuelinksApiError(
        `Cuelinks API request failed with status ${res.status}: ${errorData?.message || res.statusText}`,
        res.status,
        errorData
      );
    }

    const data = (await res.json()) as T;
    return data;
  } catch (err: any) {
    clearTimeout(timer);
    if (err instanceof CuelinksApiError) {
      throw err;
    }
    if (err.name === "AbortError") {
      throw new CuelinksApiError(
        `Cuelinks request timed out after ${timeoutMs}ms.`,
        504
      );
    }
    throw new CuelinksApiError(
      `Network or server error communicating with Cuelinks: ${err.message}`,
      500
    );
  }
}

/**
 * Health check: GET /ping
 */
export async function ping(): Promise<CuelinksPingResponse> {
  return cuelinksFetch<CuelinksPingResponse>("/ping");
}

export interface ListCampaignsOptions {
  page?: number;
  per_page?: number;
  country_id?: number;
  name?: string;
  access_status?: string;
}

/**
 * Discover campaigns: GET /campaigns
 */
export async function listCampaigns(
  options: ListCampaignsOptions = {}
): Promise<CuelinksCampaignsResponse> {
  return cuelinksFetch<CuelinksCampaignsResponse>("/campaigns", {
    params: {
      page: options.page || 1,
      per_page: options.per_page || 30,
      country_id: options.country_id,
      name: options.name,
      access_status: options.access_status,
    },
  });
}

/**
 * Get detailed campaign: GET /campaigns/:id
 */
export async function getCampaign(
  id: number | string
): Promise<{ data: CuelinksCampaign }> {
  return cuelinksFetch<{ data: CuelinksCampaign }>(`/campaigns/${id}`);
}

export interface RequestAccessOptions {
  promotion_details?: string;
  channel_id?: number | string;
}

/**
 * Request access to a restricted campaign: POST /campaigns/:id/request_access
 * 
 * Uses exact verified SmartPick promotion statement and respects optional channel_id.
 */
export async function requestCampaignAccess(
  id: number | string,
  options: RequestAccessOptions = {}
): Promise<CuelinksRequestAccessResponse> {
  const body: Record<string, any> = {
    promotion_details: options.promotion_details || SMARTPICK_PROMOTION_DETAILS,
  };

  if (options.channel_id) {
    body.channel_id = options.channel_id;
  }

  return cuelinksFetch<CuelinksRequestAccessResponse>(
    `/campaigns/${id}/request_access`,
    {
      method: "POST",
      body,
    }
  );
}

/**
 * Convert a merchant URL: POST /links/convert
 * 
 * CRITICAL RULE: A link is only truly monetizable if affiliated === true.
 */
export async function convertLink(
  options: CuelinksConvertOptions
): Promise<CuelinksConvertResponse> {
  if (!options.url || !options.url.startsWith("http")) {
    throw new CuelinksApiError(
      "Invalid URL for conversion. Must provide a valid http/https URL.",
      422
    );
  }

  const payload: Record<string, any> = {
    url: options.url,
    shorten: options.shorten ?? true,
  };

  if (options.subid) payload.subid = options.subid;
  if (options.subid2) payload.subid2 = options.subid2;
  if (options.subid3) payload.subid3 = options.subid3;
  if (options.subid4) payload.subid4 = options.subid4;
  if (options.subid5) payload.subid5 = options.subid5;
  if (options.channel_id) payload.channel_id = options.channel_id;

  return cuelinksFetch<CuelinksConvertResponse>("/links/convert", {
    method: "POST",
    body: payload,
  });
}

/**
 * Legacy helper maintained for backward compatibility with frontend buy buttons
 */
export function getAffiliateUrl(
  originalMerchantUrl: string,
  _subid = "nextjs_web"
): string {
  const cuelinksEnabled = process.env.CUELINKS_ENABLED === "true";
  const apiKey = process.env.CUELINKS_API_KEY;

  if (cuelinksEnabled && apiKey) {
    return `/api/redirect?url=${encodeURIComponent(originalMerchantUrl)}`;
  }

  return originalMerchantUrl;
}
