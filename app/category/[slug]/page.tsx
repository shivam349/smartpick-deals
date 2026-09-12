import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Layers } from "lucide-react";
import { getCategoryBySlug, getCategories } from "@/lib/supabase";
import { ProductCard } from "@/components/product-card";
import { DealCard } from "@/components/deal-card";
import { LOCAL_PRODUCTS } from "@/lib/catalog-data";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { category } = await getCategoryBySlug(params.slug);
  const name = category ? category.name : params.slug.replace(/-/g, " ");
  const title = `Best ${name} 2026: Reviews, Deals & Buying Advice | SmartPick`;
  const description = `Compare the best ${name.toLowerCase()} for developers, creators, and professionals. Verified specifications, lab analysis, and genuine price drops.`;
  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://smartpick-dealss.vercel.app"
  ).replace(/\/+$/, "");
  const canonical = `${baseUrl}/category/${params.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const { category, products: dbProducts } = await getCategoryBySlug(params.slug);

  // If DB products empty, filter from local catalog
  const products =
    dbProducts.length > 0
      ? dbProducts
      : LOCAL_PRODUCTS.filter((p) =>
          p.category.toLowerCase().includes(params.slug.split("-")[0].toLowerCase())
        );

  const catName = category ? category.name : params.slug.replace(/-/g, " ");
  const catDesc =
    category?.description ||
    `Browse our verified recommendations, editorial reviews, and active deals across ${catName}.`;

  const deals = products.filter((p) => p.is_deal);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div>
        <Link
          href="/#categories"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>All Categories</span>
        </Link>
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">
          <Layers className="h-4 w-4" />
          <span>Category Hub</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight capitalize">
          {catName}
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
          {catDesc}
        </p>
      </div>

      {/* Active Deals in this category if any */}
      {deals.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span>Active Deals in {catName}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map((d) => (
              <DealCard key={d.id || d.slug} product={d} />
            ))}
          </div>
        </section>
      )}

      {/* All Ranked Picks */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">
          All Ranked Picks ({products.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p, idx) => (
            <ProductCard key={p.id || p.slug} product={p} rank={idx + 1} />
          ))}
        </div>
      </section>
    </div>
  );
}
