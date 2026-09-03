"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Loader2, FileText, Sparkles } from "lucide-react";

export default function DetailedBlueprintReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [reportMarkdown, setReportMarkdown] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Generate the report on the fly using Gemini 3.7 Flash
    fetch(`http://localhost:8000/api/reports/${id}/generate`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to generate report");
        return res.json();
      })
      .then((data) => {
        setReportMarkdown(data.markdown);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("An error occurred while generating the blueprint report.");
        setIsLoading(false);
      });
  }, [id]);

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/report" className="flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </Link>
        <div className="flex items-center gap-2 font-mono text-xs text-iris font-bold bg-iris/10 px-3 py-1.5 rounded-full border border-iris/20">
          <Sparkles className="w-3.5 h-3.5" />
          Gemini 3.7 Flash
        </div>
      </div>

      {isLoading ? (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-10 space-y-6 bg-white border border-zinc-200 rounded-xl shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-zinc-50 flex items-center justify-center border border-zinc-100 shadow-inner relative">
            <Loader2 className="w-8 h-8 text-iris animate-spin" />
            <Sparkles className="w-4 h-4 text-cobalt absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div className="text-center space-y-2 max-w-md">
            <h2 className="text-xl font-bold text-zinc-900">Synthesizing Blueprint...</h2>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Gemini 3.7 Flash is analyzing the raw interview evidence graph, extracting technical claims, and formatting your 4-page diagnostic report. This takes about 5-10 seconds.
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="p-10 text-center border border-coral/30 bg-coral/5 rounded-xl text-coral font-semibold">
          {error}
        </div>
      ) : (
        <div className="dev-card p-8 sm:p-12 prose prose-zinc max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-a:text-iris prose-li:marker:text-zinc-400 prose-hr:border-zinc-200 prose-pre:bg-zinc-950 prose-pre:text-emerald-300">
          <ReactMarkdown>{reportMarkdown || ""}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
