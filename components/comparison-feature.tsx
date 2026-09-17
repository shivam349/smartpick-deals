import React from "react";
import Link from "next/link";
import { Check, ArrowRight, Award } from "lucide-react";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

interface ComparisonFeatureProps {
  productA?: Product | null;
  productB?: Product | null;
}

export function ComparisonFeature({ productA, productB }: ComparisonFeatureProps) {
  const prodA: Partial<Product> = productA || {
    name: "Logitech MX Master 3S",
    slug: "logitech-mx-master-3s",
    rating: 4.8,
    price: "$99.99",
    score: 94,
    currency: "USD",
  };

  const prodB: Partial<Product> = productB || {
    name: "Razer Pro Click Wireless",
    slug: "razer-pro-click-wireless",
    rating: 4.5,
    price: "$79.99",
    score: 87,
    currency: "USD",
  };

  const winner = (prodA.score ?? 0) >= (prodB.score ?? 0) ? prodA : prodB;
  const compareSlug = `${prodA.slug}-vs-${prodB.slug}`;

  return (
    <section className="py-16 bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Copy */}
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Make a decision faster
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Compare products side by side.
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-lg">
              Stop opening ten browser tabs. Compare price, verified hardware specifications, standout strengths, real-world weaknesses, and best-use cases in one place.
            </p>
            <div className="pt-2">
              <Link
                href={`/compare/${compareSlug}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
              >
                <span>Start comparing</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Comparison Table Card */}
          <div className="lg:col-span-6">
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-1 shadow-sm overflow-hidden">
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden text-xs sm:text-sm">
                {/* Table Header */}
                <div className="grid grid-cols-3 bg-slate-50 p-3.5 font-bold text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <div>Product</div>
                  <div className="text-center">Rating</div>
                  <div className="text-right">Price</div>
                </div>

                {/* Row 1 */}
                <div className="grid grid-cols-3 p-3.5 items-center border-b border-slate-100 hover:bg-slate-50/50 transition">
                  <div className="font-semibold text-slate-900 line-clamp-1">
                    {prodA.name}
                  </div>
                  <div className="text-center font-bold text-amber-500">
                    ★ {prodA.rating}
                  </div>
                  <div className="text-right font-black text-slate-900">
                    {formatPrice(prodA.price, prodA.currency) || "Check Store"}
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-3 p-3.5 items-center border-b border-slate-100 hover:bg-slate-50/50 transition">
                  <div className="font-semibold text-slate-900 line-clamp-1">
                    {prodB.name}
                  </div>
                  <div className="text-center font-bold text-amber-500">
                    ★ {prodB.rating}
                  </div>
                  <div className="text-right font-black text-slate-900">
                    {formatPrice(prodB.price, prodB.currency) || "Check Store"}
                  </div>
                </div>

                {/* Winner Row */}
                <div className="grid grid-cols-3 p-3.5 items-center bg-emerald-50/80 border-t border-emerald-100 text-emerald-900">
                  <div className="font-bold flex items-center gap-1.5 line-clamp-1 text-emerald-800">
                    <Award className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{winner.name}</span>
                  </div>
                  <div className="text-center font-bold text-emerald-700 text-xs">
                    Best Overall
                  </div>
                  <div className="text-right font-black text-emerald-700">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-600 text-white text-xs">
                      ✓
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
