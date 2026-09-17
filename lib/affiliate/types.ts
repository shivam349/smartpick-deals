/**
 * Generic Affiliate Provider Interface & Types
 * 
 * Provides an abstract contract allowing SmartPick to seamlessly integrate
 * multiple affiliate networks (Cuelinks, Amazon Associates, Flipkart, Admitad, vCommission)
 * without rewriting frontend or core ingestion logic.
 */

export type CampaignAccessGroup = 'ACCESSIBLE' | 'APPROVAL_REQUIRED' | 'INACTIVE_UNAVAILABLE';

export interface AffiliateCampaign {
  id: string | number;
  provider: string;
  externalCampaignId: number;
  name: string;
  merchantName: string;
  domain?: string;
  country?: string;
  category?: string;
  accessStatus: string;
  group: CampaignAccessGroup;
  status: string;
  payout?: string;
  payoutType?: string;
  epc?: string;
  deepLinkSupported: boolean;
  allowedMedia?: string[];
  disallowedMedia?: string[];
  allowedPlatforms?: string[];
  disallowedPlatforms?: string[];
  trackingUrl?: string;
  raw?: any;
}

export interface AffiliateLinkResult {
  provider: string;
  campaignId?: number;
  campaignName?: string;
  originalUrl: string;
  trackingUrl: string;
  shortUrl?: string;
  affiliated: boolean; // Must be true for monetizable link
  monetizable: boolean; // alias for affiliated
  statusReason?: string;
  channelId?: string;
  subid?: string;
  subid2?: string;
  subid3?: string;
  subid4?: string;
  subid5?: string;
  checkedAt?: string;
}

export interface AffiliateHealth {
  connected: boolean;
  provider: string;
  publisher?: {
    id: string | number;
    name: string;
    currency: string;
  };
  scopes?: string[];
  message?: string;
}

export interface AffiliateCampaignSearchParams {
  page?: number;
  perPage?: number;
  countryId?: number;
  category?: string;
  query?: string;
  accessStatus?: string;
}

export interface AffiliateProvider {
  getName(): string;
  ping(): Promise<AffiliateHealth>;
  searchCampaigns(params?: AffiliateCampaignSearchParams): Promise<{
    campaigns: AffiliateCampaign[];
    total: number;
    totalPages: number;
    page: number;
  }>;
  getCampaign(id: number | string): Promise<AffiliateCampaign | null>;
  requestAccess(id: number | string): Promise<{ success: boolean; status: string; id?: number; message?: string }>;
  convertLink(options: {
    url: string;
    shorten?: boolean;
    subid?: string;
    subid2?: string;
    subid3?: string;
    subid4?: string;
    subid5?: string;
    channelId?: string;
  }): Promise<AffiliateLinkResult>;
}
