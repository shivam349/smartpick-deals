"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Menu, X, Settings, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/logo";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const focusSearch = () => {
    const searchInput = document.getElementById("hero-product-search");
    if (searchInput) {
      searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
      searchInput.focus();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo with Hand-crafted SVG Logomark */}
        <Link href="/" className="group flex items-center">
          <Logo animated size="md" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/deals" className="hover:text-indigo-900 transition font-semibold">
            Deals
          </Link>
          <Link href="/guides" className="hover:text-indigo-900 transition">
            Buying Guides
          </Link>
          <Link href="/compare" className="hover:text-indigo-900 transition">
            Head-to-Head
          </Link>
          <Link href="/#categories" className="hover:text-indigo-900 transition">
            Categories
          </Link>
          <Link href="/#editorial-team" className="hover:text-indigo-900 transition flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
            <span>How We Test</span>
          </Link>
        </nav>

        {/* Search Trigger Button & Admin */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={focusSearch}
            className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs text-slate-500 hover:border-slate-300 hover:bg-slate-100 transition shadow-sm"
          >
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <span>Search gear...</span>
            <kbd className="text-[10px] bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-400">⌘K</kbd>
          </button>

          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-100 transition"
            title="Admin & Pipeline Control"
          >
            <Settings className="h-4 w-4" />
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 py-4 space-y-3 shadow-lg animate-in fade-in slide-in-from-top-2">
          <Link
            href="/deals"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-800 hover:text-indigo-600"
          >
            Today's Deals
          </Link>
          <Link
            href="/guides"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-600 hover:text-indigo-600"
          >
            Buying Guides
          </Link>
          <Link
            href="/compare"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-600 hover:text-indigo-600"
          >
            Head-to-Head Comparisons
          </Link>
          <Link
            href="/#categories"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-600 hover:text-indigo-600"
          >
            Browse Categories
          </Link>
          <Link
            href="/#editorial-team"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-600 hover:text-indigo-600"
          >
            How We Test & Editorial Team
          </Link>
        </div>
      )}
    </header>
  );
}
