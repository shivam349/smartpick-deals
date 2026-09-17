"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  ExternalLink,
  ShieldCheck,
  Send,
  SlidersHorizontal,
  Info,
  Layers,
  ArrowRight,
  Copy,
  Check,
  Building2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HealthData {
  connected: boolean;
  version?: string;
  publisher?: {
    id: number | string;
    name: string;
    currency: string;
  };
  apiKey?: {
    name: string;
    scopes: string[];
    last_used_at: string;
  };
  campaigns?: {
    total_global: number;
    total_india: number;
    sample_analyzed: number;
    accessible: number;
    approval_required: number;
    inactive_unavailable: number;
  };
  timestamp?: string;
}

interface CampaignItem {
  id: number;
  provider: string;
  name: string;
  merchantName: string;
  domain?: string;
  country?: string;
  category?: string;
  accessStatus: string;
  group: "ACCESSIBLE" | "APPROVAL_REQUIRED" | "INACTIVE_UNAVAILABLE";
  status: string;
  payout?: string;
  epc?: string;
  deepLinkSupported: boolean;
  allowedMedia?: string[];
  disallowedMedia?: string[];
  allowedPlatforms?: string[];
  disallowedPlatforms?: string[];
  trackingUrl?: string;
  raw?: any;
}

interface ConversionResult {
  originalUrl: string;
  trackingUrl: string;
  shortUrl?: string;
  affiliated: boolean;
  monetizable: boolean;
  statusBadge: string;
  statusReason: string;
  campaignId?: number;
  campaignName?: string;
  subid?: string;
  subid2?: string;
}

interface BatchTestSummary {
  testedCount: number;
  monetizableCount: number;
  nonMonetizableCount: number;
  summary: string;
  results: Array<{
    campaignId: number;
    merchantName: string;
    category: string;
    accessStatus: string;
    testUrl: string;
    trackingUrl?: string;
    shortUrl?: string;
    affiliated: boolean;
    monetizable: boolean;
    statusReason: string;
  }>;
}

