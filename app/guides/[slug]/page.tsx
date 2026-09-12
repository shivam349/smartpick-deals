import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  Clock,
  ShieldCheck,
  Check,
  HelpCircle,
  Award,
  ChevronRight,
  ExternalLink,
  BookOpen,
  User,
  Calendar,
  Layers,
} from "lucide-react";
import { getArticleBySlug, getArticles, getProducts } from "@/lib/supabase";
import { LOCAL_ARTICLES } from "@/lib/articles-data";
import { LOCAL_PRODUCTS } from "@/lib/catalog-data";
import { Button } from "@/components/ui/button";
import { JsonLd, generateArticleSchema } from "@/components/json-ld";
import { ProductImage } from "@/components/product-image";
import { ReviewerMascot } from "@/components/mascot";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const dbArticle = await getArticleBySlug(params.slug);
  const localArticle = LOCAL_ARTICLES.find((a) => a.slug === params.slug);

  const title =
    dbArticle?.title ||
    localArticle?.title ||
    params.slug.replace(/-/g, " ");

  const description =
    dbArticle?.meta_description ||
    localArticle?.metaDescription ||
    `Complete buyer's guide and hardware comparison for ${title}.`;

  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://smartpick-dealss.vercel.app"
  ).replace(/\/+$/, "");
  const canonical = `${baseUrl}/guides/${params.slug}`;

  return {
    title: `${title} | SmartPick Reviews`,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} | SmartPick`,
      description,
      url: canonical,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function GuideDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const dbArticle = await getArticleBySlug(params.slug);
  const localArticle = LOCAL_ARTICLES.find((a) => a.slug === params.slug);

  if (!dbArticle && !localArticle) {
    notFound();
  }

  // Parse structured article content
  let structuredData: any = localArticle;
  if (dbArticle?.content) {
    try {
      const parsed = JSON.parse(dbArticle.content);
      if (parsed.sections) {
        structuredData = parsed;
      }
    } catch {
      // Content is regular text or markdown
    }
  }

  if (!structuredData && localArticle) {
    structuredData = localArticle;
  }

  const title = dbArticle?.title || structuredData?.title || "Buying Guide";
  const category = dbArticle?.category || structuredData?.category || "Hardware";
  const readTime = structuredData?.readTime || "8 min read";
  const author = structuredData?.author || { name: "Alex Rivera", role: "Lead Hardware Editor" };
  const sections = structuredData?.sections || [];
  const comparison = structuredData?.comparison;
  const pros = structuredData?.pros || [];
  const cons = structuredData?.cons || [];
  const bestFor = structuredData?.bestFor || "Developers and professionals demanding durable hardware.";
  const buyingAdvice = structuredData?.buyingAdvice || [];
  const faq = structuredData?.faq || [];
  const conclusion = structuredData?.conclusion || "";
  const relatedSlugs = structuredData?.relatedProductSlugs || [];

  // Match related products from catalog
  const relatedProducts = LOCAL_PRODUCTS.filter((p) =>
    relatedSlugs.includes(p.slug) || p.category.toLowerCase().includes(category.toLowerCase())
  ).slice(0, 3);

  // Other guides for recommendation
  const otherGuides = LOCAL_ARTICLES.filter((a) => a.slug !== params.slug).slice(0, 3);

  return (
    <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Schema.org Article JSON-LD */}
      <JsonLd
        data={generateArticleSchema({
          title,
          meta_description: structuredData?.metaDescription || dbArticle?.meta_description,
          slug: params.slug,
          created_at: dbArticle?.created_at,
          updated_at: dbArticle?.updated_at,
        })}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-indigo-700 transition">
          Home
        </Link>
        <span>/</span>
        <Link href="/guides" className="hover:text-indigo-700 transition">
          Buying Guides
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold truncate max-w-xs">{title}</span>
      </nav>

      {/* Article Header */}
      <header className="space-y-4 border-b border-slate-200 pb-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 bg-indigo-50 border border-indigo-200/80 px-3 py-1 rounded-full">
            {category}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
            <Clock className="h-3.5 w-3.5" />
            <span>{readTime}</span>
          </div>
          <span className="text-slate-300">•</span>
          <span className="text-xs text-slate-500 font-mono">Updated September 2026</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 leading-tight tracking-tight">
          {title}
        </h1>

        <p className="text-lg text-slate-600 leading-relaxed font-normal">
          {structuredData?.excerpt || dbArticle?.meta_description || "Comprehensive technical analysis and verified buying recommendations."}
        </p>

        {/* Byline & Reviewer Pill */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ReviewerMascot size="sm" badgeText={author.name} />
            <div className="text-xs text-slate-500">
              <span className="font-semibold text-slate-800">{author.role}</span>
              <p className="text-[11px] text-slate-400">Independent Hardware Research</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/70 font-semibold">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>100% Unsponsored Editorial</span>
          </div>
        </div>

        {/* Affiliate Disclosure Notice */}
        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-normal flex items-start gap-2.5">
          <span className="text-[10px] uppercase tracking-wider font-bold bg-white border border-slate-300 px-2 py-0.5 rounded text-slate-700 shrink-0 mt-0.5">
            Affiliate Policy
          </span>
          <p>
            SmartPick is reader-supported. When you buy through our links, we may earn an affiliate commission from qualifying merchant purchases at zero extra cost to you. This does not impact our editorial rankings.
          </p>
        </div>
      </header>

      {/* Main Grid: Sticky TOC + Article Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Table of Contents Column */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="sticky top-24 p-5 rounded-xl border border-slate-200 bg-white shadow-sm space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-indigo-700" />
              <span>In This Guide</span>
            </h2>
            <nav className="space-y-1.5 text-xs text-slate-600">
              <a href="#introduction" className="block hover:text-indigo-700 py-1 transition border-l-2 border-transparent hover:border-indigo-600 pl-2">
                1. Executive Introduction
              </a>
              {sections.map((s: any, idx: number) => (
                <a
                  key={idx}
                  href={`#section-${idx}`}
                  className="block hover:text-indigo-700 py-1 transition border-l-2 border-transparent hover:border-indigo-600 pl-2 line-clamp-1"
                >
                  {idx + 2}. {s.heading}
                </a>
              ))}
              {comparison && (
                <a href="#comparison" className="block hover:text-indigo-700 py-1 transition border-l-2 border-transparent hover:border-indigo-600 pl-2">
                  Spec Comparison Matrix
                </a>
              )}
              <a href="#recommendations" className="block hover:text-indigo-700 py-1 transition border-l-2 border-transparent hover:border-indigo-600 pl-2">
                Buying Advice & Verdict
              </a>
              {faq.length > 0 && (
                <a href="#faq" className="block hover:text-indigo-700 py-1 transition border-l-2 border-transparent hover:border-indigo-600 pl-2">
                  Frequently Asked Questions
                </a>
              )}
            </nav>
          </div>
        </aside>

        {/* Content Body Column */}
        <main className="lg:col-span-8 space-y-10">
          {/* Introduction */}
          <section id="introduction" className="space-y-4">
            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-base space-y-4">
              {(structuredData?.introduction || dbArticle?.content || "").split("\n\n").map((para: string, idx: number) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
          </section>

          {/* Editorial Sections */}
          {sections.map((sec: any, idx: number) => (
            <section key={idx} id={`section-${idx}`} className="space-y-4 pt-6 border-t border-slate-100">
              <h2 className="text-2xl font-black text-slate-950 tracking-tight">
                {sec.heading}
              </h2>
              <p className="text-slate-700 leading-relaxed text-base">
                {sec.content}
              </p>

              {sec.subsections && sec.subsections.length > 0 && (
                <div className="space-y-4 pt-2">
                  {sec.subsections.map((sub: any, sIdx: number) => (
                    <div key={sIdx} className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1.5">
                      <h3 className="font-bold text-slate-900 text-sm">
                        {sub.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {sub.body}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}

          {/* Comparison Table */}
          {comparison && comparison.rows && comparison.rows.length > 0 && (
            <section id="comparison" className="space-y-4 pt-6 border-t border-slate-100">
              <h2 className="text-2xl font-black text-slate-950 tracking-tight">
                Hardware Spec Showdown
              </h2>
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 font-bold text-slate-800">
                        {comparison.headers.map((h: string, idx: number) => (
                          <th key={idx} className="p-3 sm:p-4 whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {comparison.rows.map((row: any, rIdx: number) => (
                        <tr key={rIdx} className="hover:bg-slate-50/50 transition">
                          <td className="p-3 sm:p-4 font-bold text-slate-900 whitespace-nowrap">
                            {row.label}
                          </td>
                          {row.values.map((val: string, vIdx: number) => (
                            <td key={vIdx} className="p-3 sm:p-4">
                              {val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* Highlighted Recommendation & Pros/Cons */}
          <section id="recommendations" className="space-y-6 pt-6 border-t border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                Editorial Verdict
              </span>
              <h2 className="text-2xl font-black text-slate-950 tracking-tight mt-1">
                Buying Advice & Persona Fit
              </h2>
            </div>

            <div className="p-5 rounded-xl border border-indigo-200/80 bg-indigo-50/40 space-y-2">
              <h3 className="font-extrabold text-indigo-950 text-sm uppercase tracking-wider flex items-center gap-2">
                <Award className="h-4 w-4 text-indigo-700" />
                <span>Best For</span>
              </h3>
              <p className="text-sm text-slate-800 leading-relaxed font-medium">
                {bestFor}
              </p>
            </div>

            {/* Pros & Cons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
                <h3 className="font-bold text-emerald-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>Key Advantages</span>
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {pros.map((p: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
                <h3 className="font-bold text-amber-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span className="h-3.5 w-3.5 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-[10px]">!</span>
                  <span>Tradeoffs to Know</span>
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {cons.map((c: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actionable Advice List */}
            {buyingAdvice.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                  Tactical Selection Checklist
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                  {buyingAdvice.map((tip: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                      <span className="font-black text-indigo-700 shrink-0">{idx + 1}.</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Conclusion */}
            {conclusion && (
              <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-2 text-sm text-slate-700 leading-relaxed shadow-sm">
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                  Final Editorial Synthesis
                </h3>
                <p>{conclusion}</p>
              </div>
            )}
          </section>

          {/* Related Verified Products */}
          {relatedProducts.length > 0 && (
            <section className="space-y-4 pt-6 border-t border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">
                Featured Products in This Category
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedProducts.map((prod) => (
                  <div key={prod.id || prod.slug} className="editorial-card p-4 flex flex-col justify-between">
                    <div>
                      <div className="relative aspect-[4/3] rounded-lg bg-slate-50 border border-slate-100 overflow-hidden mb-3">
                        <ProductImage src={prod.image_url} alt={prod.name} category={prod.category} />
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs line-clamp-2 leading-snug">
                        {prod.name}
                      </h4>
                      <div className="text-sm font-black text-slate-900 mt-1.5">
                        {prod.price}
                      </div>
                    </div>
                    <Link
                      href={`/product/${prod.slug}`}
                      className="mt-3 inline-flex items-center justify-center gap-1 w-full py-1.5 rounded bg-slate-100 text-slate-800 text-xs font-semibold hover:bg-indigo-900 hover:text-white transition"
                    >
                      <span>View Review</span>
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* FAQ Section */}
          {faq.length > 0 && (
            <section id="faq" className="space-y-4 pt-6 border-t border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-indigo-700" />
                <span>Frequently Asked Questions</span>
              </h2>
              <div className="space-y-3">
                {faq.map((item: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-1.5">
                    <h3 className="font-bold text-slate-900 text-sm">
                      {item.question}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Related Guides */}
          {otherGuides.length > 0 && (
            <section className="space-y-4 pt-8 border-t border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">
                More In-Depth Buying Guides
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {otherGuides.map((guide) => (
                  <Link
                    key={guide.slug}
                    href={`/guides/${guide.slug}`}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 transition flex flex-col justify-between group shadow-sm"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                        {guide.category}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-indigo-800 transition line-clamp-2 mt-1">
                        {guide.title}
                      </h4>
                    </div>
                    <span className="text-xs font-semibold text-indigo-600 inline-flex items-center gap-1 mt-3">
                      <span>Read Guide</span>
                      <ChevronRight className="h-3 w-3" />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </article>
  );
}
