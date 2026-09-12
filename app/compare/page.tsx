import React from "react";
import Link from "next/link";
import { Swords, ArrowRight, Award } from "lucide-react";
import { getProducts } from "@/lib/supabase";
import type { Metadata } from "next";

export const revalidate = 60;

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  "https://smartpick-dealss.vercel.app"
).replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "Head-to-Head Hardware Comparisons | SmartPick",
  description: "Direct spec-by-spec product comparisons. Discover tradeoffs, benchmark differences, and our definitive editorial recommendations.",
  alternates: {
    canonical: `${siteUrl}/compare`,
  },
  openGraph: {
    title: "Head-to-Head Hardware Comparisons | SmartPick",
    description: "Direct spec-by-spec product comparisons. Discover tradeoffs, benchmark differences, and our definitive editorial recommendations.",
    url: `${siteUrl}/compare`,
    siteName: "SmartPick",
  },
};

export default async function CompareIndexPage() {
  const products = await getProducts(12);

  // Generate comparison pairs from catalog
  const pairs = [];
  for (let i = 0; i < products.length - 1; i += 2) {
    pairs.push({
      prodA: products[i],
      prodB: products[i + 1],
      slug: `${products[i].slug}-vs-${products[i + 1].slug}`,
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
          <Swords className="h-4 w-4" />
          <span>Product Comparisons</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Head-to-Head Product Comparisons
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          Side-by-side spec showdowns, customer rating benchmarks, and editorial winner verdicts across top categories.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pairs.map((pair, idx) => {
          const winner = pair.prodA.score >= pair.prodB.score ? pair.prodA : pair.prodB;

          return (
            <div
              key={idx}
              className="editorial-card p-6 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                  <span className="font-semibold uppercase tracking-wider text-blue-600">
                    {pair.prodA.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-bold">
                    <Award className="h-3 w-3" />
                    Winner: {winner.name.split(" ")[0]}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-2">
                  {pair.prodA.name} <span className="text-slate-400 font-normal">vs</span> {pair.prodB.name}
                </h3>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <img src={pair.prodA.image_url} alt={pair.prodA.name} className="h-10 w-10 object-contain rounded bg-slate-50 p-1" />
                    <div>
                      <div className="font-bold text-slate-900">{pair.prodA.price}</div>
                      <div className="text-slate-500">★ {pair.prodA.rating}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <img src={pair.prodB.image_url} alt={pair.prodB.name} className="h-10 w-10 object-contain rounded bg-slate-50 p-1" />
                    <div>
                      <div className="font-bold text-slate-900">{pair.prodB.price}</div>
                      <div className="text-slate-500">★ {pair.prodB.rating}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">View complete comparison table</span>
                <Link
                  href={`/compare/${pair.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:text-blue-700 transition"
                >
                  <span>Compare</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
