import React from "react";
import Link from "next/link";
import { Star, ExternalLink, ArrowRight } from "lucide-react";
import { Product } from "@/lib/types";
import { ProductImage } from "@/components/product-image";

interface DealCardProps {
  product: Product;
}

export function DealCard({ product }: DealCardProps) {
  const discount = product.discount_percent || 15;

  return (
    <article className="editorial-card p-4 flex flex-col justify-between group">
      <div>
        {/* Card Header / Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="deal-pill">
            {discount}% OFF
          </span>
          {product.merchant && (
            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {product.merchant}
            </span>
          )}
        </div>

        {/* Product Image via ProductImage Component */}
        <Link
          href={`/product/${product.slug}`}
          className="block relative aspect-[4/3] w-full rounded-lg bg-slate-50 overflow-hidden border border-slate-100 mb-3.5 product-photo-wrap"
        >
          <ProductImage
            src={product.image_url}
            alt={product.name}
            category={product.category}
          />
        </Link>

        {/* Product Category */}
        <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block mb-1">
          {product.category}
        </span>

        {/* Title */}
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-2 leading-snug group-hover:text-indigo-700 transition">
            {product.name}
          </h3>
        </Link>

        {/* Verified Rating */}
        <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-600">
          <div className="flex items-center text-amber-500">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
            <span className="ml-1 font-bold text-slate-900">{product.rating}</span>
          </div>
          <span>•</span>
          <span className="text-slate-500 text-[11px]">({product.review_count?.toLocaleString()} ratings)</span>
        </div>

        {/* Price Row */}
        <div className="flex items-baseline gap-2 mt-3">
          <strong className="text-lg font-black text-slate-900">
            {product.price}
          </strong>
          {product.old_price && (
            <del className="text-xs text-slate-400 font-medium">
              {product.old_price}
            </del>
          )}
        </div>

        {/* Short Editorial Context */}
        <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
          {product.description || "Tested and verified for ergonomics, durability, and daily performance."}
        </p>
      </div>

      {/* Card Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <Link
          href={`/product/${product.slug}`}
          className="text-xs font-semibold text-slate-600 hover:text-indigo-700 transition inline-flex items-center gap-1"
        >
          <span>Read review</span>
          <ArrowRight className="h-3 w-3" />
        </Link>

        <a
          href={product.affiliate_url || product.source_url}
          target="_blank"
          rel="nofollow sponsored"
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md bg-amber-600 text-white hover:bg-amber-700 transition shadow-sm"
        >
          <span>View deal</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </article>
  );
}
