import React from "react";
import {
  Keyboard,
  Mouse,
  Monitor,
  Laptop,
  Headphones,
  Armchair,
  Sparkles,
  Layers,
  Cpu
} from "lucide-react";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  category?: string;
  className?: string;
  priority?: boolean;
}

/**
 * Reusable ProductImage Component
 * Handles local WebP/SVG assets, responsive sizing, and category-themed
 * polished fallback backdrops to eliminate repetitive stock photo tells.
 */
export function ProductImage({
  src,
  alt,
  category = "General",
  className = "",
}: ProductImageProps) {
  // Category-tailored color palettes & icons for genuine visual variety
  const categoryThemes: Record<
    string,
    { bg: string; border: string; text: string; icon: React.ElementType }
  > = {
    Keyboards: {
      bg: "from-slate-100 via-indigo-50/40 to-slate-200/50",
      border: "border-indigo-100",
      text: "text-indigo-700",
      icon: Keyboard,
    },
    Mice: {
      bg: "from-sky-50 via-slate-50 to-blue-100/40",
      border: "border-sky-100",
      text: "text-sky-700",
      icon: Mouse,
    },
    Monitors: {
      bg: "from-slate-900 via-indigo-950 to-slate-800",
      border: "border-slate-800",
      text: "text-indigo-400",
      icon: Monitor,
    },
    Laptops: {
      bg: "from-zinc-100 via-slate-50 to-zinc-200/60",
      border: "border-zinc-200",
      text: "text-zinc-700",
      icon: Laptop,
    },
    "Desk Setup": {
      bg: "from-emerald-50 via-teal-50/40 to-emerald-100/30",
      border: "border-emerald-100",
      text: "text-emerald-700",
      icon: Armchair,
    },
    Headphones: {
      bg: "from-amber-50 via-orange-50/30 to-amber-100/40",
      border: "border-amber-100",
      text: "text-amber-700",
      icon: Headphones,
    },
    Productivity: {
      bg: "from-purple-50 via-slate-50 to-indigo-100/40",
      border: "border-purple-100",
      text: "text-purple-700",
      icon: Cpu,
    },
  };

  const matchedKey =
    Object.keys(categoryThemes).find((key) =>
      category.toLowerCase().includes(key.toLowerCase())
    ) || "Productivity";

  const theme = categoryThemes[matchedKey] || categoryThemes["Productivity"];
  const FallbackIcon = theme.icon;

  // If valid src is provided (local or remote), render img with graceful fallback
  if (src && src.trim().length > 0 && !src.includes("unsplash.com/photo-1505740420928-5e560c06d30e")) {
    return (
      <div className={`relative w-full h-full flex items-center justify-center p-3 overflow-hidden ${className}`}>
        <img
          src={src}
          alt={alt || "Verified hardware product photography"}
          loading="lazy"
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>
    );
  }

  // Polished thematic placeholder with category typography & icon
  return (
    <div
      className={`relative w-full h-full bg-gradient-to-br ${theme.bg} ${theme.border} border rounded-lg flex flex-col items-center justify-center p-4 text-center overflow-hidden group-hover:brightness-[0.98] transition-all ${className}`}
    >
      <div className="p-3 rounded-xl bg-white/80 shadow-sm backdrop-blur-xs border border-white/60 mb-2">
        <FallbackIcon className={`h-8 w-8 ${theme.text}`} />
      </div>
      <span className="text-[11px] font-bold text-slate-800 line-clamp-1 max-w-[90%] tracking-tight">
        {alt}
      </span>
      <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400 mt-0.5">
        {category}
      </span>
    </div>
  );
}
