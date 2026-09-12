import React from "react";
import Link from "next/link";
import { Flame, ArrowLeft, Search, Sparkles } from "lucide-react";
import { getDeals, getCategories } from "@/lib/supabase";
import { DealCard } from "@/components/deal-card";
import { Button } from "@/components/ui/button";

export const revalidate = 60;

export default async function DealsPage({
  searchParams,
}: {
  searchParams: { category?: string; minDiscount?: string; q?: string };
}) {
  const [allDeals, categories] = await Promise.all([
    getDeals(50),
    getCategories(),
  ]);

  const activeCategory = searchParams.category;
  const minDiscount = parseInt(searchParams.minDiscount || "0", 10);
  const query = searchParams.q?.toLowerCase();

  const filteredDeals = allDeals.filter((d) => {
    if (activeCategory && !d.category.toLowerCase().includes(activeCategory.toLowerCase())) {
      return false;
    }
    if (minDiscount > 0 && (d.discount_percent || 0) < minDiscount) {
      return false;
    }
    if (query && !d.name.toLowerCase().includes(query) && !d.category.toLowerCase().includes(query)) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </Link>
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
          <Flame className="h-4 w-4 text-emerald-600" />
          <span>Live Deal Stream</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Today's Best Tech Deals
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Showing {filteredDeals.length} price-dropped products verified across official merchant storefronts.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
        <Link href="/deals">
          <span
            className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              !activeCategory
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            All Deals ({allDeals.length})
          </span>
        </Link>
        {categories.map((c) => (
          <Link key={c.id} href={`/deals?category=${encodeURIComponent(c.name.split(" ")[0])}`}>
            <span
              className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                activeCategory?.toLowerCase() === c.name.split(" ")[0].toLowerCase()
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {c.name}
            </span>
          </Link>
        ))}
      </div>

      {/* Deals Grid */}
      {filteredDeals.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-slate-200 bg-white shadow-sm">
          <Sparkles className="h-10 w-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">No deals found for this filter</h3>
          <p className="text-xs text-slate-500 mt-1">Try selecting All Deals or clearing your search term.</p>
          <Link href="/deals" className="inline-block mt-4">
            <Button size="sm" variant="outline">Reset Filters</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeals.map((product) => (
            <DealCard key={product.id || product.slug} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
