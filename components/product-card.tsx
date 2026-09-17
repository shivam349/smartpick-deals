import React from "react";
import Link from "next/link";
import { Star, Award, ChevronRight, Check } from "lucide-react";
import { Product } from "@/lib/types";
import { ProductImage } from "@/components/product-image";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  rank?: number;
}

export function ProductCard({ product, rank }: ProductCardProps) {
  return (
    <article className="editorial-card p-5 flex flex-col justify-between group">
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          {rank ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-900 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-full">
              <Award className="h-3 w-3 text-indigo-600" />
              <span>#{rank} Ranked Pick</span>
            </span>
          ) : (
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              {product.category}
            </span>
          )}

          {typeof product.score === "number" && (
            <div className="flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
              <span>Score:</span>
              <span className="text-indigo-600">{Math.round(product.score)}</span>
            </div>
          )}
        </div>

        {/* Product Image via ProductImage */}
        <Link
          href={`/product/${product.slug}`}
          className="block relative aspect-[4/3] w-full rounded-lg bg-slate-50 overflow-hidden border border-slate-100 mb-4 product-photo-wrap"
        >
          <ProductImage
            src={product.image_url}
            alt={product.name}
            category={product.category}
          />
        </Link>

        {/* Title */}
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-bold text-slate-900 text-base line-clamp-2 group-hover:text-indigo-700 transition leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-600">
          <div className="flex items-center text-amber-500">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
            <span className="ml-1 font-bold text-slate-900">{product.rating}</span>
          </div>
          <span>•</span>
          <span className="text-slate-500 text-[11px]">({product.review_count?.toLocaleString()} ratings)</span>
        </div>

        {/* Verified Specs Preview */}
        {product.specs && product.specs.length > 0 && (
          <ul className="mt-3 space-y-1 text-xs text-slate-600">
            {product.specs.slice(0, 3).map((spec, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <Check className="h-3.5 w-3.5 text-indigo-600 shrink-0 mt-0.5" />
                <span className="line-clamp-1">{spec}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer / Price / View */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
            Verified Price
          </span>
          <span className="text-lg font-black text-slate-900">
            {formatPrice(product.price, product.currency) || "Check Store"}
          </span>
        </div>

        <Link
          href={`/product/${product.slug}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold hover:bg-indigo-900 hover:text-white transition"
        >
          <span>View review</span>
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </article>
  );
}
