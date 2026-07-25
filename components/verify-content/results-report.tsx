'use client';

import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Search, Image as ImageIcon, ExternalLink, Info, Newspaper, CheckCircle2, FileJson, AudioLines, Globe } from 'lucide-react';
import { isAudio } from '@/lib/media';

interface Claim {
  field: string;
  extracted: string;
  claimed: string;
  status: string;
}

interface ForensicAnalysis {
  verdict: string;
  confidenceScore: number;
  summary: string;
  deepfakeProbability: number;
  latencyMs: number;
  model: string;
  mediaDescription: string;
  claims: Claim[];
}

interface NewsArticle {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  snippet: string;
}

interface FactCheckClaim {
  claim: string;
  claimant: string;
  rating: string;
  publisher: string;
  url: string;
}

interface ResultsReportProps {
  imageFile?: File | null;
  url?: string | null;
  context?: string;
  payload?: {
    forensicAnalysis?: ForensicAnalysis;
    newsArticles?: NewsArticle[];
    factCheckClaims?: FactCheckClaim[];
  };
}

export function ResultsReport({ imageFile, url, context, payload }: ResultsReportProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'news' | 'factcheck'>('overview');
  const mediaUrl = imageFile ? URL.createObjectURL(imageFile) : null;
  const isAudioFile = imageFile ? isAudio(imageFile.type, imageFile.name) : false;

  if (!payload || !payload.forensicAnalysis) {
    return <div className="text-center text-slate-500 py-12">No verification data available.</div>;
  }

  const { forensicAnalysis, newsArticles = [], factCheckClaims = [] } = payload;
  const isLikelyFake = forensicAnalysis.verdict !== 'AUTHENTIC' && forensicAnalysis.verdict !== 'VERIFIED';
  const confidenceScore = forensicAnalysis.confidenceScore || 0;

  return (
    <div className="w-full max-w-5xl mx-auto my-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Investigation Report</h2>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full border border-slate-200">
          <span className="text-sm font-medium text-slate-600">Verification ID:</span>
          <span className="text-sm font-mono text-slate-500">GV-{Math.floor(Math.random() * 10000)}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'overview' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <div className="flex items-center gap-2"><Search className="w-4 h-4" /> Overview</div>
          {activeTab === 'overview' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab('news')}
          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'news' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <div className="flex items-center gap-2"><Newspaper className="w-4 h-4" /> Related News ({newsArticles.length})</div>
          {activeTab === 'news' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab('factcheck')}
          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'factcheck' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Fact Checks ({factCheckClaims.length})</div>
          {activeTab === 'factcheck' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />}
        </button>
      </div>

      {/* Tab Content */}
      <div className="py-4">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Main Verdict Card */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className={`p-6 border-b ${isLikelyFake ? 'bg-amber-50/50 border-amber-100' : 'bg-emerald-50/50 border-emerald-100'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${isLikelyFake ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {isLikelyFake ? <ShieldAlert className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold ${isLikelyFake ? 'text-amber-900' : 'text-emerald-900'}`}>
                        {isLikelyFake ? 'Likely Manipulated or Miscontextualized' : 'Verified Authentic Context'}
                      </h3>
                      <p className={`mt-1 text-sm ${isLikelyFake ? 'text-amber-700' : 'text-emerald-700'}`}>
                        Confidence Score: {confidenceScore}% | Deepfake Probability: {forensicAnalysis.deepfakeProbability}%
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-white">
                  <p className="text-slate-700 leading-relaxed">{forensicAnalysis.summary}</p>
                </div>
              </div>

              {/* Context Verification */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-purple-500" />
                  Claim Breakdown
                </h4>
                <div className="space-y-4">
                  {forensicAnalysis.claims?.map((claim, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex gap-4">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{claim.field}</p>
                        <p className="text-sm text-slate-800 mb-2">Claimed: <span className="font-medium">{claim.claimed}</span></p>
                        <p className="text-sm text-slate-600">Extracted: {claim.extracted}</p>
                      </div>
                      <div className="flex items-center justify-center">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${claim.status === 'match' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {claim.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {(!forensicAnalysis.claims || forensicAnalysis.claims.length === 0) && (
                    <p className="text-sm text-slate-500">No claims extracted.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Media Thumbnail */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  {isAudioFile ? (
                    <AudioLines className="w-4 h-4 text-blue-500" />
                  ) : url ? (
                    <Globe className="w-4 h-4 text-blue-500" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-slate-500" />
                  )}
                  {isAudioFile ? 'Analyzed Audio' : url ? 'Analyzed Webpage' : 'Analyzed Image'}
                </h4>
                <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative flex items-center justify-center p-3">
                  {isAudioFile && mediaUrl ? (
                    <div className="flex flex-col items-center gap-3 w-full">
                      <AudioLines className="w-12 h-12 text-blue-500 animate-pulse" />
                      <audio controls src={mediaUrl} className="w-full" />
                    </div>
                  ) : url ? (
                    <div className="text-center p-4">
                      <Globe className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline break-all font-mono">
                        {url}
                      </a>
                    </div>
                  ) : mediaUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={mediaUrl} alt="Analyzed content" className="w-full h-full object-cover rounded-md" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">No Preview</div>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-2 truncate text-center">
                  {forensicAnalysis.mediaDescription}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'news' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Related Global News (GDELT & NewsAPI)</h3>
            {newsArticles.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl text-slate-500">
                No recent news articles found for this context.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {newsArticles.map((article, idx) => (
                  <div key={idx} className="p-5 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {article.source}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-slate-800 hover:text-blue-600 transition-colors flex items-center gap-2">
                      {article.title} <ExternalLink className="w-4 h-4 opacity-50 shrink-0" />
                    </a>
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">{article.snippet}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'factcheck' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Google Fact Check Database</h3>
            {factCheckClaims.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl text-slate-500">
                No existing fact-checks found for this query in the Google database.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {factCheckClaims.map((fc, idx) => (
                  <div key={idx} className="p-5 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-slate-500 mb-1">Claimed by: <span className="font-medium text-slate-700">{fc.claimant}</span></p>
                      <h4 className="text-base font-bold text-slate-800 italic">"{fc.claim}"</h4>
                    </div>
                    <div className="sm:w-48 flex flex-col items-end gap-2 border-l sm:pl-4 border-slate-200 pt-4 sm:pt-0">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 text-right">{fc.publisher}</span>
                      <span className={`px-3 py-1 rounded text-sm font-bold ${fc.rating.toLowerCase().includes('false') ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
                        {fc.rating}
                      </span>
                      <a href={fc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-auto">
                        View Review <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Raw JSON Accordion */}
      <div className="mt-12 border border-slate-200 rounded-xl overflow-hidden bg-white">
        <details className="group">
          <summary className="flex items-center gap-2 p-4 cursor-pointer font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <FileJson className="w-5 h-5 text-slate-400 group-open:text-blue-500" />
            View Raw API Payload
          </summary>
          <div className="p-4 bg-slate-900 border-t border-slate-200">
            <pre className="text-xs text-emerald-400 overflow-x-auto p-2">
              {JSON.stringify(payload, null, 2)}
            </pre>
          </div>
        </details>
      </div>
    </div>
  );
}
