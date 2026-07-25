"use client";

import { useState } from "react";
import {
  ImageIcon,
  AudioLines,
  Link2,
  CheckCircle2,
  TriangleAlert,
  Globe,
  Cpu,
  Clock,
  Loader2,
  ScanSearch,
  Newspaper,
  FileJson,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { isFirebaseConfigured } from "@/lib/firebase";
import { saveAuditReport } from "@/lib/firebase/db";
import { uploadVerificationMedia } from "@/lib/firebase/storage";
import { formatBytes, validateUrl, validateAudioFile } from "@/lib/media";
import { UploadDropzone, type SelectedMedia } from "@/components/upload-dropzone";
import { PremiumCard } from "@/components/premium-card";
import { AnalysisLoader } from "@/components/analysis-loader";
import Folder from "@/components/ui/Folder";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { motion } from "motion/react";
import type { Citation, NewAuditReport, Verdict } from "@/lib/types/firebase";

type TabId = "upload" | "audio" | "url";
type Zone = "authentic" | "mismatch" | "manipulated";
type SaveState = "idle" | "saving" | "saved" | "error" | "signed-out";

type Claim = { field: string; extracted: string; claimed: string; status: "match" | "mismatch" };
type Source = { domain: string; trust: number; date: string };

type NewsArticle = {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  snippet: string;
};

type FactCheckClaim = {
  claim: string;
  claimant: string;
  rating: string;
  publisher: string;
  url: string;
};

type Result = {
  origin: "sample" | "live";
  mediaCaption: string;
  mediaSub: string;
  verdict: { label: string; score: number; zone: Zone };
  deepfakeProbability?: number;
  summary?: string;
  claims: Claim[];
  sources: Source[];
  telemetry: { latency: string; model: string };
  audit?: NewAuditReport;
  newsArticles?: NewsArticle[];
  factCheckClaims?: FactCheckClaim[];
  rawPayload?: any;
};

const TABS: { id: TabId; label: string; icon: typeof ImageIcon }[] = [
  { id: "upload", label: "Upload Photo / Video", icon: ImageIcon },
  { id: "audio", label: "Audio Note / Clip", icon: AudioLines },
  { id: "url", label: "Paste URL / Social Post", icon: Link2 },
];

const VERDICT_META: Record<string, { zone: Zone; label: string }> = {
  AUTHENTIC: { zone: "authentic", label: "No Manipulation Detected" },
  CONTEXT_MISMATCH: { zone: "mismatch", label: "Context Mismatch Detected" },
  SUSPECTED_MANIPULATION: { zone: "manipulated", label: "Suspected Manipulation" },
};

const ZONE_STYLES: Record<Zone, { text: string; bar: string }> = {
  authentic: { text: "text-emerald-600 dark:text-emerald-500", bar: "bg-emerald-600 dark:bg-emerald-500" },
  mismatch: { text: "text-amber-600 dark:text-amber-500", bar: "bg-amber-600 dark:bg-amber-500" },
  manipulated: { text: "text-rose-600 dark:text-rose-500", bar: "bg-rose-600 dark:bg-rose-500" },
};

export function VerificationSandbox() {
  const { userDetails } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("upload");
  const [result, setResult] = useState<Result | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<"overview" | "news" | "factcheck">("overview");

  const [media, setMedia] = useState<SelectedMedia | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [claimedContext, setClaimedContext] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  async function persistAudit(audit: NewAuditReport, file?: File) {
    if (!isFirebaseConfigured || !userDetails) return;

    setSaveState("saving");
    try {
      let mediaUrl = audit.mediaUrl;
      if (file) {
        mediaUrl = await uploadVerificationMedia(file, userDetails.id);
      }
      await saveAuditReport(userDetails.id, { ...audit, mediaUrl });
      setSaveState("saved");
    } catch (err) {
      console.error("Failed to save audit report:", err);
      setSaveState("error");
    }
  }

  async function runVerification() {
    setAnalysisError(null);

    if (activeTab === "url") {
      const urlCheck = validateUrl(urlInput);
      if (!urlCheck.isValid || !urlCheck.formattedUrl) {
        setAnalysisError(urlCheck.error || "Please enter a valid URL.");
        return;
      }

      setAnalyzing(true);
      setSaveState("idle");
      setActiveResultTab("overview");

      try {
        const response = await fetch("/api/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: urlCheck.formattedUrl, claimedContext }),
        });

        const payload = await response.json();
        if (!response.ok) {
          setAnalysisError(payload?.error || "URL verification failed. Please try again.");
          setResult(null);
          return;
        }

        const fa = payload.forensicAnalysis || payload;
        const meta = VERDICT_META[fa.verdict] ?? VERDICT_META.CONTEXT_MISMATCH;
        const citations: Citation[] = fa.citations ?? [];

        const liveResult: Result = {
          origin: "live",
          mediaCaption: urlCheck.formattedUrl,
          mediaSub: fa.mediaDescription || "Webpage Analysis",
          verdict: { label: meta.label, score: fa.confidenceScore ?? 0, zone: meta.zone },
          deepfakeProbability: fa.deepfakeProbability,
          summary: fa.summary,
          claims: fa.claims ?? [],
          sources: citations.map((c) => ({
            domain: c.source_name,
            trust: c.trust_score,
            date: "cited by model",
          })),
          telemetry: {
            latency: fa.latencyMs ? `${fa.latencyMs}ms` : "—",
            model: fa.model ?? "Gemma 4",
          },
          newsArticles: payload.newsArticles ?? [],
          factCheckClaims: payload.factCheckClaims ?? [],
          rawPayload: payload,
        };

        setResult(liveResult);

        void persistAudit({
          claimText: claimedContext || urlCheck.formattedUrl,
          verdict: (fa.verdict as Verdict) || "CONTEXT_MISMATCH",
          confidenceScore: fa.confidenceScore ?? 0,
          summary: fa.summary ?? "",
          citations,
        });
      } catch (err) {
        console.error("URL Verification request error:", err);
        setAnalysisError("Unable to verify URL. Please check network connection and try again.");
        setResult(null);
      } finally {
        setAnalyzing(false);
      }
      return;
    }

    // Audio or Upload File Verification
    if (!media) {
      setAnalysisError(`Please select a ${activeTab === "audio" ? "valid audio" : "photo or video"} file to verify.`);
      return;
    }

    if (activeTab === "audio") {
      const audioProblem = validateAudioFile(media.file);
      if (audioProblem) {
        setAnalysisError(audioProblem);
        return;
      }
    }

    setAnalyzing(true);
    setSaveState("idle");
    setActiveResultTab("overview");

    try {
      const body = new FormData();
      body.append("media", media.file);
      body.append("claimedContext", claimedContext);
      body.append("type", activeTab);

      const response = await fetch("/api/verify", { method: "POST", body });
      const payload = await response.json();

      if (!response.ok) {
        setAnalysisError(payload?.error ?? "Verification failed. Please try again.");
        setResult(null);
        return;
      }

      const fa = payload.forensicAnalysis || payload;
      const meta = VERDICT_META[fa.verdict] ?? VERDICT_META.CONTEXT_MISMATCH;
      const citations: Citation[] = fa.citations ?? [];

      const live: Result = {
        origin: "live",
        mediaCaption: media.file.name,
        mediaSub: fa.mediaDescription ?? `${formatBytes(media.file.size)} · ${media.file.type || activeTab.toUpperCase()}`,
        verdict: { label: meta.label, score: fa.confidenceScore ?? 0, zone: meta.zone },
        deepfakeProbability: fa.deepfakeProbability,
        summary: fa.summary,
        claims: fa.claims ?? [],
        sources: citations.map((c) => ({
          domain: c.source_name,
          trust: c.trust_score,
          date: "cited by model",
        })),
        telemetry: {
          latency: fa.latencyMs ? `${fa.latencyMs}ms` : "—",
          model: fa.model ?? "Gemma 4",
        },
        newsArticles: payload.newsArticles ?? [],
        factCheckClaims: payload.factCheckClaims ?? [],
        rawPayload: payload,
      };

      setResult(live);

      void persistAudit(
        {
          claimText: claimedContext || media.file.name,
          verdict: (fa.verdict as Verdict) || "CONTEXT_MISMATCH",
          confidenceScore: fa.confidenceScore ?? 0,
          summary: fa.summary ?? "",
          citations,
        },
        media.file
      );
    } catch (err) {
      console.error("Verification request failed:", err);
      setAnalysisError("Couldn't reach the verification service. Check connection and try again.");
      setResult(null);
    } finally {
      setAnalyzing(false);
    }
  }

  const zoneStyle = result ? ZONE_STYLES[result.verdict.zone] : null;

  return (
    <div
      id="sandbox"
      className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div role="tablist" aria-label="Verification input type" className="flex flex-wrap gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => {
                  setActiveTab(tab.id);
                  setAnalysisError(null);
                }}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  selected
                    ? "bg-slate-900 text-slate-50 dark:bg-slate-100 dark:text-slate-900"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,320px)_1fr]">
        <div className="border-b border-slate-200 p-4 dark:border-slate-800 lg:border-b-0 lg:border-r flex flex-col h-full">
          {activeTab === "url" ? (
            <>
              <div className="space-y-3 flex-1">
                <label htmlFor="url-input" className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Webpage / News Article URL
                </label>
                <div className="relative">
                  <Globe className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    id="url-input"
                    type="url"
                    value={urlInput}
                    onChange={(e) => {
                      setUrlInput(e.target.value);
                      setAnalysisError(null);
                    }}
                    disabled={analyzing}
                    placeholder="https://news.example.com/article"
                    className="w-full rounded-md border border-slate-300 bg-white pl-8 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Supports news articles, blog posts, press releases, and public web pages (http:// or https://).
                </p>

                <div className="pt-2">
                  <label htmlFor="url-context" className="block text-[11px] font-medium text-slate-700 dark:text-slate-300">
                    Additional Context / Claim <span className="font-normal text-slate-400">(optional)</span>
                  </label>
                  <textarea
                    id="url-context"
                    rows={3}
                    value={claimedContext}
                    onChange={(e) => setClaimedContext(e.target.value)}
                    disabled={analyzing}
                    placeholder="e.g. Verify if this news report is accurate"
                    className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={runVerification}
                disabled={!urlInput.trim() || analyzing}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-50 transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Fetching & Analyzing Webpage...
                  </>
                ) : (
                  <>
                    <ScanSearch className="h-4 w-4" />
                    Verify Webpage URL
                  </>
                )}
              </button>

              {analysisError && (
                <p className="mt-2 flex items-start gap-1.5 rounded-md border border-rose-200 bg-rose-50 px-2.5 py-2 text-[11px] leading-relaxed text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-400">
                  <TriangleAlert className="mt-0.5 h-3 w-3 shrink-0" />
                  {analysisError}
                </p>
              )}
            </>
          ) : (
            <>
              <UploadDropzone
                selected={media}
                disabled={analyzing}
                onSelect={(next) => {
                  setMedia(next);
                  setAnalysisError(null);
                }}
                onClear={() => {
                  setMedia(null);
                  setAnalysisError(null);
                }}
              />

              <div className="mt-3 flex-1">
                <label
                  htmlFor="claimed-context"
                  className="block text-[11px] font-medium text-slate-700 dark:text-slate-300"
                >
                  {activeTab === "audio" ? "What is this audio claimed to state?" : "What is this media claimed to show?"}{" "}
                  <span className="font-normal text-slate-400 dark:text-slate-600">(optional)</span>
                </label>
                <textarea
                  id="claimed-context"
                  rows={3}
                  value={claimedContext}
                  onChange={(e) => setClaimedContext(e.target.value)}
                  disabled={analyzing}
                  placeholder={activeTab === "audio" ? "e.g. Leaked speech audio clip" : "e.g. Protest in Paris last night"}
                  className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>

              <button
                type="button"
                onClick={runVerification}
                disabled={!media || analyzing}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-50 transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing {activeTab === "audio" ? "Audio" : "Media"}...
                  </>
                ) : (
                  <>
                    <ScanSearch className="h-4 w-4" />
                    Run Verification
                  </>
                )}
              </button>

              {analysisError && (
                <p className="mt-2 flex items-start gap-1.5 rounded-md border border-rose-200 bg-rose-50 px-2.5 py-2 text-[11px] leading-relaxed text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-400">
                  <TriangleAlert className="mt-0.5 h-3 w-3 shrink-0" />
                  {analysisError}
                </p>
              )}
            </>
          )}
        </div>

        {/* Results panel */}
        <div className="p-0 bg-slate-50/50 dark:bg-slate-900/50 min-h-[500px]">
          {!result ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center p-6">
              {analyzing ? (
                <AnalysisLoader />
              ) : (
                <>
                  <div className="mb-6 flex items-center justify-center">
                    <Folder
                      size={1.5}
                      color="#3b82f6"
                      items={[
                        <div key="1" className="w-full h-full flex flex-col p-2 gap-1 opacity-50">
                          <div className="h-1 bg-slate-300 rounded w-full"></div>
                          <div className="h-1 bg-slate-300 rounded w-3/4"></div>
                          <div className="h-1 bg-slate-300 rounded w-5/6"></div>
                        </div>,
                        <div key="2" className="w-full h-full flex flex-col p-2 gap-1 opacity-50">
                          <div className="h-1 bg-slate-300 rounded w-full"></div>
                          <div className="h-1 bg-slate-300 rounded w-1/2"></div>
                          <div className="h-1 bg-slate-300 rounded w-4/5"></div>
                        </div>,
                        <div key="3" className="w-full h-full flex items-center justify-center opacity-40">
                          <ScanSearch className="w-4 h-4 text-slate-400" />
                        </div>
                      ]}
                    />
                  </div>
                  <div className="max-w-xs">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      No verification yet
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-500">
                      Submit an image, video, audio clip, or webpage URL to generate a comprehensive forensic report.
                    </p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col">
              {/* Tab Navigation for Results */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-4 space-x-6 overflow-x-auto">
                <button
                  onClick={() => setActiveResultTab('overview')}
                  className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap flex items-center gap-2 ${activeResultTab === 'overview' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                >
                  <Cpu className="w-4 h-4" /> Overview
                  {activeResultTab === 'overview' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />}
                </button>
                <button
                  onClick={() => setActiveResultTab('news')}
                  className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap flex items-center gap-2 ${activeResultTab === 'news' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                >
                  <Newspaper className="w-4 h-4" /> Related News
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 py-0.5 px-2 rounded-full text-[10px]">{result.newsArticles?.length || 0}</span>
                  {activeResultTab === 'news' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />}
                </button>
                <button
                  onClick={() => setActiveResultTab('factcheck')}
                  className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap flex items-center gap-2 ${activeResultTab === 'factcheck' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                >
                  <CheckCircle2 className="w-4 h-4" /> Fact Checks
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 py-0.5 px-2 rounded-full text-[10px]">{result.factCheckClaims?.length || 0}</span>
                  {activeResultTab === 'factcheck' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />}
                </button>
              </div>

              {/* Scrollable Content Area */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                {activeResultTab === 'overview' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="mb-2 flex items-baseline justify-between gap-3">
                      <span className={cn("text-sm font-semibold", zoneStyle!.text)}>
                        {result.verdict.label}
                      </span>
                      <span className={cn("font-mono text-2xl font-semibold tabular flex items-center", zoneStyle!.text)}>
                        <AnimatedCounter value={result.verdict.score} duration={1500} />%
                      </span>
                    </div>
                    <div className="relative h-2 w-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 opacity-90">
                      <motion.div
                        initial={{ left: "0%" }}
                        animate={{ left: `calc(${result.verdict.score}% - 2px)` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="absolute top-1/2 h-3.5 w-1 -translate-y-1/2 rounded-full bg-slate-900 shadow-[0_0_0_2px_white] dark:bg-white dark:shadow-[0_0_0_2px_theme(colors.slate.950)]"
                        aria-hidden
                      />
                    </div>
                    <div className="mt-1.5 flex justify-between font-mono text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      <span>Authentic</span>
                      <span>Context Mismatch</span>
                      <span>Manipulated</span>
                    </div>

                    {result.summary && (
                      <PremiumCard interactive={true} className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                          {result.summary}
                        </p>
                      </PremiumCard>
                    )}

                    {/* Claims breakdown */}
                    {result.claims && result.claims.length > 0 && (
                      <div className="space-y-3 bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <Info className="w-4 h-4 text-purple-500" /> Claim Breakdown
                        </h4>
                        {result.claims.map((claim, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 flex justify-between gap-3 text-xs">
                            <div>
                              <p className="font-semibold text-slate-700 dark:text-slate-300">{claim.field}</p>
                              <p className="text-slate-600 dark:text-slate-400 mt-0.5"><span className="font-medium">Claimed:</span> {claim.claimed}</p>
                              <p className="text-slate-500 mt-0.5"><span className="font-medium">Extracted:</span> {claim.extracted}</p>
                            </div>
                            <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold h-fit uppercase", claim.status === "match" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                              {claim.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Telemetry info */}
                    <div className="flex gap-4 text-[11px] font-mono text-slate-500 mt-4 border-t border-slate-200 dark:border-slate-800 pt-4">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Latency: {result.telemetry.latency}</span>
                      <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> Model: {result.telemetry.model}</span>
                    </div>
                  </div>
                )}

                {activeResultTab === 'news' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {(!result.newsArticles || result.newsArticles.length === 0) ? (
                      <div className="p-8 text-center bg-white border border-slate-200 rounded-xl text-slate-500 dark:bg-slate-950 dark:border-slate-800 shadow-sm">
                        No recent news articles found for this context.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {result.newsArticles.map((article, idx) => (
                          <PremiumCard key={idx} interactive={true} className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-md">
                                {article.source}
                              </span>
                              <span className="text-xs text-slate-400">
                                {new Date(article.publishedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-start gap-2">
                              {article.title} <ExternalLink className="w-3 h-3 shrink-0 mt-1 opacity-50" />
                            </a>
                            <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{article.snippet}</p>
                          </PremiumCard>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeResultTab === 'factcheck' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {(!result.factCheckClaims || result.factCheckClaims.length === 0) ? (
                      <div className="p-8 text-center bg-white border border-slate-200 rounded-xl text-slate-500 dark:bg-slate-950 dark:border-slate-800 shadow-sm">
                        No existing fact-checks found for this query in the Google Fact Check database.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {result.factCheckClaims.map((fc, idx) => (
                          <PremiumCard key={idx} interactive={true} className="p-4 flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                            <div className="flex-1">
                              <p className="text-[10px] text-slate-400 mb-1 uppercase tracking-wider font-semibold">Claimed by: {fc.claimant}</p>
                              <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 italic border-l-2 border-slate-300 pl-3 py-1">"{fc.claim}"</h4>
                            </div>
                            <div className="sm:w-48 flex flex-col items-start sm:items-end gap-1.5 border-t sm:border-t-0 sm:border-l sm:pl-4 border-slate-100 dark:border-slate-800 pt-3 sm:pt-0">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{fc.publisher}</span>
                              <span className={cn("px-2.5 py-1 rounded-md text-[11px] font-bold inline-flex items-center gap-1", fc.rating.toLowerCase().includes('false') ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300')}>
                                {fc.rating.toLowerCase().includes('false') ? <ShieldAlert className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                                {fc.rating}
                              </span>
                              <a href={fc.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mt-1 sm:mt-auto">
                                View Review <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </PremiumCard>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Raw JSON Debugger */}
                <div className="mt-8 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950 shadow-sm">
                  <details className="group">
                    <summary className="flex items-center justify-between p-3 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                      <div className="flex items-center gap-2">
                        <FileJson className="w-4 h-4 text-slate-400 group-open:text-blue-500" />
                        View Raw API Payload
                      </div>
                      <span className="text-[10px] text-slate-400">Debugging</span>
                    </summary>
                    <div className="p-4 bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                      <pre className="text-[10px] text-emerald-400 overflow-x-auto">
                        {JSON.stringify(result.rawPayload, null, 2)}
                      </pre>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
