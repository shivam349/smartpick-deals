import React from "react";
import Link from "next/link";
import { ShieldCheck, Heart, Sparkles } from "lucide-react";
import { Logo } from "@/components/logo";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info Column */}
          <div className="space-y-3">
            <Link href="/" className="inline-flex items-center group">
              <Logo size="sm" />
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              Independent hardware research, verified spec comparisons, and daily curated tech deals for developers and creators.
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-900 bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 rounded-full">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                Human Editorial Standards
              </span>
            </div>
          </div>

          {/* Explore Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Explore Gear
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/deals" className="hover:text-indigo-900 transition">
                  Today's Deals
                </Link>
              </li>
              <li>
                <Link href="/guides" className="hover:text-indigo-900 transition">
                  All Buying Guides
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-indigo-900 transition">
                  Head-to-Head Comparisons
                </Link>
              </li>
              <li>
                <Link href="/#categories" className="hover:text-indigo-900 transition">
                  Browse Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Editorial & Trust */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Trust & Transparency
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/#editorial-team" className="hover:text-indigo-900 transition">
                  Meet the Reviewers
                </Link>
              </li>
              <li>
                <Link href="/#how-we-evaluate" className="hover:text-indigo-900 transition">
                  Testing Methodology
                </Link>
              </li>
              <li>
                <Link href="/#disclosure" className="hover:text-indigo-900 transition">
                  Affiliate Disclosure Policy
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-indigo-900 transition text-slate-400">
                  Operations Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Policy */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Compliance & Ethics
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              We never accept payment for positive editorial scores. Recommendations are based solely on technical merit, verified ergonomics, and long-term durability.
            </p>
            <div className="text-[11px] text-slate-400">
              FTC 16 CFR § 255 compliant.
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} SmartPick. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Powered by Next.js 14 & Gemini AI</span>
            <span>•</span>
            <Link href="/#disclosure" className="hover:underline">Disclosure</Link>
            <Link href="/#privacy" className="hover:underline">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
