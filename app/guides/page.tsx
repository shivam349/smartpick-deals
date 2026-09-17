import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { BookOpen, ArrowRight, Clock, ShieldCheck, Search, Sparkles } from "lucide-react";
import { getArticles } from "@/lib/supabase";
import { LOCAL_ARTICLES } from "@/lib/articles-data";
import { GuideCard } from "@/components/guide-card";

export const revalidate = 60;

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  "https://smartpick-dealss.vercel.app"
).replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "Comprehensive Buying Guides & Hardware Reviews | SmartPick",
  description: "In-depth editorial research, hardware spec comparisons, and objective buying advice for developers, remote professionals, and creators.",
  alternates: {
    canonical: `${siteUrl}/guides`,
  },
  openGraph: {
    title: "Comprehensive Buying Guides & Hardware Reviews | SmartPick",
    description: "In-depth editorial research, hardware spec comparisons, and objective buying advice for developers, remote professionals, and creators.",
    url: `${siteUrl}/guides`,
    siteName: "SmartPick",
  },
};

export default async function GuidesIndexPage({
  searchParams,
}: {
  searchParams?: { category?: string; q?: string };
}) {
  const dbArticles = await getArticles(50);
  const candidateArticles = dbArticles.length >= 10 ? dbArticles : LOCAL_ARTICLES;

  const activeCategory = searchParams?.category;
  const searchQuery = searchParams?.q?.toLowerCase();

  const filteredArticles = candidateArticles.filter((article: any) => {
    if (activeCategory && !article.category.toLowerCase().includes(activeCategory.toLowerCase())) {
      return false;
    }
    if (searchQuery) {
      const matchTitle = article.title.toLowerCase().includes(searchQuery);
      const matchDesc = (article.meta_description || article.metaDescription || "").toLowerCase().includes(searchQuery);
      return matchTitle || matchDesc;
    }
    return true;
  });

  const categories = ["All", "Audio", "Keyboards", "Mice", "Monitors", "Desk Setup", "Headphones", "Productivity"];
  const featuredArticle: any = filteredArticles[0] || LOCAL_ARTICLES[0];
  const gridArticles = filteredArticles.length > 1 ? filteredArticles.slice(1) : filteredArticles;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">
          <BookOpen className="h-4 w-4" />
          <span>Independent Editorial Hub</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight">
          Comprehensive Buying Guides & Spec Analyses
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-3xl leading-relaxed">
          Deep-dive technical evaluations, verified ergonomics breakdowns, and objective buying advice before you invest in your everyday workstation tools.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
        {categories.map((cat) => {
          const isSelected = (!activeCategory && cat === "All") || (activeCategory?.toLowerCase() === cat.toLowerCase());
          return (
            <Link
              key={cat}
              href={cat === "All" ? "/guides" : `/guides?category=${encodeURIComponent(cat)}`}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                isSelected
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {cat}
            </Link>
          );
        })}
      </div>

      {/* Featured Spotlight Article (Asymmetric Visual Treatment) */}
      {featuredArticle && !activeCategory && !searchQuery && (
        <div className="spotlight-card p-6 sm:p-8 relative overflow-hidden group">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full">
                  Featured Masterclass
                </span>
                <span className="text-xs font-semibold text-slate-500 font-mono">
                  {featuredArticle.category} • 9 min read
                </span>
              </div>
              <Link href={`/guides/${featuredArticle.slug}`}>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-950 group-hover:text-indigo-900 transition leading-tight">
                  {featuredArticle.title}
                </h2>
              </Link>
              <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
                {featuredArticle.excerpt || featuredArticle.meta_description || featuredArticle.metaDescription}
              </p>
              <div className="pt-2">
                <Link
                  href={`/guides/${featuredArticle.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-950 hover:bg-indigo-950 text-white font-bold text-xs shadow-sm transition"
                >
                  <span>Read Full In-Depth Guide</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Editorial Review Desk
              </span>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                Researched and authored by Alex Rivera, Lead Hardware Editor. Updated quarterly with verified firmware tests and retail pricing audits.
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Zero Sponsored Manufacturer Bias</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid of All Guides */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">
          All Researched Guides ({filteredArticles.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article: any) => (
            <GuideCard
              key={article.slug}
              article={article}
              authorName={article.author?.name || "Alex Rivera"}
              readTime={article.readTime || "8 min read"}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
