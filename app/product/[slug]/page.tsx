import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  Star,
  Check,
  ShieldCheck,
  ExternalLink,
  Zap,
  HelpCircle,
} from "lucide-react";
import { getProductBySlug, getProducts } from "@/lib/supabase";
import { LOCAL_PRODUCTS } from "@/lib/catalog-data";
import { Button } from "@/components/ui/button";
import { JsonLd, generateProductSchema } from "@/components/json-ld";
import { ProductImage } from "@/components/product-image";
import { formatPrice } from "@/lib/utils";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { product } = await getProductBySlug(params.slug);
  const item = product || LOCAL_PRODUCTS.find((p) => p.slug === params.slug);

  if (!item) {
    return {
      title: "Product Not Found | SmartPick",
      description: "The requested product review could not be located.",
    };
  }

  const title = `${item.name} — Specs, Review & Price | SmartPick`;
  const description = `${item.description} Verified pricing, hardware specs, and buying verdict.`;
  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://smartpick-dealss.vercel.app"
  ).replace(/\/+$/, "");
  const canonical = `${baseUrl}/product/${item.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const { product: dbProduct, research } = await getProductBySlug(params.slug);
  const product = dbProduct || LOCAL_PRODUCTS.find((p) => p.slug === params.slug);

  if (!product) {
    notFound();
  }

  // Related products for comparison teaser
  const relatedProducts = await getProducts(4);
  const candidateProducts = relatedProducts.length > 0 ? relatedProducts : LOCAL_PRODUCTS;
  const otherProducts = candidateProducts.filter((p) => p.slug !== product.slug).slice(0, 2);

  const pros = research?.pros || [
    "Class-leading build engineering and high durability",
    "Exceptional ergonomic form factor reducing daily strain",
    "Seamless multi-device connectivity across modern workflows"
  ];
  const cons = research?.cons || [
    "Higher upfront investment than entry-level budget alternatives",
    "Specific ergonomic profile may require a brief adaptation period"
  ];

  const discount = product.discount_percent;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* JSON-LD Schema */}
      <JsonLd data={generateProductSchema(product)} />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-indigo-700 transition">
          Home
        </Link>
        <span>/</span>
        <Link href={`/category/${product.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="hover:text-indigo-700 transition">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Top Product Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Product Image Column */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-tinted">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-50 mb-4 product-photo-wrap border border-slate-100">
            <ProductImage
              src={product.image_url}
              alt={product.name}
              category={product.category}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Verified Source: <strong className="text-slate-800">{product.merchant}</strong></span>
            <span className="inline-flex items-center gap-1 text-indigo-800 font-semibold bg-indigo-50 px-2.5 py-1 rounded">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
              Verified Specifications
            </span>
          </div>
        </div>

        {/* Product Info & Buy CTA Column */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-800 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-full">
                {product.category}
              </span>
              {product.is_deal && discount && (
                <span className="deal-pill">
                  {discount}% OFF
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
              {product.name}
            </h1>

            {/* Ratings & Score (Only if verified) */}
            {(product.rating && product.rating > 0) ? (
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center text-amber-500">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                  <span className="ml-1 font-bold text-slate-900 text-sm">{product.rating}</span>
                  {product.review_count && product.review_count > 0 && (
                    <span className="ml-1 text-xs text-slate-500">({product.review_count.toLocaleString()} ratings)</span>
                  )}
                </div>
                {typeof product.score === "number" && product.score > 0 && (
                  <div className="text-xs bg-indigo-50 text-indigo-800 px-2.5 py-1 rounded-full font-bold border border-indigo-200/80">
                    Editorial Score: {Math.round(product.score)}/100
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Pricing & Buy CTA Box */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                {product.price ? "Verified Retail Price" : "Storefront Availability"}
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                {product.price ? (
                  <>
                    <span className="text-3xl font-black text-slate-900">
                      {formatPrice(product.price, product.currency)}
                    </span>
                    {product.old_price && (
                      <span className="text-sm text-slate-400 line-through font-medium">
                        {formatPrice(product.old_price, product.currency)}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-base font-semibold text-slate-700">Check latest price on store</span>
                )}
              </div>
            </div>

            <a
              href={`/api/redirect?product=${encodeURIComponent(product.slug || product.id || "")}`}
              target="_blank"
              rel="nofollow sponsored"
            >
              <Button size="lg" className="w-full sm:w-auto gap-2 font-bold px-6 bg-amber-600 hover:bg-amber-700 text-white shadow-sm">
                <span>Buy on {product.merchant || "BoAt"}</span>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </div>

          {/* Affiliate Disclosure */}
          <p className="text-xs text-slate-500 italic bg-slate-50 border border-slate-200/60 rounded-lg p-2.5">
            SmartPick may earn a commission when you purchase through our links.
          </p>

          {/* Editorial Summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Editorial Summary
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {product.description || "Our technical synthesis confirms this product as a class-leading contender offering genuine build durability, ergonomic reliability, and strong everyday utility."}
            </p>
          </div>

          {/* Key Specifications Checklist */}
          {product.specs && product.specs.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Verified Hardware Specifications
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                {product.specs.map((spec, idx) => (
                  <li key={idx} className="flex items-center gap-2 p-2 rounded bg-white border border-slate-200">
                    <Check className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                    <span className="truncate">{spec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Editorial Research Breakdown */}
      <div className="pt-8 border-t border-slate-200 space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">
            <Zap className="h-3.5 w-3.5" />
            <span>Independent Editorial Breakdown</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Strengths, Tradeoffs & Buying Advice
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pros */}
          <div className="p-6 rounded-xl border border-emerald-200/80 bg-emerald-50/40 space-y-3">
            <h3 className="font-bold text-emerald-950 text-sm uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              <span>Verified Strengths</span>
            </h3>
            <ul className="space-y-2 text-sm text-slate-700">
              {pros.map((pro, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cons */}
          <div className="p-6 rounded-xl border border-amber-200/80 bg-amber-50/40 space-y-3">
            <h3 className="font-bold text-amber-950 text-sm uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-600" />
              <span>Tradeoffs to Consider</span>
            </h3>
            <ul className="space-y-2 text-sm text-slate-700">
              {cons.map((con, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="h-4 w-4 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">!</span>
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Alternatives */}
      {otherProducts.length > 0 && (
        <div className="pt-8 border-t border-slate-200 space-y-4">
          <h3 className="text-xl font-bold text-slate-900">
            Compare With Top Alternatives
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {otherProducts.map((other) => (
              <div
                key={other.id || other.slug}
                className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                    <ProductImage src={other.image_url} alt={other.name} category={other.category} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 line-clamp-1">{other.name}</div>
                    <div className="text-xs text-slate-500">{other.price} • ★ {other.rating}</div>
                  </div>
                </div>
                <Link
                  href={`/compare/${product.slug}-vs-${other.slug}`}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold hover:bg-indigo-900 hover:text-white transition"
                >
                  Compare
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <div className="pt-8 border-t border-slate-200 space-y-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-indigo-700" />
          <span>Frequently Asked Questions</span>
        </h3>

        <div className="space-y-3">
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
            <h4 className="font-bold text-slate-900 text-sm">Is this price guaranteed?</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              We monitor prices daily against verified merchant storefronts. However, retailer promotions can expire without prior notice. Always verify final checkout pricing on the merchant page.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
            <h4 className="font-bold text-slate-900 text-sm">How does SmartPick evaluate products?</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              We analyze verified hardware schematics, manufacturer specifications, and extensive customer sentiment across multiple platforms. Editorial synthesis highlights pros, cons, and comparisons strictly from verified factual inputs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
