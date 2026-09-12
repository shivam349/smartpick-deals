import { MetadataRoute } from "next";
import { getProducts, getCategories } from "@/lib/supabase";
import { LOCAL_PRODUCTS } from "@/lib/catalog-data";
import { LOCAL_ARTICLES } from "@/lib/articles-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://smartpick-dealss.vercel.app").replace(/\/+$/, "");

  // Base routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/deals`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guides`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Products
  const products = await getProducts(50);
  const activeProducts = products.length > 0 ? products : LOCAL_PRODUCTS;
  const productRoutes: MetadataRoute.Sitemap = activeProducts.map((p) => ({
    url: `${baseUrl}/product/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Guide Articles
  const guideRoutes: MetadataRoute.Sitemap = LOCAL_ARTICLES.map((a) => ({
    url: `${baseUrl}/guides/${a.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  // Categories
  const categories = await getCategories();
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${baseUrl}/category/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes, ...guideRoutes, ...categoryRoutes];
}
