import React from "react";
import Link from "next/link";
import {
  Keyboard,
  Mouse,
  Monitor,
  Laptop,
  Briefcase,
  Headphones,
  Gamepad2,
  Coffee,
  ShieldCheck,
  Activity,
  Home,
  ArrowRight,
  LucideIcon
} from "lucide-react";
import { Category } from "@/lib/types";

// Icon mapping helper
const iconMap: Record<string, LucideIcon> = {
  Keyboard,
  Mouse,
  Monitor,
  Laptop,
  Briefcase,
  Headphones,
  Gamepad2,
  Coffee,
  ShieldCheck,
  Activity,
  Home,
};

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const IconComponent = (category.icon && iconMap[category.icon]) || Briefcase;

  return (
    <Link
      href={`/category/${category.slug}`}
      className="editorial-card p-5 group flex flex-col justify-between hover:border-blue-400 transition"
    >
      <div>
        <div className="h-10 w-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-3 group-hover:bg-blue-50 group-hover:text-blue-600 transition">
          <IconComponent className="h-5 w-5" />
        </div>
        <strong className="block text-slate-900 text-base font-bold group-hover:text-blue-600 transition">
          {category.name}
        </strong>
        {category.description && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {category.description}
          </p>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600 group-hover:text-blue-600 transition">
        <span>{category.product_count > 0 ? `${category.product_count} products` : "Browse catalog"}</span>
        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
}
