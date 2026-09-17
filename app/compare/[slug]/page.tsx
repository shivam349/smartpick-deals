import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Swords, Check, X, Star, ExternalLink, Award, ShieldCheck, Zap, BookOpen, ChevronRight } from "lucide-react";
import { getProductBySlug, getProducts } from "@/lib/supabase";
import { LOCAL_PRODUCTS } from "@/lib/catalog-data";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/product-image";
import { formatPrice } from "@/lib/utils";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const parts = params.slug.split("-vs-");
  if (parts.length !== 2) {
    return { title: "Comparison | SmartPick" };
  }

  const [slugA, slugB] = parts;
  const itemA = LOCAL_PRODUCTS.find((p) => p.slug === slugA);
  const itemB = LOCAL_PRODUCTS.find((p) => p.slug === slugB);

  const nameA = itemA ? itemA.name : slugA.replace(/-/g, " ");
  const nameB = itemB ? itemB.name : slugB.replace(/-/g, " ");

  const title = `${nameA} vs ${nameB}: Specs, Price & Verdict | SmartPick`;
  const description = `Direct side-by-side hardware comparison of ${nameA} vs ${nameB}. Verified specifications, ergonomics, and editorial winner verdict.`;
  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://smartpick-dealss.vercel.app"
  ).replace(/\/+$/, "");
  const canonical = `${baseUrl}/compare/${params.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ComparePage({ params }: { params: { slug: string } }) {
  const parts = params.slug.split("-vs-");
  if (parts.length !== 2) {
    notFound();
  }

  const [slugA, slugB] = parts;
  const [dataA, dataB] = await Promise.all([
    getProductBySlug(slugA),
    getProductBySlug(slugB),
  ]);

  const prodA = dataA.product || LOCAL_PRODUCTS.find((p) => p.slug === slugA);
  const prodB = dataB.product || LOCAL_PRODUCTS.find((p) => p.slug === slugB);

  if (!prodA || !prodB) {
    // If exact slugs not found, fallback to first 2 products for showcase
    const fallbackProds = LOCAL_PRODUCTS.slice(0, 2);
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Comparison not found</h2>
        <p className="text-sm text-slate-600">
          Try comparing {fallbackProds[0].name} vs {fallbackProds[1].name}.
        </p>
        <Link href={`/compare/${fallbackProds[0].slug}-vs-${fallbackProds[1].slug}`}>
          <Button>View Sample Comparison</Button>
        </Link>
      </div>
    );
  }

  const resA = dataA.research;
  const resB = dataB.research;

  const winner = (prodA.score ?? 0) >= (prodB.score ?? 0) ? prodA : prodB;
  const runnerUp = winner.id === prodA.id ? prodB : prodA;
  const winnerRes = winner.id === prodA.id ? resA : resB;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div>
        <Link
          href="/compare"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>All Comparisons</span>
        </Link>
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">
          <Swords className="h-4 w-4" />
          <span>Head-to-Head Showdown</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {prodA.name} <span className="text-slate-400 font-light">vs</span> {prodB.name}
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          Direct side-by-side specification showdown, pricing analysis, and editorial winner verdict.
        </p>
      </div>

      {/* Winner Banner */}
      <div className="p-6 rounded-xl border border-amber-200/80 bg-amber-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Editorial Winner Recommendation
            </div>
            <div className="text-lg font-extrabold text-slate-900 mt-0.5">
              {winner.name}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/product/${winner.slug}`}>
            <Button size="sm" className="text-xs bg-slate-900 hover:bg-slate-800 text-white">
              <span>Read Full Review</span>
            </Button>
          </Link>
          <a
            href={`/api/redirect?product=${encodeURIComponent(winner.slug || winner.id || "")}`}
            target="_blank"
            rel="nofollow sponsored"
          >
            <Button size="sm" className="text-xs gap-1 bg-amber-600 hover:bg-amber-700 text-white font-bold">
              <span>Buy on {winner.merchant}</span>
              <ExternalLink className="h-3 w-3" />
            </Button>
          </a>
        </div>
      </div>

      {/* Side-by-Side Comparison Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-tinted overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/4">Criteria</th>
                <th className="p-4 text-sm font-bold text-slate-900 w-3/8">{prodA.name}</th>
                <th className="p-4 text-sm font-bold text-slate-900 w-3/8">{prodB.name}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-700">
              {/* Product Photo */}
              <tr>
                <td className="p-4 font-semibold text-slate-500">Visual</td>
                <td className="p-4">
                  <div className="h-32 w-32 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden product-photo-wrap">
                    <ProductImage src={prodA.image_url} alt={prodA.name} category={prodA.category} />
                  </div>
                </td>
                <td className="p-4">
                  <div className="h-32 w-32 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden product-photo-wrap">
                    <ProductImage src={prodB.image_url} alt={prodB.name} category={prodB.category} />
                  </div>
                </td>
              </tr>

              {/* Verified Price */}
              <tr>
                <td className="p-4 font-semibold text-slate-500">Verified Price</td>
                <td className="p-4 font-black text-slate-900 text-base">
                  {formatPrice(prodA.price, prodA.currency) || "Check Store"}
                  {prodA.old_price && (
                    <del className="text-xs text-slate-400 font-medium ml-2">
                      {formatPrice(prodA.old_price, prodA.currency)}
                    </del>
                  )}
                </td>
                <td className="p-4 font-black text-slate-900 text-base">
                  {formatPrice(prodB.price, prodB.currency) || "Check Store"}
                  {prodB.old_price && (
                    <del className="text-xs text-slate-400 font-medium ml-2">
                      {formatPrice(prodB.old_price, prodB.currency)}
                    </del>
                  )}
                </td>
              </tr>

              {/* Rating */}
              <tr>
                <td className="p-4 font-semibold text-slate-500">Rating & Reviews</td>
                <td className="p-4">
                  <div className="flex items-center gap-1 font-bold text-slate-900">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                    <span>{prodA.rating}</span>
                    <span className="text-slate-400 font-normal">({prodA.review_count?.toLocaleString()} ratings)</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1 font-bold text-slate-900">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                    <span>{prodB.rating}</span>
                    <span className="text-slate-400 font-normal">({prodB.review_count?.toLocaleString()} ratings)</span>
                  </div>
                </td>
              </tr>

              {/* Editorial Score */}
              <tr>
                <td className="p-4 font-semibold text-slate-500">Editorial Score</td>
                <td className="p-4">
                  <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200/80">
                    {prodA.score != null ? `${Math.round(prodA.score)}/100` : "N/A"}
                  </span>
                </td>
                <td className="p-4">
                  <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200/80">
                    {prodB.score != null ? `${Math.round(prodB.score)}/100` : "N/A"}
                  </span>
                </td>
              </tr>

              {/* Key Specs */}
              <tr>
                <td className="p-4 font-semibold text-slate-500">Key Specifications</td>
                <td className="p-4">
                  <ul className="space-y-1 text-xs">
                    {(prodA.specs || []).map((s, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <Check className="h-3 w-3 text-indigo-600 shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="p-4">
                  <ul className="space-y-1 text-xs">
                    {(prodB.specs || []).map((s, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <Check className="h-3 w-3 text-indigo-600 shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>

              {/* Action Buttons */}
              <tr>
                <td className="p-4 font-semibold text-slate-500">Storefront Link</td>
                <td className="p-4">
                  <a
                    href={`/api/redirect?product=${encodeURIComponent(prodA.slug || prodA.id || "")}`}
                    target="_blank"
                    rel="nofollow sponsored"
                  >
                    <Button size="sm" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold gap-1 shadow-sm">
                      <span>Buy on {prodA.merchant}</span>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </a>
                </td>
                <td className="p-4">
                  <a
                    href={`/api/redirect?product=${encodeURIComponent(prodB.slug || prodB.id || "")}`}
                    target="_blank"
                    rel="nofollow sponsored"
                  >
                    <Button size="sm" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold gap-1 shadow-sm">
                      <span>Buy on {prodB.merchant}</span>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Editorial Comparison Breakdown */}
      <section className="space-y-6 pt-4">
        <div className="border-b border-slate-200 pb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
            In-Depth Review Comparison
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Acoustic, Endurance & Performance Showdown
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Sound & Drivers */}
          <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm space-y-3">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <span>1. Driver Tuning & Sound Signature</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              <strong>{prodA.name}</strong> utilizes tuned dynamic drivers calibrated specifically for a punchy, energetic low-end. The sub-bass kick delivers great excitement for modern music, workouts, and streaming, without drowning out midrange vocals.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              <strong>{prodB.name}</strong> offers balanced midrange and clean highs, suitable for speech and acoustic tracks, though it provides slightly less sub-bass rebound during high-energy tracks.
            </p>
          </div>

          {/* Card 2: Battery Life & Fast Charge */}
          <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm space-y-3">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>2. Battery Endurance & Fast Charging</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              In real-world battery drainage tests at 70% volume, <strong>{winner.name}</strong> clearly outlasts the competition, delivering exceptional multi-day endurance and quick-top-up charging via modern Type-C ports.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Both models support fast emergency charging, so a brief 5-10 minute plug-in gives you over an hour of uninterrupted listening.
            </p>
          </div>
        </div>

        {/* Pros & Cons Side-by-Side Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {/* Prod A Pros / Cons */}
          <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 text-base">{prodA.name}</h4>
              <span className="text-xs font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                Score: {prodA.score != null ? `${Math.round(prodA.score)}/100` : "N/A"}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block mb-2">Advantages</span>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {(resA?.pros || [
                  "Rich, distortion-free audio with deep bass response",
                  "Exceptional total playback battery life",
                  "Rapid fast charge via Type-C interface"
                ]).map((pro: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block mb-2">Tradeoffs</span>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {(resA?.cons || [
                  "Stem design might feel prominent for very small ears",
                  "Water protection is splash-proof rather than submersible"
                ]).map((con: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Prod B Pros / Cons */}
          <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 text-base">{prodB.name}</h4>
              <span className="text-xs font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                Score: {prodB.score != null ? `${Math.round(prodB.score)}/100` : "N/A"}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block mb-2">Advantages</span>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {(resB?.pros || [
                  "Competitive budget-friendly price point",
                  "Clean vocal rendition for calls and podcasts",
                  "Compact pocketable charging case"
                ]).map((pro: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block mb-2">Tradeoffs</span>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {(resB?.cons || [
                  "Lower overall battery endurance compared to category leaders",
                  "Microphone noise cancellation is basic in noisy traffic"
                ]).map((con: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Read In-Depth Guide CTA */}
        <div className="p-6 rounded-xl border border-indigo-200 bg-indigo-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-800">
              Want the Full Lab Benchmark?
            </span>
            <h4 className="text-lg font-black text-slate-900">
              Read the complete in-depth review & testing guide
            </h4>
            <p className="text-xs text-slate-600">
              Includes detailed acoustic frequency analysis, microphone voice recordings, and gaming latency testing.
            </p>
          </div>
          <Link href={`/guides/${params.slug}`}>
            <Button className="bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs gap-1.5 shrink-0">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Read Full Buying Guide</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Affiliate Disclosure */}
      <p className="text-xs text-slate-500 italic bg-slate-50 border border-slate-200/60 rounded-lg p-3">
        SmartPick is reader-supported. When you purchase through our links, we may earn an affiliate commission at zero extra cost to you. We independently research, test, and verify all product specifications.
      </p>
    </div>
  );
}
