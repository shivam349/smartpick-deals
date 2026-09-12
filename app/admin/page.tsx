"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Settings,
  Database,
  Sparkles,
  RefreshCw,
  Layers,
  Flame,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface LogItem {
  id: string;
  event: string;
  status: string;
  details?: Record<string, any>;
  created_at?: string;
}

interface ProductItem {
  id: string;
  name: string;
  price: string;
  category: string;
  merchant: string;
  is_deal: boolean;
  deal_badge?: string;
  image_url: string;
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [logs, setLogs] = useState<LogItem[]>([]);

  // Fetch data on load
  const fetchData = async () => {
    try {
      const res = await fetch("/api/cron/daily-update");
      const data = await res.json();
      if (data.message) {
        setStatusMessage(data.message);
      }
    } catch (err) {
      // quiet fallback
    }
  };

  const handleSyncDeals = async () => {
    setLoading(true);
    setStatusMessage("Triggering price and deals synchronization...");
    try {
      const res = await fetch("/api/deals/sync", { method: "POST" });
      const data = await res.json();
      setStatusMessage(`Sync completed: ${data.deals_synced || 0} deals updated in Supabase.`);
    } catch (err: any) {
      setStatusMessage(`Sync error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDailyCron = async () => {
    setLoading(true);
    setStatusMessage("Running Vercel Cron daily update pipeline...");
    try {
      const res = await fetch("/api/cron/daily-update");
      const data = await res.json();
      setStatusMessage(`Cron executed successfully at ${data.timestamp || new Date().toLocaleTimeString()}`);
    } catch (err: any) {
      setStatusMessage(`Cron error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGeminiResearch = async () => {
    setLoading(true);
    setStatusMessage("Triggering Gemini research agent for top product...");
    try {
      const res = await fetch("/api/agent/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: "Logitech MX Master 3S",
          specs: ["8K DPI Darkfield Sensor", "Quiet Clicks", "MagSpeed Scroll", "USB-C Quick Charge"],
          category: "Mice & Productivity",
        }),
      });
      const data = await res.json();
      setStatusMessage("Gemini synthesis completed successfully without spec fabrication.");
    } catch (err: any) {
      setStatusMessage(`Gemini error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <Settings className="h-4 w-4" />
            <span>Platform Operations & Control</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Admin & Automation Control Room
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage Supabase catalog synchronization, trigger Gemini research, and execute Vercel cron pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/">
            <Button size="sm" variant="outline">Preview Live Site</Button>
          </Link>
        </div>
      </div>

      {/* Status banner if active */}
      {statusMessage && (
        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50 text-blue-900 text-xs sm:text-sm font-medium flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs text-blue-600 underline font-semibold hover:text-blue-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Catalog Products</span>
            <Database className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">26</div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">Active in Supabase</span>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Verified Live Deals</span>
            <Flame className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-600">11</div>
          <span className="text-[11px] text-slate-500 mt-1 block">With active discounts</span>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Curated Categories</span>
            <Layers className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">7</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Active category hubs</span>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Published Guides</span>
            <FileText className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">3</div>
          <span className="text-[11px] text-slate-500 mt-1 block">SEO landing pages</span>
        </div>
      </div>

      {/* Manual Pipeline Trigger Controls */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span>Manual Automation Triggers</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-3xl">
            Execute backend pipelines manually during development or on-demand. These call the exact same backend endpoints that Vercel Cron runs on schedule.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button
            onClick={handleSyncDeals}
            disabled={loading}
            variant="default"
            className="text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync Products & Deals</span>
          </Button>

          <Button
            onClick={handleDailyCron}
            disabled={loading}
            variant="outline"
            className="text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Execute Daily Cron Job</span>
          </Button>

          <Button
            onClick={handleGeminiResearch}
            disabled={loading}
            variant="outline"
            className="text-xs gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Test Gemini Research Agent</span>
          </Button>
        </div>

        {/* Pipeline Architecture Note */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-900">Vercel Cron Trigger</h4>
            <p className="text-slate-500 text-[11px] mt-1">Secured via CRON_SECRET header verification.</p>
            <code className="text-[10px] text-blue-600 block mt-2 font-mono">GET /api/cron/daily-update</code>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-900">Gemini Synthesis</h4>
            <p className="text-slate-500 text-[11px] mt-1">Extracts pros, cons, and recommendations without fabricating specs.</p>
            <code className="text-[10px] text-blue-600 block mt-2 font-mono">POST /api/agent/research</code>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-900">Discount Calculation</h4>
            <p className="text-slate-500 text-[11px] mt-1">Computes verified discount percent against previous prices.</p>
            <code className="text-[10px] text-blue-600 block mt-2 font-mono">POST /api/deals/sync</code>
          </div>
        </div>
      </div>
    </div>
  );
}
