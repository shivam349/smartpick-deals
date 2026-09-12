import React from "react";

export function DisclosureBar() {
  return (
    <div className="w-full border-b border-slate-200 bg-slate-100/80 text-slate-600 text-xs py-2 px-4">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold uppercase tracking-wider text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700">
            Affiliate Disclosure
          </span>
          <p className="text-slate-600 leading-normal text-[11px] sm:text-xs">
            We may earn a commission when you purchase through links on our site. This does not affect our independent editorial rankings.
          </p>
        </div>
      </div>
    </div>
  );
}
