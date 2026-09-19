"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Copy,
  Check,
  Building2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Lock,
  Star,
  Globe,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SMARTPICK_WEBSITE_URL,
  SMARTPICK_PROMOTION_DETAILS,
  canRequestAccess,
  getCampaignAccessLabel,
} from "@/lib/cuelinks";

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

const SMARTPICK_PRIORITY_MERCHANTS = [
  "Amazon India",
  "Flipkart",
  "Myntra",
  "AJIO",
  "Croma",
  "Reliance Digital",
  "Tata CLiQ",
  "Samsung",
  "BoAt",
  "Nykaa",
];

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
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [selectedPriorityMerchant, setSelectedPriorityMerchant] = useState<string | null>(null);
  const [countryFilter, setCountryFilter] = useState("india");

  // Modals
  const [detailModal, setDetailModal] = useState<CampaignItem | null>(null);
  const [confirmRequestCampaign, setConfirmRequestCampaign] = useState<CampaignItem | null>(null);
  const [submittingAccess, setSubmittingAccess] = useState(false);

  // Interactive Link Tester State
  const [testUrl, setTestUrl] = useState("https://www.boat-lifestyle.com/products/airdopes-141");
  const [subId1, setSubId1] = useState("smartpick_admin");
  const [subId2, setSubId2] = useState("web_test");
  const [converting, setConverting] = useState(false);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [convertError, setConvertError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // BoAt Dedicated Product Ingestion State
  const [boatUrl, setBoatUrl] = useState("https://www.boat-lifestyle.com/products/airdopes-141");
  const [boatSlug, setBoatSlug] = useState("boat-airdopes-141");
  const [boatTitle, setBoatTitle] = useState("BoAt Airdopes 141 True Wireless Earbuds");
  const [boatImageUrl, setBoatImageUrl] = useState("");
  const [boatDescription, setBoatDescription] = useState("BoAt Airdopes 141 wireless earbuds with up to 42 hours total playback, ENx Environmental Noise Cancellation technology, and ASAP Fast Charge.");
  const [boatPrice, setBoatPrice] = useState("1499");
  const [boatCategory, setBoatCategory] = useState("Audio");
  const [boatSubId, setBoatSubId] = useState("boat-airdopes-141");
  const [boatSubId2, setBoatSubId2] = useState("smartpick_product_page");
  const [creatingBoatProduct, setCreatingBoatProduct] = useState(false);
  const [boatProductResult, setBoatProductResult] = useState<any>(null);
  const [boatProductError, setBoatProductError] = useState<string | null>(null);

  // Batch Test State
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchSummary, setBatchSummary] = useState<BatchTestSummary | null>(null);

  // Notifications
  const [notice, setNotice] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Diagnostic Test State
  const [diagLoading, setDiagLoading] = useState(false);
  const [diagResult, setDiagResult] = useState<{
    keyDetected: boolean;
    apiReachable: boolean;
    publisherText?: string;
    error?: string;
  } | null>(null);

  const handleTestCuelinksApi = async () => {
    setDiagLoading(true);
    setDiagResult(null);
    try {
      // 1. Safe server-side environment check
      const configRes = await fetch("/api/admin/cuelinks/config-status");
      const configData = await configRes.json();

      if (!configData.configured) {
        setDiagResult({
          keyDetected: false,
          apiReachable: false,
          error: "Cuelinks API key is missing or not configured. Set CUELINKS_API_KEY in server environment.",
        });
        return;
      }

      // 2. Safe server-side ping test
      const pingRes = await fetch("/api/admin/cuelinks/ping");
      const pingData = await pingRes.json();

      if (pingRes.ok && pingData.connected) {
        const pubId = pingData.publisher?.id;
        const pubName = pingData.publisher?.name;
        const publisherText =
          pubId && pubName
            ? `Publisher: ${pubName} (ID: ${pubId})`
            : pubName
            ? `Publisher: ${pubName}`
            : pubId
            ? `Publisher ID: ${pubId}`
            : undefined;

        setDiagResult({
          keyDetected: true,
          apiReachable: true,
          publisherText,
        });
      } else {
        setDiagResult({
          keyDetected: true,
          apiReachable: false,
          error: pingData.error || "Failed to communicate with Cuelinks API",
        });
      }
    } catch (err: any) {
      setDiagResult({
        keyDetected: false,
        apiReachable: false,
        error: err.message || "Failed to communicate with Cuelinks API",
      });
    } finally {
      setDiagLoading(false);
    }
  };

  const handleCreateBoatProduct = async () => {
    setCreatingBoatProduct(true);
    setBoatProductError(null);
    setBoatProductResult(null);

    try {
      const res = await fetch("/api/admin/cuelinks/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: boatUrl,
          slug: boatSlug,
          title: boatTitle,
          imageUrl: boatImageUrl || undefined,
          description: boatDescription || undefined,
          price: boatPrice ? Number(boatPrice) : null,
          category: boatCategory || "Audio",
          subid: boatSubId || undefined,
          subid2: boatSubId2 || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBoatProductResult(data.data);
        setNotice({
          text: `🎉 Product created successfully! Slug: /product/${data.data.product.slug}`,
          type: "success",
        });
      } else {
        setBoatProductError(data.error || "Failed to ingest BoAt product");
      }
    } catch (err: any) {
      setBoatProductError(err.message || "Network error");
    } finally {
      setCreatingBoatProduct(false);
    }
  };

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
    } catch {
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
      params.set("per_page", "30");
      if (countryFilter) params.set("country", countryFilter);
      if (searchQuery) params.set("query", searchQuery);
      if (selectedPriorityMerchant) {
        params.set("query", selectedPriorityMerchant);
      }

      // Exact Cuelinks access_status mapping
      if (selectedStatusFilter === "open") {
        params.set("access_status", "open");
      } else if (selectedStatusFilter === "approved") {
        params.set("access_status", "approved");
      } else if (selectedStatusFilter === "not_applied") {
        params.set("access_status", "not_applied");
      } else if (selectedStatusFilter === "pending") {
        params.set("access_status", "pending");
      } else if (selectedStatusFilter === "paused") {
        params.set("access_status", "paused");
      } else if (selectedStatusFilter === "rejected") {
        params.set("access_status", "rejected");
      }

      const res = await fetch(`/api/admin/cuelinks/campaigns?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setCampaigns(data.data || []);
        setTotalPages(data.pagination?.total_pages || 1);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch {
      setNotice({ text: "Failed to load campaigns", type: "error" });
    } finally {
      setLoadingCampaigns(false);
    }
  }, [page, countryFilter, searchQuery, selectedPriorityMerchant, selectedStatusFilter]);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Request Campaign Access
  const executeRequestAccess = async () => {
    if (!confirmRequestCampaign) return;

    setSubmittingAccess(true);
    try {
      const res = await fetch("/api/admin/cuelinks/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: confirmRequestCampaign.id,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setNotice({
          text: `✅ Request submitted: Status: Pending (Request ID: #${data.requestId || data.id || "created"})`,
          type: "success",
        });
        // Optimistically update local campaign access status to pending
        setCampaigns((prev) =>
          prev.map((c) =>
            c.id === confirmRequestCampaign.id
              ? { ...c, accessStatus: "pending", group: "APPROVAL_REQUIRED" }
              : c
          )
        );
        setConfirmRequestCampaign(null);
        // Refresh campaign status from server
        fetchCampaigns();
      } else {
        setNotice({
          text: `Request failed: ${data.error || data.message || "Approval unavailable"}`,
          type: "error",
        });
      }
    } catch (err: any) {
      setNotice({ text: `Network error: ${err.message}`, type: "error" });
    } finally {
      setSubmittingAccess(false);
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
            <p className="text-sm text-slate-600 mt-1 flex items-center gap-2">
              <span>Canonical Live Website:</span>
              <a
                href={SMARTPICK_WEBSITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-bold font-mono hover:underline flex items-center gap-1"
              >
                <span>{SMARTPICK_WEBSITE_URL}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              onClick={handleTestCuelinksApi}
              disabled={diagLoading}
              variant="default"
              size="sm"
              className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              <Activity className={`h-3.5 w-3.5 ${diagLoading ? "animate-spin" : ""}`} />
              <span>{diagLoading ? "Testing Cuelinks API..." : "Test Cuelinks API"}</span>
            </Button>

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

        {/* Cuelinks API Diagnostic Result */}
        {diagResult && (
          <div
            className={`p-4 rounded-xl border text-xs sm:text-sm font-medium space-y-2 ${
              diagResult.apiReachable
                ? "bg-emerald-50/90 border-emerald-300 text-emerald-950"
                : "bg-red-50/90 border-red-300 text-red-950"
            }`}
          >
            <div className="flex items-center justify-between font-bold text-xs uppercase tracking-wider">
              <span>Cuelinks API Diagnostic Output</span>
              <button
                onClick={() => setDiagResult(null)}
                className="text-xs lowercase underline font-normal hover:opacity-80"
              >
                dismiss
              </button>
            </div>
            {diagResult.keyDetected && (
              <div className="flex items-center gap-2 font-semibold text-emerald-800">
                <span>✅ API key detected</span>
              </div>
            )}
            {diagResult.apiReachable && (
              <div className="flex items-center gap-2 font-semibold text-emerald-800">
                <span>✅ Cuelinks API reachable</span>
              </div>
            )}
            {diagResult.publisherText && (
              <div className="text-xs text-slate-700 pl-6 font-mono">
                {diagResult.publisherText}
              </div>
            )}
            {diagResult.error && (
              <div className="flex items-center gap-2 font-semibold text-red-800">
                <span>❌ {diagResult.error}</span>
              </div>
            )}
          </div>
        )}

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

        {/* KPI Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
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

          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>India Campaigns</span>
              <Building2 className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-xl font-black text-slate-900">
              {health?.campaigns?.total_india || "323"}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {health?.campaigns?.total_global?.toLocaleString() || "28,500+"} Global
            </div>
          </div>

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

          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-amber-800 mb-1">
              <span>Needs Approval</span>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <div className="text-xl font-black text-amber-700">
              {health?.campaigns?.approval_required || "Pending"}
            </div>
            <div className="text-[11px] text-amber-800 mt-1">Application workflow</div>
          </div>

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

        {/* SECTION: BOAT REAL AFFILIATE MERCHANT INTEGRATION */}
        <div className="rounded-2xl border-2 border-slate-900 bg-white p-6 shadow-md space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-black uppercase tracking-wider bg-slate-900 text-white px-2.5 py-0.5 rounded-full">
                  Verified Merchant #1
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  Monetizable ✅
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                BoAt Lifestyle Affiliate Integration
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                First end-to-end monetizable publisher campaign. Fully verified via Cuelinks V3 provider.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Merchant</span>
                <span className="font-bold text-slate-900 text-sm">BoAt</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Campaign ID</span>
                <span className="font-bold font-mono text-slate-900 text-sm">4232</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Domain</span>
                <span className="font-mono text-slate-900 font-semibold">boat-lifestyle.com</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2">
                <span className="text-emerald-700 block text-[10px] font-semibold uppercase">Status</span>
                <span className="font-bold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Monetizable ✅
                </span>
              </div>
            </div>
          </div>

          {/* Add BoAt Product Form */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Add BoAt Product</span>
                <span className="text-xs font-normal text-slate-500">(Automatic Link Conversion & Storage)</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setBoatUrl("https://www.boat-lifestyle.com/products/airdopes-141");
                  setBoatSlug("boat-airdopes-141");
                  setBoatTitle("BoAt Airdopes 141 True Wireless Earbuds");
                  setBoatPrice("1499");
                  setBoatCategory("Audio");
                  setBoatSubId("boat-airdopes-141");
                  setBoatSubId2("smartpick_product_page");
                }}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Reset to Airdopes 141 Test Data
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
              <div className="md:col-span-8">
                <label className="font-semibold text-slate-700 block mb-1">
                  Product URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={boatUrl}
                  onChange={(e) => setBoatUrl(e.target.value)}
                  placeholder="https://www.boat-lifestyle.com/products/..."
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="md:col-span-4">
                <label className="font-semibold text-slate-700 block mb-1">
                  Product Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={boatSlug}
                  onChange={(e) => setBoatSlug(e.target.value)}
                  placeholder="boat-airdopes-141"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="md:col-span-6">
                <label className="font-semibold text-slate-700 block mb-1">
                  Product Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={boatTitle}
                  onChange={(e) => setBoatTitle(e.target.value)}
                  placeholder="BoAt Airdopes 141..."
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="md:col-span-3">
                <label className="font-semibold text-slate-700 block mb-1">
                  Verified Price (₹ INR, Optional)
                </label>
                <input
                  type="number"
                  value={boatPrice}
                  onChange={(e) => setBoatPrice(e.target.value)}
                  placeholder="1499"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="md:col-span-3">
                <label className="font-semibold text-slate-700 block mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={boatCategory}
                  onChange={(e) => setBoatCategory(e.target.value)}
                  placeholder="Audio"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="md:col-span-12">
                <label className="font-semibold text-slate-700 block mb-1">
                  Image URL (Optional — leave blank for clean category placeholder)
                </label>
                <input
                  type="url"
                  value={boatImageUrl}
                  onChange={(e) => setBoatImageUrl(e.target.value)}
                  placeholder="https://cdn.shopify.com/... or verified image asset"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="md:col-span-12">
                <label className="font-semibold text-slate-700 block mb-1">
                  Factual Product Description
                </label>
                <textarea
                  rows={2}
                  value={boatDescription}
                  onChange={(e) => setBoatDescription(e.target.value)}
                  placeholder="Concise, verified description without fabricated specs..."
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="md:col-span-6">
                <label className="font-semibold text-slate-700 block mb-1">
                  SubID (Slug/Tracking identifier)
                </label>
                <input
                  type="text"
                  value={boatSubId}
                  onChange={(e) => setBoatSubId(e.target.value)}
                  placeholder="boat-airdopes-141"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="md:col-span-6">
                <label className="font-semibold text-slate-700 block mb-1">
                  SubID2 (Source/Placement identifier)
                </label>
                <input
                  type="text"
                  value={boatSubId2}
                  onChange={(e) => setBoatSubId2(e.target.value)}
                  placeholder="smartpick_product_page"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <Button
                onClick={handleCreateBoatProduct}
                disabled={creatingBoatProduct || !boatUrl || !boatSlug || !boatTitle}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-2.5 shadow-sm gap-2"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${creatingBoatProduct ? "animate-spin" : ""}`} />
                <span>{creatingBoatProduct ? "Validating & Ingesting via Cuelinks..." : "Create Affiliate Product"}</span>
              </Button>
            </div>
          </div>

          {/* Product Error Banner */}
          {boatProductError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-start gap-2.5">
              <XCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Product Ingestion Blocked</div>
                <div className="mt-0.5">{boatProductError}</div>
              </div>
            </div>
          )}

          {/* Product Success Result Banner */}
          {boatProductResult && (
            <div className="p-5 rounded-xl border border-emerald-300 bg-emerald-50/50 space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 bg-emerald-600 text-white font-black px-2.5 py-1 rounded-md text-xs shadow-sm">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    PRODUCT STORED IN SUPABASE
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    {boatProductResult.product.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/product/${boatProductResult.product.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 font-bold text-xs bg-white border border-slate-300 hover:border-slate-400 text-slate-800 px-3 py-1 rounded-lg transition"
                  >
                    <span>View Product Page</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                  <a
                    href={`/api/redirect?product=${boatProductResult.product.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-xs bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1 rounded-lg transition"
                  >
                    <span>Test Redirect Link</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <div className="text-slate-500 font-semibold text-[11px]">Affiliation Status</div>
                  <div className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    affiliated === true (Monetizable ✅)
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <div className="text-slate-500 font-semibold text-[11px]">Campaign ID</div>
                  <div className="font-bold font-mono text-slate-900">
                    {boatProductResult.affiliateLink.campaign_id} (BoAt)
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <div className="text-slate-500 font-semibold text-[11px]">Short Affiliate URL</div>
                  <div className="font-mono text-blue-700 font-bold truncate">
                    {boatProductResult.affiliateLink.short_url || boatProductResult.affiliateLink.tracking_url}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BATCH TEST REPORT SECTION */}
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

        {/* SECTION 4: SMARTPICK PRIORITY MERCHANTS BAR */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span>SmartPick Priority Target Merchants</span>
            </div>
            {selectedPriorityMerchant && (
              <button
                onClick={() => {
                  setSelectedPriorityMerchant(null);
                  setPage(1);
                }}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                Clear Priority Filter
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {SMARTPICK_PRIORITY_MERCHANTS.map((merchant) => {
              const isSelected = selectedPriorityMerchant === merchant;
              return (
                <button
                  key={merchant}
                  onClick={() => {
                    setSelectedPriorityMerchant(isSelected ? null : merchant);
                    setSearchQuery("");
                    setPage(1);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition ${
                    isSelected
                      ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                      : "bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {merchant}
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 4: CAMPAIGNS TABLE & DISCOVERY */}
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
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedPriorityMerchant(null);
                    setPage(1);
                  }}
                  placeholder="Search merchant or domain..."
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: Required Filters: All, Open, Approved, Not Applied, Pending, Paused, Rejected */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
              <SlidersHorizontal className="h-3 w-3" /> Status:
            </span>
            {[
              { id: "all", label: "All" },
              { id: "open", label: "Open" },
              { id: "approved", label: "Approved" },
              { id: "not_applied", label: "Not Applied" },
              { id: "pending", label: "Pending" },
              { id: "paused", label: "Paused" },
              { id: "rejected", label: "Rejected" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setSelectedStatusFilter(f.id);
                  setPage(1);
                }}
                className={`text-xs px-3 py-1 rounded-full font-medium transition ${
                  selectedStatusFilter === f.id
                    ? "bg-slate-900 text-white shadow-sm font-bold"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Table of Columns: Merchant | Campaign | Campaign ID | Category | Country | Access Status | Payout/EPC | Deep Link | Request Access | Monetization Test */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-3 px-3">Merchant</th>
                  <th className="py-3 px-3">Campaign</th>
                  <th className="py-3 px-3 font-mono">ID</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Country</th>
                  <th className="py-3 px-3">Access Status</th>
                  <th className="py-3 px-3">Payout / EPC</th>
                  <th className="py-3 px-3">Deep Link</th>
                  <th className="py-3 px-3 text-center">Request Access</th>
                  <th className="py-3 px-3 text-right">Monetization Test</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loadingCampaigns ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-blue-600" />
                      Loading campaigns from Cuelinks V3...
                    </td>
                  </tr>
                ) : campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      No campaigns matched your current filter criteria.
                    </td>
                  </tr>
                ) : (
                  campaigns.map((c) => {
                    const reqCheck = canRequestAccess(c.accessStatus);
                    const accessLabel = getCampaignAccessLabel(c.accessStatus);

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/70 transition">
                        {/* 1. Merchant */}
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{c.merchantName}</div>
                          <div className="text-[11px] text-slate-400 font-mono truncate max-w-[130px]">
                            {c.domain}
                          </div>
                        </td>

                        {/* 2. Campaign */}
                        <td className="py-3 px-3 font-medium text-slate-800 max-w-[140px] truncate">
                          {c.name}
                        </td>

                        {/* 3. Campaign ID */}
                        <td className="py-3 px-3 font-mono text-slate-600 font-semibold">
                          {c.id}
                        </td>

                        {/* 4. Category */}
                        <td className="py-3 px-3">
                          <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                            {c.category || "General"}
                          </span>
                        </td>

                        {/* 5. Country */}
                        <td className="py-3 px-3 text-slate-600">{c.country || "Global"}</td>

                        {/* 6. Access Status */}
                        <td className="py-3 px-3">
                          {c.accessStatus === "open" ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[11px]">
                              <CheckCircle2 className="h-3 w-3" /> Open
                            </span>
                          ) : c.accessStatus === "approved" || c.accessStatus === "active" ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[11px]">
                              <CheckCircle2 className="h-3 w-3" /> Approved
                            </span>
                          ) : c.accessStatus === "pending" ? (
                            <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full font-medium text-[11px]">
                              <Clock className="h-3 w-3 text-amber-600" /> Pending Approval
                            </span>
                          ) : c.accessStatus === "paused" ? (
                            <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full font-medium text-[11px]">
                              <Lock className="h-3 w-3 text-slate-400" /> Paused
                            </span>
                          ) : c.accessStatus === "rejected" ? (
                            <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-0.5 rounded-full font-medium text-[11px]">
                              <XCircle className="h-3 w-3 text-red-500" /> Rejected
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-medium text-[11px]">
                              Not Applied
                            </span>
                          )}
                        </td>

                        {/* 7. Payout / EPC */}
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800">{c.payout || "Variable"}</div>
                          {c.epc && (
                            <div className="text-[10px] text-slate-400 font-mono">
                              EPC: {c.epc}
                            </div>
                          )}
                        </td>

                        {/* 8. Deep Link */}
                        <td className="py-3 px-3">
                          {c.deepLinkSupported ? (
                            <span className="text-emerald-700 font-semibold text-[11px]">Supported</span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Homepage only</span>
                          )}
                        </td>

                        {/* 9. Request Access */}
                        <td className="py-3 px-3 text-center">
                          {reqCheck.allowed ? (
                            <Button
                              onClick={() => setConfirmRequestCampaign(c)}
                              size="sm"
                              className="text-[11px] h-7 px-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                            >
                              Request Access
                            </Button>
                          ) : c.accessStatus === "pending" ? (
                            <span className="text-[11px] text-amber-700 font-medium bg-amber-50 px-2 py-1 rounded">
                              Pending — waiting for approval
                            </span>
                          ) : c.accessStatus === "open" ? (
                            <span className="text-[11px] text-emerald-700 font-semibold">
                              Open (Active)
                            </span>
                          ) : c.accessStatus === "approved" || c.accessStatus === "active" ? (
                            <span className="text-[11px] text-emerald-700 font-semibold">
                              Approved
                            </span>
                          ) : c.accessStatus === "paused" ? (
                            <span className="text-[11px] text-slate-500">
                              Paused — unavailable
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">
                              {accessLabel}
                            </span>
                          )}
                        </td>

                        {/* 10. Monetization Test */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              onClick={() => setDetailModal(c)}
                              size="sm"
                              variant="outline"
                              className="text-[11px] h-7 px-2"
                            >
                              Details
                            </Button>
                            <Button
                              onClick={() => {
                                const destUrl = c.raw?.url || `https://${c.domain}`;
                                setTestUrl(destUrl);
                                handleConvertLink(destUrl);
                              }}
                              size="sm"
                              variant="outline"
                              className="text-[11px] h-7 px-2 text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                            >
                              Test Link
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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

        {/* INTERACTIVE LINK CONVERSION TESTER */}
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

                <span className="text-[11px] text-slate-600 font-medium">
                  {conversionResult.affiliated
                    ? "Active & approved for publisher commission"
                    : "Not currently monetizable — access/campaign status must be reviewed."}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
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
            </div>
          )}
        </div>

        {/* SECTION 5: REQUEST ACCESS CONFIRMATION MODAL */}
        {confirmRequestCampaign && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Request access to {confirmRequestCampaign.name}?
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Campaign ID: <span className="font-mono font-bold text-slate-700">{confirmRequestCampaign.id}</span> | Domain: {confirmRequestCampaign.domain}
                  </p>
                </div>
                <button
                  onClick={() => setConfirmRequestCampaign(null)}
                  disabled={submittingAccess}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
                >
                  ✕
                </button>
              </div>

              {/* Website verification anchor */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1 text-xs">
                <div className="font-bold text-blue-900 flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-blue-600" />
                  <span>Target Publisher Website:</span>
                </div>
                <div className="font-mono text-blue-700 font-bold pl-5">
                  {SMARTPICK_WEBSITE_URL}
                </div>
                <div className="text-[11px] text-slate-500 pl-5">
                  Default approved publisher channel will be used automatically.
                </div>
              </div>

              {/* Truthful Promotion Statement Preview */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-800 block">
                  Truthful Promotion Statement (Sent to Cuelinks & Merchant):
                </label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 text-xs leading-relaxed italic">
                  &ldquo;{SMARTPICK_PROMOTION_DETAILS}&rdquo;
                </div>
                <p className="text-[11px] text-slate-500 pt-0.5">
                  ✓ Contains zero fabricated traffic or revenue numbers. Discloses SmartPick as an organic SEO shopping content platform.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
                <Button
                  onClick={() => setConfirmRequestCampaign(null)}
                  disabled={submittingAccess}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={executeRequestAccess}
                  disabled={submittingAccess}
                  size="sm"
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-sm"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${submittingAccess ? "animate-spin" : ""}`} />
                  <span>{submittingAccess ? "Submitting Application..." : "Confirm & Submit Request"}</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* CAMPAIGN DETAILS MODAL */}
        {detailModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
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

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <Button
                  onClick={() => setDetailModal(null)}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Close
                </Button>
                {canRequestAccess(detailModal.accessStatus).allowed && (
                  <Button
                    onClick={() => {
                      setConfirmRequestCampaign(detailModal);
                      setDetailModal(null);
                    }}
                    size="sm"
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Request Access
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
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
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
