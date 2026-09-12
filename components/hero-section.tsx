"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Flame, ArrowRight, ExternalLink, Star, ShieldCheck } from "lucide-react";
import { Product } from "@/lib/types";
import { ProductImage } from "@/components/product-image";

interface HeroSectionProps {
  featuredProduct?: Product | null;
}

export function HeroSection({ featuredProduct }: HeroSectionProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/deals?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/deals");
    }
  };

  const displayProduct: Product = featuredProduct || {
    id: "featured-mx-master",
    name: "Logitech MX Master 3S Wireless Performance Mouse",
    slug: "logitech-mx-master-3s-wireless-mouse",
    category: "Mice",
    image_url: "/images/products/logitech-mx-master-3s.svg",
    price: "$99.99",
    old_price: "$99.99",
    rating: 4.8,
    review_count: 9650,
    discount_percent: 0,
    affiliate_url: "https://www.logitech.com",
    source_url: "https://www.logitech.com",
    merchant: "Logitech",
    description: "The gold standard for developer ergonomics and precision code navigation.",
    score: 96,
    status: "active",
  };

  const discount = displayProduct.discount_percent || 15;

  return (
    <section className="relative border-b border-slate-200 bg-white py-12 md:py-18 lg:py-20 hero-texture">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Hero Copy & Search */}
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-900 bg-indigo-50 border border-indigo-200/80 px-3 py-1 rounded-full">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
              <span>Independent Hardware Research Desk</span>
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-[1.12]">
              Find the right gear. <br />
              <span className="text-slate-500 font-bold">Skip the sponsored noise.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
              We analyze verified hardware schematics, evaluate real-world ergonomics, track merchant prices, and give you objective buying advice.
            </p>

            {/* Large Search Input */}
            <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-lg">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  id="hero-product-search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search keyboards, mice, monitors, docks..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-700 shadow-sm"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-3 text-sm font-bold rounded-lg bg-slate-950 text-white hover:bg-indigo-950 transition shrink-0 shadow-sm"
              >
                Search
              </button>
            </form>

            {/* Quick Filter Links */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600 pt-2">
              <Link
                href="/deals"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
              >
                <Flame className="h-3.5 w-3.5 text-amber-600" />
                <span>Today's deals</span>
              </Link>
              <Link
                href="/compare"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
              >
                <span>Compare products</span>
                <ArrowRight className="h-3 w-3 text-slate-400" />
              </Link>
              <Link
                href="/guides"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
              >
                <span>10 Buying guides</span>
                <ArrowRight className="h-3 w-3 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Right Column: Featured Product Asymmetric Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-sm spotlight-card p-5 transition duration-200">
              {/* Badge & Category */}
              <div className="flex items-center justify-between gap-2 mb-3">
                {displayProduct.is_deal ? (
                  <span className="deal-pill">
                    {discount}% OFF
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60">
                    Editor's Spotlight
                  </span>
                )}
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  Verified Spec
                </span>
              </div>

              {/* Product Visual */}
              <Link
                href={`/product/${displayProduct.slug}`}
                className="block relative aspect-[4/3] w-full rounded-lg bg-slate-50 overflow-hidden border border-slate-100 mb-4 group"
              >
                <ProductImage
                  src={displayProduct.image_url}
                  alt={displayProduct.name}
                  category={displayProduct.category}
                />
              </Link>

              {/* Title & Category */}
              <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block mb-1">
                {displayProduct.category}
              </span>
              <Link href={`/product/${displayProduct.slug}`}>
                <h3 className="font-bold text-slate-900 text-base line-clamp-2 hover:text-indigo-700 transition leading-snug">
                  {displayProduct.name}
                </h3>
              </Link>

              {/* Rating */}
              <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-600">
                <div className="flex items-center text-amber-500">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                  <span className="ml-1 font-bold text-slate-900">{displayProduct.rating}</span>
                </div>
                <span>•</span>
                <span className="text-slate-500">({displayProduct.review_count?.toLocaleString()} ratings)</span>
              </div>

              {/* Price & Primary CTA */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-black text-slate-900 leading-none">
                    {displayProduct.price}
                  </div>
                  {displayProduct.old_price && displayProduct.old_price !== displayProduct.price && (
                    <del className="text-xs text-slate-400 mt-0.5 block">
                      {displayProduct.old_price}
                    </del>
                  )}
                </div>

                <a
                  href={displayProduct.affiliate_url || displayProduct.source_url}
                  target="_blank"
                  rel="nofollow sponsored"
                  className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition shadow-sm"
                >
                  <span>View deal</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
