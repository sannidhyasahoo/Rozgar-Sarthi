"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, ArrowRight, ArrowLeft, Calendar, Activity } from "lucide-react";

export default function ReportsDirectoryPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/reports/list")
      .then((res) => res.json())
      .then((data) => {
        setReports(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch reports:", err);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-white dark:bg-[#12111a] hover:bg-zinc-100 dark:hover:bg-[#181622] border border-zinc-200 dark:border-[#1f1c2b] shadow-2xs transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-zinc-500 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="p-6 sm:p-8 space-y-2 bg-white dark:bg-[#12111a] border border-zinc-200 dark:border-[#1f1c2b] rounded-2xl shadow-2xs">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Diagnostic Reports Directory
        </h1>
        <p className="text-sm text-zinc-600 dark:text-[#9e98b7] max-w-xl leading-relaxed">
          Select a completed interview session below to generate a highly detailed, 4-page diagnostic blueprint report using Gemini 3.7 Flash.
        </p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-sm text-zinc-500 dark:text-zinc-400 font-mono flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-zinc-300 dark:border-zinc-700 border-t-zinc-600 dark:border-t-indigo-400 rounded-full animate-spin" />
            Loading reports...
          </div>
        ) : reports.length === 0 ? (
          <div className="p-10 text-center border border-dashed border-zinc-300 dark:border-[#1f1c2b] rounded-xl text-zinc-500 dark:text-[#9e98b7] text-sm bg-zinc-50/50 dark:bg-[#0e0d14]">
            No interview reports found. Complete an interview first.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {reports.map((report) => (
              <Link
                key={report.id}
                href={`/report/${report.id}`}
                className="p-5 flex items-center justify-between bg-white dark:bg-[#12111a] border border-zinc-200 dark:border-[#1f1c2b] rounded-xl hover:border-iris/50 dark:hover:border-indigo-500/50 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-iris/10 border border-iris/20 flex items-center justify-center text-iris">
                    <FileText className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                      Session ID: {report.id}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-[#9e98b7] mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(report.timestamp * 1000).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Activity className="w-3 h-3" />
                        Score: {Math.round(report.score * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-iris dark:text-indigo-400 font-semibold text-xs bg-iris/5 dark:bg-iris/10 px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Generate Blueprint</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
