/**
 * Cuelinks Affiliate Provider Adapter
 * 
 * Implements the AffiliateProvider interface for Cuelinks V3 Publisher API.
 */

import type {
  AffiliateProvider,
  AffiliateCampaign,
  AffiliateLinkResult,
  AffiliateHealth,
  AffiliateCampaignSearchParams,
} from "./types.ts";
import {
  ping as cuelinksPing,
  listCampaigns as cuelinksListCampaigns,
  getCampaign as cuelinksGetCampaign,
  requestCampaignAccess as cuelinksRequestAccess,
  convertLink as cuelinksConvertLink,
  getCampaignAccessGroup,
} from "../cuelinks.ts";
import type { CuelinksCampaign } from "../cuelinks.ts";

export class CuelinksProvider implements AffiliateProvider {
  getName(): string {
    return "cuelinks";
  }

  async ping(): Promise<AffiliateHealth> {
    try {
      const res = await cuelinksPing();
      return {
        connected: res.status === "ok",
        provider: "cuelinks",
        publisher: {
          id: res.publisher.publisher_id || res.publisher.id,
          name: res.publisher.name,
          currency: res.publisher.currency,
        },
        scopes: res.api_key?.scopes || [],
        message: "Successfully connected to Cuelinks V3 API",
      };
    } catch (err: any) {
      return {
        connected: false,
        provider: "cuelinks",
        message: err.message || "Failed to reach Cuelinks API",
      };
    }
  }

  private mapCampaign(raw: CuelinksCampaign): AffiliateCampaign {
    const group = getCampaignAccessGroup(raw.access_status);
    const primaryCategory = raw.categories?.[0]?.name || "Uncategorized";
    const primaryCountry = raw.countries?.[0]?.name || "Global";

    return {
      id: raw.id,
      provider: "cuelinks",
      externalCampaignId: raw.id,
      name: raw.name,
      merchantName: raw.name,
      domain: raw.domain || (raw.url ? new URL(raw.url).hostname : ""),
      country: primaryCountry,
      category: primaryCategory,
      accessStatus: raw.access_status,
      group,
      status: "active",
      payout: raw.payout ? `${raw.payout}${raw.payout_currency ? ` ${raw.payout_currency}` : ""}` : undefined,
      payoutType: raw.payout_type,
      epc: raw.epc_7d || raw.epc_90d,
      deepLinkSupported: raw.deeplink_allowed,
      allowedMedia: raw.media?.allowed,
      disallowedMedia: raw.media?.disallowed,
      allowedPlatforms: raw.platforms?.allowed,
      disallowedPlatforms: raw.platforms?.disallowed,
      trackingUrl: raw.tracking_url,
      raw,
    };
  }

  async searchCampaigns(params: AffiliateCampaignSearchParams = {}): Promise<{
    campaigns: AffiliateCampaign[];
    total: number;
    totalPages: number;
    page: number;
  }> {
    const res = await cuelinksListCampaigns({
      page: params.page || 1,
      per_page: params.perPage || 30,
      country_id: params.countryId,
      name: params.query,
      access_status: params.accessStatus,
    });

    let mapped = (res.data || []).map((c) => this.mapCampaign(c));

    // If client requested category filter that Cuelinks API doesn't filter server-side
    if (params.category && params.category.toLowerCase() !== "all") {
      const catLower = params.category.toLowerCase();
      mapped = mapped.filter((c) =>
        c.category?.toLowerCase().includes(catLower)
      );
    }

    return {
      campaigns: mapped,
      total: res.meta?.total || mapped.length,
      totalPages: res.meta?.total_pages || 1,
      page: res.meta?.page || 1,
    };
  }

  async getCampaign(id: number | string): Promise<AffiliateCampaign | null> {
    try {
      const res = await cuelinksGetCampaign(id);
      if (!res.data) return null;
      return this.mapCampaign(res.data);
    } catch {
      return null;
    }
  }

  async requestAccess(id: number | string): Promise<{
    success: boolean;
    status: string;
    id?: number;
    message?: string;
  }> {
    try {
      const res = await cuelinksRequestAccess(id);
      return {
        success: true,
        status: res.data.status,
        id: res.data.id,
        message: `Access requested successfully. Status: ${res.data.status}`,
      };
    } catch (err: any) {
      return {
        success: false,
        status: "error",
        message: err.message,
      };
    }
  }

  async convertLink(options: {
    url: string;
    shorten?: boolean;
    subid?: string;
    subid2?: string;
    subid3?: string;
    subid4?: string;
    subid5?: string;
    channelId?: string;
  }): Promise<AffiliateLinkResult> {
    const res = await cuelinksConvertLink({
      url: options.url,
      shorten: options.shorten ?? true,
      subid: options.subid,
      subid2: options.subid2,
      subid3: options.subid3,
      subid4: options.subid4,
      subid5: options.subid5,
      channel_id: options.channelId,
    });

    const isAffiliated = Boolean(res.data.affiliated);
    let statusReason = "";

    if (!isAffiliated) {
      statusReason = "NOT CURRENTLY MONETIZABLE: Account lacks active merchant approval or campaign is currently paused/restricted.";
    }

    return {
      provider: "cuelinks",
      campaignId: res.data.campaign?.id,
      campaignName: res.data.campaign?.name,
      originalUrl: res.data.original_url,
      trackingUrl: res.data.tracking_url || res.data.affiliate_url || "",
      shortUrl: res.data.short_url || res.data.shorten_url,
      affiliated: isAffiliated,
      monetizable: isAffiliated,
      statusReason,
      channelId: options.channelId,
      subid: options.subid,
      subid2: options.subid2,
      subid3: options.subid3,
      subid4: options.subid4,
      subid5: options.subid5,
      checkedAt: new Date().toISOString(),
    };
  }
}

// Export singleton instance
export const cuelinksProvider = new CuelinksProvider();