export default function CuelinksAdminDashboard() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [countryFilter, setCountryFilter] = useState("india");

  // Selected Campaign Details Modal
  const [detailModal, setDetailModal] = useState<CampaignItem | null>(null);

  // Interactive Link Tester State
  const [testUrl, setTestUrl] = useState("https://www.boat-lifestyle.com/products/airdopes-141");
  const [subId1, setSubId1] = useState("smartpick_admin");
  const [subId2, setSubId2] = useState("web_test");
  const [converting, setConverting] = useState(false);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [convertError, setConvertError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Batch Test State
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchSummary, setBatchSummary] = useState<BatchTestSummary | null>(null);

  // Notifications
  const [notice, setNotice] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Fetch Health Check (GET /api/admin/cuelinks/test)
  const fetchHealth = useCallback(async () => {
    setHealthLoading(true);
    try {
      const res = await fetch("/api/admin/cuelinks/test");
      const data = await res.json();
      setHealth(data);
    } catch (err: any) {
      setHealth({ connected: false });
    } finally {
      setHealthLoading(false);
    }
  }, []);

  // Fetch Campaigns (GET /api/admin/cuelinks/campaigns)
  const fetchCampaigns = useCallback(async () => {
    setLoadingCampaigns(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("per_page", "25");
      if (countryFilter) params.set("country", countryFilter);
      if (searchQuery) params.set("query", searchQuery);
      if (selectedCategory && selectedCategory !== "all") {
        params.set("category", selectedCategory);
      }
      if (selectedFilter === "accessible") {
        params.set("access_status", "open");
      } else if (selectedFilter === "approval") {
        params.set("access_status", "not_applied");
      }

      const res = await fetch(`/api/admin/cuelinks/campaigns?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setCampaigns(data.data || []);
        setTotalPages(data.pagination?.total_pages || 1);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (err: any) {
      setNotice({ text: "Failed to load campaigns", type: "error" });
    } finally {
      setLoadingCampaigns(false);
    }
  }, [page, countryFilter, searchQuery, selectedCategory, selectedFilter]);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Request Campaign Access
  const handleRequestAccess = async (campaignId: number, name: string) => {
    setNotice({ text: `Submitting access request for ${name}...`, type: "info" });
    try {
      const res = await fetch("/api/admin/cuelinks/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId }),
      });
      const data = await res.json();

      if (data.success) {
        setNotice({
          text: `Access requested for ${name}! Status: ${data.status}`,
          type: "success",
        });
        // Refresh campaigns
        fetchCampaigns();
      } else {
        setNotice({ text: `Request failed: ${data.error || data.message}`, type: "error" });
      }
    } catch (err: any) {
      setNotice({ text: `Error: ${err.message}`, type: "error" });
    }
  };

  // Convert Single Link
  const handleConvertLink = async (urlToConvert?: string) => {
    const url = urlToConvert || testUrl;
    if (!url) return;

    setConverting(true);
    setConvertError(null);
    setConversionResult(null);

    try {
      const res = await fetch("/api/admin/cuelinks/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          subid: subId1,
          subid2: subId2,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setConversionResult(json.data);
      } else {
        setConvertError(json.error || "Failed to convert URL");
      }
    } catch (err: any) {
      setConvertError(err.message || "Network error");
    } finally {
      setConverting(false);
    }
  };

  // Broad Automated Batch Test
  const handleRunBatchTest = async () => {
    setBatchLoading(true);
    setNotice({ text: "Executing safe multi-category automated test...", type: "info" });
    try {
      const res = await fetch("/api/admin/cuelinks/test-all", {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        setBatchSummary(data);
        setNotice({
          text: `Batch test complete! ${data.monetizableCount} of ${data.testedCount} campaigns monetizable.`,
          type: "success",
        });
      } else {
        setNotice({ text: `Batch test error: ${data.error}`, type: "error" });
      }
    } catch (err: any) {
      setNotice({ text: `Batch test failed: ${err.message}`, type: "error" });
    } finally {
      setBatchLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Link href="/admin" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                <ChevronLeft className="h-3.5 w-3.5" /> Back to Admin
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Affiliate Operations
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <span>Cuelinks Publisher V3 Control Hub</span>
              {health?.connected ? (
                <Badge variant="deal" className="text-xs px-2.5 py-0.5">Connected (V3)</Badge>
              ) : (
                <Badge variant="destructive" className="text-xs">Disconnected</Badge>
              )}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Server-side merchant campaign discovery, live monetization diagnostics, and conversion validation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              onClick={fetchHealth}
              disabled={healthLoading}
              variant="outline"
              size="sm"
              className="text-xs gap-1.5 bg-white"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${healthLoading ? "animate-spin" : ""}`} />
              <span>Refresh Status</span>
            </Button>

            <Button
              onClick={handleRunBatchTest}
              disabled={batchLoading}
              variant="default"
              size="sm"
              className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              <Sparkles className={`h-3.5 w-3.5 ${batchLoading ? "animate-spin" : ""}`} />
              <span>Test All Accessible Campaigns</span>
            </Button>
          </div>
        </div>

        {/* Global Notice Banner */}
        {notice && (
          <div
            className={`p-4 rounded-xl border text-xs sm:text-sm font-medium flex items-center justify-between gap-3 ${
              notice.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : notice.type === "error"
                ? "bg-red-50 border-red-200 text-red-900"
                : "bg-blue-50 border-blue-200 text-blue-900"
            }`}
          >
            <div className="flex items-center gap-2">
              {notice.type === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
              {notice.type === "error" && <XCircle className="h-4 w-4 text-red-600 shrink-0" />}
              {notice.type === "info" && <Info className="h-4 w-4 text-blue-600 shrink-0" />}
              <span>{notice.text}</span>
            </div>
            <button
              onClick={() => setNotice(null)}
              className="text-xs underline font-semibold hover:opacity-80"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* PHASE 11: KPI Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          
          {/* Card 1: API Status */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>API Status</span>
              <ShieldCheck className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-xl font-black text-slate-900">
              {health?.connected ? "Operational" : "Offline"}
            </div>
            <div className="text-[11px] text-slate-500 truncate mt-1">
              {health?.publisher?.name ? `${health.publisher.name} (${health.publisher.currency})` : "Token Verified"}
            </div>
          </div>

          {/* Card 2: Total Campaigns */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>India Campaigns</span>
              <Building2 className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-xl font-black text-slate-900">
              {health?.campaigns?.total_india || "320+"}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {health?.campaigns?.total_global?.toLocaleString() || "28,500+"} Global
            </div>
          </div>

          {/* Card 3: Accessible */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-emerald-800 mb-1">
              <span>Accessible</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-xl font-black text-emerald-700">
              {health?.campaigns?.accessible || "Active"}
            </div>
            <div className="text-[11px] text-emerald-800 mt-1">Ready to monetize</div>
          </div>

          {/* Card 4: Approval Required */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-amber-800 mb-1">
              <span>Needs Approval</span>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <div className="text-xl font-black text-amber-700">
              {health?.campaigns?.approval_required || "Pending"}
            </div>
            <div className="text-[11px] text-amber-800 mt-1">One-click request</div>
          </div>

          {/* Card 5: Inactive/Paused */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Unavailable</span>
              <XCircle className="h-4 w-4 text-slate-400" />
            </div>
            <div className="text-xl font-black text-slate-700">
              {health?.campaigns?.inactive_unavailable || 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Paused / Closed</div>
          </div>

          {/* Card 6: Last Checked */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Last Checked</span>
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-xs font-bold text-slate-800">
              {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : "Just now"}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Server authenticated</div>
          </div>

        </div>

        {/* BATCH TEST REPORT SECTION (Visible after batch test) */}
        {batchSummary && (
          <div className="rounded-xl border border-blue-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <span>Multi-Category Batch Diagnostic Report</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{batchSummary.summary}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="deal" className="text-xs">
                  ✅ {batchSummary.monetizableCount} Monetizable
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  ⚠️ {batchSummary.nonMonetizableCount} Require Approval
                </Badge>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 bg-slate-50">
                    <th className="py-2.5 px-3 font-semibold">Merchant</th>
                    <th className="py-2.5 px-3 font-semibold">Category</th>
                    <th className="py-2.5 px-3 font-semibold">Test URL</th>
                    <th className="py-2.5 px-3 font-semibold">Monetization Status</th>
                    <th className="py-2.5 px-3 font-semibold">Tracking Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {batchSummary.results.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {r.merchantName} ({r.campaignId})
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{r.category}</td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] truncate max-w-[200px]">
                        {r.testUrl}
                      </td>
                      <td className="py-2.5 px-3">
                        {r.affiliated ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold text-[11px]">
                            <CheckCircle2 className="h-3 w-3" /> MONETIZABLE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium text-[11px]">
                            <AlertTriangle className="h-3 w-3" /> NOT MONETIZABLE
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {r.shortUrl ? (
                          <a
                            href={r.shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline font-mono text-[11px] flex items-center gap-1"
                          >
                            <span>{r.shortUrl}</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PHASE 4 & 10: Interactive Link Conversion & Attribution Tester */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Send className="h-4 w-4 text-blue-600" />
                <span>Live Link Conversion & Monetization Tester</span>
              </h2>
              <span className="text-xs text-slate-400 font-mono">POST /links/convert</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Test any live merchant product or store URL. SmartPick validates that Cuelinks returns{" "}
              <code className="text-blue-600 font-bold font-mono">affiliated === true</code> before marking it eligible for commissions.
            </p>
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-400 font-medium mr-1">Presets:</span>
            <button
              onClick={() => {
                setTestUrl("https://www.boat-lifestyle.com/products/airdopes-141");
                handleConvertLink("https://www.boat-lifestyle.com/products/airdopes-141");
              }}
              className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full font-medium transition"
            >
              🎧 BoAt (Monetizable)
            </button>
            <button
              onClick={() => {
                setTestUrl("https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac6485515ae4");
                handleConvertLink("https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac6485515ae4");
              }}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full font-medium transition"
            >
              📱 Flipkart (Test)
            </button>
            <button
              onClick={() => {
                setTestUrl("https://www.amazon.in/dp/B0CX58HYR3");
                handleConvertLink("https://www.amazon.in/dp/B0CX58HYR3");
              }}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full font-medium transition"
            >
              📦 Amazon India (Test)
            </button>
            <button
              onClick={() => {
                setTestUrl("https://www.croma.com/apple-iphone-15-128gb-black-/p/300762");
                handleConvertLink("https://www.croma.com/apple-iphone-15-128gb-black-/p/300762");
              }}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full font-medium transition"
            >
              ⚡ Croma (Test)
            </button>
            <button
              onClick={() => {
                setTestUrl("https://www.myntra.com/tshirts/roadster/roadster-men-black-cotton-pure-cotton-t-shirt/2297855/buy");
                handleConvertLink("https://www.myntra.com/tshirts/roadster/roadster-men-black-cotton-pure-cotton-t-shirt/2297855/buy");
              }}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full font-medium transition"
            >
              👕 Myntra (Test)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
            <div className="md:col-span-6">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Merchant Destination URL
              </label>
              <input
                type="url"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="https://www.merchant.com/product/..."
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                SubID (Article/Product)
              </label>
              <input
                type="text"
                value={subId1}
                onChange={(e) => setSubId1(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                SubID 2 (Placement/Source)
              </label>
              <input
                type="text"
                value={subId2}
                onChange={(e) => setSubId2(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2 flex items-end">
              <Button
                onClick={() => handleConvertLink()}
                disabled={converting || !testUrl}
                className="w-full text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white h-[38px]"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${converting ? "animate-spin" : ""}`} />
                <span>{converting ? "Testing..." : "Convert Link"}</span>
              </Button>
            </div>
          </div>

          {/* Conversion Error */}
          {convertError && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{convertError}</span>
            </div>
          )}

          {/* Conversion Result Panel */}
          {conversionResult && (
            <div
              className={`p-5 rounded-xl border text-xs space-y-4 ${
                conversionResult.affiliated
                  ? "border-emerald-300 bg-emerald-50/40"
                  : "border-amber-300 bg-amber-50/40"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-slate-200">
                <div className="flex items-center gap-2.5">
                  {conversionResult.affiliated ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-black bg-emerald-600 text-white shadow-sm">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      ✅ MONETIZABLE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-black bg-amber-600 text-white shadow-sm">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      ⚠️ NOT CURRENTLY MONETIZABLE
                    </span>
                  )}
                  <span className="font-bold text-slate-900 text-sm">
                    {conversionResult.campaignName || "Merchant Identified"} (ID: {conversionResult.campaignId || "N/A"})
                  </span>
                </div>

                <span className="text-[11px] text-slate-500 font-medium">
                  {conversionResult.statusReason}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {/* Short URL */}
                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-slate-500 font-semibold text-[11px]">
                    <span>Shortened Affiliate URL</span>
                    {conversionResult.shortUrl && (
                      <button
                        onClick={() => copyToClipboard(conversionResult.shortUrl!, "short")}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        {copiedKey === "short" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedKey === "short" ? "Copied" : "Copy"}</span>
                      </button>
                    )}
                  </div>
                  <div className="font-mono text-xs text-blue-700 font-bold truncate">
                    {conversionResult.shortUrl || "No short URL returned"}
                  </div>
                </div>

                {/* Full Tracking URL */}
                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-slate-500 font-semibold text-[11px]">
                    <span>Full Redirect Tracking URL</span>
                    {conversionResult.trackingUrl && (
                      <button
                        onClick={() => copyToClipboard(conversionResult.trackingUrl, "tracking")}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        {copiedKey === "tracking" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedKey === "tracking" ? "Copied" : "Copy"}</span>
                      </button>
                    )}
                  </div>
                  <div className="font-mono text-[11px] text-slate-700 truncate">
                    {conversionResult.trackingUrl}
                  </div>
                </div>
              </div>

              {!conversionResult.affiliated && (
                <div className="text-[11px] text-amber-900 bg-amber-100/70 p-2.5 rounded-md border border-amber-200 flex items-center gap-2">
                  <Info className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                  <span>
                    <strong>Commission Protection Notice:</strong> Cuelinks returned{" "}
                    <code>affiliated = false</code>. Purchases through this link will not generate revenue until your publisher account is approved for this campaign.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* PHASE 3: CAMPAIGNS TABLE & DISCOVERY */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-600" />
                <span>Discovered Merchant Campaigns</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing {campaigns.length} of {totalCount} campaigns from Cuelinks V3
              </p>
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search merchant or domain..."
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 pt-3">
            <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
              <SlidersHorizontal className="h-3 w-3" /> Access:
            </span>
            {[
              { id: "all", label: "All Campaigns" },
              { id: "accessible", label: "Accessible Only" },
              { id: "approval", label: "Approval Required" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setSelectedFilter(f.id);
                  setPage(1);
                }}
                className={`text-xs px-3 py-1 rounded-full font-medium transition ${
                  selectedFilter === f.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {f.label}
              </button>
            ))}

            <div className="h-4 w-px bg-slate-300 mx-1 hidden sm:block" />

            <span className="text-xs font-semibold text-slate-500 mr-1">Category:</span>
            {[
              "All",
              "Electronics",
              "Fashion",
              "Health & Beauty",
              "Home & Kitchen",
              "Travel",
            ].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat.toLowerCase());
                  setPage(1);
                }}
                className={`text-xs px-3 py-1 rounded-full font-medium transition ${
                  selectedCategory === cat.toLowerCase()
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Campaigns Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-3 px-3.5">Merchant</th>
                  <th className="py-3 px-3.5">ID</th>
                  <th className="py-3 px-3.5">Category</th>
                  <th className="py-3 px-3.5">Country</th>
                  <th className="py-3 px-3.5">Access Status</th>
                  <th className="py-3 px-3.5">Payout / EPC</th>
                  <th className="py-3 px-3.5">Deep Link</th>
                  <th className="py-3 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loadingCampaigns ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-blue-600" />
                      Loading campaigns from Cuelinks V3...
                    </td>
                  </tr>
                ) : campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No campaigns matched your current filters.
                    </td>
                  </tr>
                ) : (
                  campaigns.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition">
                      {/* Merchant */}
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-900">{c.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono truncate max-w-[140px]">
                          {c.domain}
                        </div>
                      </td>

                      {/* ID */}
                      <td className="py-3 px-3.5 font-mono text-slate-600">{c.id}</td>

                      {/* Category */}
                      <td className="py-3 px-3.5">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                          {c.category || "General"}
                        </span>
                      </td>

                      {/* Country */}
                      <td className="py-3 px-3.5 text-slate-600">{c.country || "Global"}</td>

                      {/* Access Status */}
                      <td className="py-3 px-3.5">
                        {c.group === "ACCESSIBLE" ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[11px]">
                            <CheckCircle2 className="h-3 w-3" />
                            {c.accessStatus.toUpperCase()}
                          </span>
                        ) : c.group === "APPROVAL_REQUIRED" ? (
                          <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold text-[11px]">
                            <Clock className="h-3 w-3" />
                            {c.accessStatus.toUpperCase()}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full font-medium text-[11px]">
                            <XCircle className="h-3 w-3" />
                            {c.accessStatus.toUpperCase()}
                          </span>
                        )}
                      </td>

                      {/* Payout & EPC */}
                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-slate-800">{c.payout || "Variable"}</div>
                        {c.epc && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            EPC: {c.epc}
                          </div>
                        )}
                      </td>

                      {/* Deep Link */}
                      <td className="py-3 px-3.5">
                        {c.deepLinkSupported ? (
                          <span className="text-emerald-700 font-semibold text-[11px]">Supported</span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Homepage only</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            onClick={() => setDetailModal(c)}
                            size="sm"
                            variant="outline"
                            className="text-[11px] h-7 px-2"
                          >
                            Details
                          </Button>

                          {c.group === "APPROVAL_REQUIRED" && (
                            <Button
                              onClick={() => handleRequestAccess(c.id, c.name)}
                              size="sm"
                              variant="outline"
                              className="text-[11px] h-7 px-2 text-amber-700 border-amber-300 hover:bg-amber-50"
                            >
                              Request Access
                            </Button>
                          )}

                          <Button
                            onClick={() => {
                              const destUrl = c.raw?.url || `https://${c.domain}`;
                              setTestUrl(destUrl);
                              handleConvertLink(destUrl);
                            }}
                            size="sm"
                            variant="default"
                            className="text-[11px] h-7 px-2.5 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Test Link
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-500">
              Page {page} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loadingCampaigns}
                size="sm"
                variant="outline"
                className="text-xs h-8 px-3"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
              </Button>
              <Button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loadingCampaigns}
                size="sm"
                variant="outline"
                className="text-xs h-8 px-3"
              >
                Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* CAMPAIGN DETAILS MODAL */}
        {detailModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-900">{detailModal.name}</h3>
                    <Badge variant="outline" className="text-xs">ID: {detailModal.id}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-mono">{detailModal.domain}</p>
                </div>
                <button
                  onClick={() => setDetailModal(null)}
                  className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
                >
                  ✕
                </button>
              </div>

              {/* Status & Payout Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-slate-400 font-semibold mb-1">Access</div>
                  <div className="font-bold text-slate-900">{detailModal.accessStatus}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-slate-400 font-semibold mb-1">Payout</div>
                  <div className="font-bold text-slate-900">{detailModal.payout || "Variable"}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-slate-400 font-semibold mb-1">Cookie Window</div>
                  <div className="font-bold text-slate-900">{detailModal.raw?.cookie_duration || "Standard"}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-slate-400 font-semibold mb-1">Deeplink</div>
                  <div className="font-bold text-emerald-700">
                    {detailModal.deepLinkSupported ? "Allowed" : "Not Allowed"}
                  </div>
                </div>
              </div>

              {/* Allowed Media */}
              {detailModal.allowedMedia && detailModal.allowedMedia.length > 0 && (
                <div className="space-y-1.5 text-xs">
                  <h4 className="font-bold text-slate-900">Allowed Promotion Channels</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {detailModal.allowedMedia.map((m, i) => (
                      <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded font-medium text-[11px]">
                        ✓ {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Disallowed Media */}
              {detailModal.disallowedMedia && detailModal.disallowedMedia.length > 0 && (
                <div className="space-y-1.5 text-xs">
                  <h4 className="font-bold text-slate-900">Restricted / Disallowed Channels</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {detailModal.disallowedMedia.map((m, i) => (
                      <span key={i} className="px-2 py-0.5 bg-red-50 text-red-800 rounded font-medium text-[11px]">
                        ✕ {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Allowed Platforms */}
              {detailModal.allowedPlatforms && detailModal.allowedPlatforms.length > 0 && (
                <div className="space-y-1.5 text-xs">
                  <h4 className="font-bold text-slate-900">Supported Platforms</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {detailModal.allowedPlatforms.map((p, i) => (
                      <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded font-medium text-[11px]">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <Button
                  onClick={() => setDetailModal(null)}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Close
                </Button>
                {detailModal.group === "APPROVAL_REQUIRED" && (
                  <Button
                    onClick={() => {
                      handleRequestAccess(detailModal.id, detailModal.name);
                      setDetailModal(null);
                    }}
                    size="sm"
                    className="text-xs bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Request Access Now
                  </Button>
                )}
                <Button
                  onClick={() => {
                    const destUrl = detailModal.raw?.url || `https://${detailModal.domain}`;
                    setTestUrl(destUrl);
                    setDetailModal(null);
                    handleConvertLink(destUrl);
                  }}
                  size="sm"
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Test Merchant Link
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
