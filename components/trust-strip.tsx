import React from "react";

interface TrustStripProps {
  productsCount?: number;
  guidesCount?: number;
}

export function TrustStrip({ productsCount = 500, guidesCount = 50 }: TrustStripProps) {
  return (
    <section className="border-b border-slate-200 bg-slate-50/70 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left divide-y md:divide-y-0 md:divide-x divide-slate-200">
          <div className="pt-2 md:pt-0 md:px-4 first:px-0">
            <strong className="block text-2xl font-black text-slate-900 tracking-tight">
              {productsCount}+
            </strong>
            <span className="text-xs font-medium text-slate-500 mt-0.5 block">
              Products compared
            </span>
          </div>

          <div className="pt-4 md:pt-0 md:px-6">
            <strong className="block text-2xl font-black text-slate-900 tracking-tight">
              {guidesCount}+
            </strong>
            <span className="text-xs font-medium text-slate-500 mt-0.5 block">
              Buying guides
            </span>
          </div>

          <div className="pt-4 md:pt-0 md:px-6">
            <strong className="block text-2xl font-black text-slate-900 tracking-tight">
              Daily
            </strong>
            <span className="text-xs font-medium text-slate-500 mt-0.5 block">
              Price updates
            </span>
          </div>

          <div className="pt-4 md:pt-0 md:px-6">
            <strong className="block text-2xl font-black text-slate-900 tracking-tight">
              Independent
            </strong>
            <span className="text-xs font-medium text-slate-500 mt-0.5 block">
              Editorial research
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
