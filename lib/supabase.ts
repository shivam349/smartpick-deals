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
