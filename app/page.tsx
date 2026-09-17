import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Flame, Swords, ShieldCheck, Sparkles } from "lucide-react";
import { getProducts, getDeals, getCategories, getArticles } from "@/lib/supabase";
import { LOCAL_PRODUCTS } from "@/lib/catalog-data";
import { LOCAL_ARTICLES } from "@/lib/articles-data";
import { HeroSection } from "@/components/hero-section";
import { TrustStrip } from "@/components/trust-strip";
import { DealCard } from "@/components/deal-card";
import { CategoryCard } from "@/components/category-card";
import { ComparisonFeature } from "@/components/comparison-feature";
import { GuideCard } from "@/components/guide-card";
import { EditorialTeamSection } from "@/components/editorial-team";
import { NewsletterSection } from "@/components/newsletter-section";

export const revalidate = 60; // Revalidate every minute

export default async function HomePage() {
  const [dbProducts, dbDeals, categories, dbArticles] = await Promise.all([
    getProducts(18),
    getDeals(6),
    getCategories(),
    getArticles(10),
  ]);

  const products = dbProducts.length >= 10 ? dbProducts : LOCAL_PRODUCTS;
  const deals = dbDeals.length > 0 ? dbDeals : products.filter((p) => p.is_deal).slice(0, 6);
  const articles = dbArticles.length >= 10 ? dbArticles : LOCAL_ARTICLES;

  // Featured deal for the hero card (highest discount or spotlight)
  const featuredDeal = deals.length > 0 ? deals[0] : products[0] || null;

  // Products for side-by-side comparison feature
  const compareProdA = products.find((p) => p.slug.includes("boat")) || products.find((p) => p.slug.includes("keychron")) || products[0];
  const compareProdB = products.find((p) => p.slug.includes("noise")) || products.find((p) => p.slug.includes("mx-mechanical")) || products[1];

  return (
    <div className="space-y-0">
      {/* 1. HERO SECTION (Search-focused with featured asymmetric card) */}
      <HeroSection featuredProduct={featuredDeal} />

      {/* 2. TRUST / STATS STRIP */}
      <TrustStrip
        productsCount={products.length}
        guidesCount={articles.length}
      />

      {/* 3. TODAY'S BEST DEALS */}
      <section className="py-14 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 block mb-1">
              Live Verified Drops
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Today's Best Hardware Deals
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Monitored daily against verified merchant storefronts.
            </p>
          </div>

          <Link
            href="/deals"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-700 hover:text-indigo-900 transition self-start sm:self-auto"
          >
            <span>View all deals</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.slice(0, 6).map((product) => (
            <DealCard key={product.id || product.slug} product={product} />
          ))}
        </div>
      </section>

      {/* 4. EXPLORE CATEGORIES */}
      <section id="categories" className="py-14 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 block mb-1">
                Hardware Directory
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                Browse by Category
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Explore curated picks, spec deep-dives, and verified buying advice.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { name: "Mechanical Keyboards", slug: "keyboards", count: 2, desc: "Custom aluminum bodies and hot-swappable tactile switches." },
              { name: "Ergonomic Mice", slug: "mice", count: 2, desc: "MagSpeed scrolling and 57-degree natural vertical angles." },
              { name: "Developer Monitors", slug: "monitors", count: 2, desc: "IPS Black 4K displays and curved 34-inch productivity hubs." },
              { name: "Engineering Laptops", slug: "laptops", count: 2, desc: "Apple Silicon M3 Pro and high-refresh OLED workhorses." },
              { name: "Standing Desks & Chairs", slug: "desk-setup", count: 4, desc: "Commercial dual-motor frames and PostureFit SL mesh." },
              { name: "Noise-Cancelling Audio", slug: "headphones", count: 2, desc: "Dual processor QN1/V1 ANC and spatial audio earbuds." },
              { name: "Workstation Docks & Lights", slug: "productivity", count: 3, desc: "Thunderbolt 4 18-in-1 hubs and zero-glare light bars." },
              { name: "All 10 Buying Guides", slug: "guides", count: 10, desc: "Comprehensive spec breakdowns and tactical advice." }
            ].map((cat) => (
              <Link
                key={cat.slug}
                href={cat.slug === "guides" ? "/guides" : `/category/${cat.slug}`}
                className="p-5 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-md transition duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
                    <span>{cat.count} verified picks</span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base group-hover:text-indigo-700 transition">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                    {cat.desc}
                  </p>
                </div>
                <span className="text-xs font-bold text-indigo-600 inline-flex items-center gap-1 mt-4">
                  <span>Explore category</span>
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SIDE-BY-SIDE COMPARISON SHOWDOWN */}
      {compareProdA && compareProdB && (
        <ComparisonFeature productA={compareProdA} productB={compareProdB} />
      )}

      {/* 6. LATEST IN-DEPTH BUYING GUIDES (Showcasing all 10 guides) */}
      <section className="py-14 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 block mb-1">
              Independent Research Desk
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              10 In-Depth Buying Guides
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Researched and authored by hardware practitioners. Verified schematics, zero sponsored bias.
            </p>
          </div>

          <Link
            href="/guides"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-700 hover:text-indigo-900 transition self-start sm:self-auto"
          >
            <span>View all 10 guides</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.slice(0, 6).map((article: any) => (
            <GuideCard
              key={article.slug}
              article={article}
              authorName={article.author?.name || "Alex Rivera"}
              readTime={article.readTime || "8 min read"}
            />
          ))}
        </div>

        {articles.length > 6 && (
          <div className="mt-8 text-center">
            <Link
              href="/guides"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-slate-900 hover:bg-indigo-950 text-white font-bold text-sm shadow-sm transition"
            >
              <span>Explore Remaining {articles.length - 6} Buying Guides</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </section>

      {/* 7. MEET THE TEAM & EDITORIAL STANDARDS (For Affiliate Network Review Trust) */}
      <EditorialTeamSection />

      {/* 8. NEWSLETTER / PRICE DROP ALERTS */}
      <NewsletterSection />
    </div>
  );
}
