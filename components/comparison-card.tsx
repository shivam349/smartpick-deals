import Link from "next/link";
import { Swords, ArrowRight, Star } from "lucide-react";
import { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface ComparisonCardProps {
  prodA: Product;
  prodB: Product;
}

export function ComparisonCard({ prodA, prodB }: ComparisonCardProps) {
  const compareSlug = `${prodA.slug}-vs-${prodB.slug}`;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 transition-all hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-950/20">
      <div className="flex items-center justify-between gap-2 mb-4">
        <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
          <Swords className="h-3.5 w-3.5" />
          Head-to-Head Showdown
        </span>
        <span className="text-xs text-slate-400">{prodA.category}</span>
      </div>

      {/* Two product showdown columns */}
      <div className="grid grid-cols-2 gap-4 items-center mb-5">
        {/* Product A */}
        <div className="text-center p-3 rounded-lg bg-slate-950/60 border border-slate-800/60">
          <img src={prodA.image_url} alt={prodA.name} className="h-20 w-full object-cover rounded mb-2" />
          <h4 className="font-semibold text-xs text-white line-clamp-2 mb-1">{prodA.name}</h4>
          <span className="text-xs font-bold text-sky-400">{prodA.price}</span>
        </div>

        {/* Product B */}
        <div className="text-center p-3 rounded-lg bg-slate-950/60 border border-slate-800/60">
          <img src={prodB.image_url} alt={prodB.name} className="h-20 w-full object-cover rounded mb-2" />
          <h4 className="font-semibold text-xs text-white line-clamp-2 mb-1">{prodB.name}</h4>
          <span className="text-xs font-bold text-sky-400">{prodB.price}</span>
        </div>
      </div>

      {/* Action Button */}
      <Link href={`/compare/${compareSlug}`} className="block w-full">
        <Button variant="outline" className="w-full text-xs font-semibold gap-1 hover:border-purple-400 hover:text-purple-300">
          <span>Compare Specs & Verdict</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </Link>
    </div>
  );
}
