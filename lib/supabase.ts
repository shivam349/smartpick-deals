import { createClient } from "@supabase/supabase-js";
import { Product, Research, Category, Article, AutomationLog } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://mlsbumavmkbdislnhwvb.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey);

// Product queries
export async function getProducts(limit = 50): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("status", "active")
      .order("score", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data as Product[]) || [];
  } catch (err) {
    console.error("Error fetching products:", err);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<{ product: Product | null; research: Research | null }> {
  try {
    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !product) return { product: null, research: null };

    const { data: research } = await supabase
      .from("research")
      .select("*")
      .eq("product_id", product.id)
      .maybeSingle();

    return { product: product as Product, research: (research as Research) || null };
  } catch (err) {
    console.error("Error fetching product by slug:", err);
    return { product: null, research: null };
  }
}

export async function getDeals(limit = 20): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_deal", true)
      .order("discount_percent", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data as Product[]) || [];
  } catch (err) {
    console.error("Error fetching deals:", err);
    return [];
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("product_count", { ascending: false });
    if (error) throw error;
    return (data as Category[]) || [];
  } catch (err) {
    console.error("Error fetching categories:", err);
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<{ category: Category | null; products: Product[] }> {
  try {
    const { data: category } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (!category) return { category: null, products: [] };

    const { data: products } = await supabase
      .from("products")
      .select("*")
      .ilike("category", `%${category.name.split(" ")[0]}%`)
      .order("score", { ascending: false });

    return { category: category as Category, products: (products as Product[]) || [] };
  } catch (err) {
    console.error("Error fetching category products:", err);
    return { category: null, products: [] };
  }
}

export async function getArticles(limit = 10): Promise<Article[]> {
  try {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data as Article[]) || [];
  } catch (err) {
    console.error("Error fetching articles:", err);
    return [];
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return (data as Article) || null;
  } catch (err) {
    console.error("Error fetching article by slug:", err);
    return null;
  }
}

export async function getAutomationLogs(limit = 20): Promise<AutomationLog[]> {
  try {
    const { data, error } = await supabase
      .from("automation_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data as AutomationLog[]) || [];
  } catch (err) {
    console.error("Error fetching automation logs:", err);
    return [];
  }
}

// Affiliate Campaigns and Links persistence
export async function upsertAffiliateCampaigns(campaigns: any[]): Promise<number> {
  if (!campaigns || campaigns.length === 0) return 0;
  try {
    const rows = campaigns.map((c) => ({
      provider: c.provider || "cuelinks",
      external_campaign_id: c.externalCampaignId || c.id,
      merchant_name: c.merchantName || c.name,
      campaign_name: c.name,
      domain: c.domain || null,
      country: c.country || null,
      category: c.category || null,
      access_status: c.accessStatus || "not_applied",
      status: c.status || "active",
      payout: c.payout || null,
      payout_type: c.payoutType || null,
      epc: c.epc || null,
      deep_link_supported: c.deepLinkSupported ?? true,
      allowed_media: c.allowedMedia || [],
      disallowed_media: c.disallowedMedia || [],
      allowed_platforms: c.allowedPlatforms || [],
      disallowed_platforms: c.disallowedPlatforms || [],
      affiliated_test_result: c.affiliatedTestResult ?? null,
      last_checked_at: new Date().toISOString(),
      raw_metadata: c.raw || {},
    }));

    const { error } = await supabase
      .from("affiliate_campaigns")
      .upsert(rows, { onConflict: "external_campaign_id" });

    if (error) throw error;
    return rows.length;
  } catch (err) {
    console.error("Error upserting affiliate campaigns in Supabase:", err);
    return 0;
  }
}

export async function getStoredAffiliateCampaigns(filter?: {
  accessStatus?: string;
  limit?: number;
}): Promise<any[]> {
  try {
    let query = supabase
      .from("affiliate_campaigns")
      .select("*")
      .order("last_checked_at", { ascending: false });

    if (filter?.accessStatus && filter.accessStatus !== "all") {
      query = query.eq("access_status", filter.accessStatus);
    }

    if (filter?.limit) {
      query = query.limit(filter.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching affiliate campaigns from Supabase:", err);
    return [];
  }
}

export async function recordAffiliateLink(linkData: {
  provider?: string;
  campaign_id?: number;
  original_url: string;
  tracking_url: string;
  short_url?: string;
  affiliated: boolean;
  channel_id?: string;
  subid?: string;
  subid2?: string;
  subid3?: string;
  subid4?: string;
  subid5?: string;
}): Promise<boolean> {
  try {
    const { error } = await supabase.from("affiliate_links").insert([
      {
        provider: linkData.provider || "cuelinks",
        campaign_id: linkData.campaign_id || null,
        original_url: linkData.original_url,
        tracking_url: linkData.tracking_url,
        short_url: linkData.short_url || null,
        affiliated: Boolean(linkData.affiliated),
        channel_id: linkData.channel_id || null,
        subid: linkData.subid || null,
        subid2: linkData.subid2 || null,
        subid3: linkData.subid3 || null,
        subid4: linkData.subid4 || null,
        subid5: linkData.subid5 || null,
        last_verified_at: new Date().toISOString(),
      },
    ]);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Error recording affiliate link in Supabase:", err);
    return false;
  }
}

export async function getAffiliateLinks(limit = 50): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("affiliate_links")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching affiliate links from Supabase:", err);
    return [];
  }
}

