import React from "react";
import Link from "next/link";
import { ArrowRight, Clock, ShieldCheck, User } from "lucide-react";
import { Article } from "@/lib/types";

interface GuideCardProps {
  article: Article;
  authorName?: string;
  readTime?: string;
}

export function GuideCard({
  article,
  authorName = "Alex Rivera",
  readTime = "8 min read",
}: GuideCardProps) {
  return (
    <article className="editorial-card p-6 flex flex-col justify-between group hover:border-indigo-400 transition shadow-tinted">
      <div>
        {/* Category & Read Time Bar */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 bg-indigo-50 border border-indigo-200/70 px-2.5 py-0.5 rounded-full inline-block">
            {article.category}
          </span>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
            <Clock className="h-3 w-3" />
            <span>{readTime}</span>
          </div>
        </div>

        {/* Title */}
        <Link href={`/guides/${article.slug}`}>
          <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-indigo-800 transition leading-snug line-clamp-2">
            {article.title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="text-slate-600 text-xs sm:text-sm mt-2.5 line-clamp-3 leading-relaxed">
          {article.meta_description || "Compare switches, layouts, connectivity, comfort, and verified price-to-value performance."}
        </p>

        {/* Author Byline & Verification Pill */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-900 flex items-center justify-center font-bold text-[10px]">
            AR
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800 text-[11px]">{authorName}</span>
            <span className="text-[10px] text-slate-400">Editorial Desk • Updated 2026</span>
          </div>
        </div>
      </div>

      {/* Footer link */}
      <div className="mt-4 pt-2 flex items-center justify-between">
        <Link
          href={`/guides/${article.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 group-hover:text-indigo-900 transition"
        >
          <span>Read complete guide</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>

        <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
          Independent
        </span>
      </div>
    </article>
  );
}
