"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, ArrowRight, Calendar, Activity } from "lucide-react";

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
      <div className="dev-card p-6 sm:p-8 space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
          Diagnostic Reports Directory
        </h1>
        <p className="text-sm text-zinc-600 max-w-xl leading-relaxed">
          Select a completed interview session below to generate a highly detailed, 4-page diagnostic blueprint report using Gemini 3.7 Flash.
        </p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-sm text-zinc-500 font-mono flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
            Loading reports...
          </div>
        ) : reports.length === 0 ? (
          <div className="p-10 text-center border border-dashed border-zinc-300 rounded-xl text-zinc-500 text-sm">
            No interview reports found. Complete an interview first.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {reports.map((report) => (
              <Link
                key={report.id}
                href={`/report/${report.id}`}
                className="dev-card p-5 flex items-center justify-between hover:border-iris/40 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-iris/10 border border-iris/20 flex items-center justify-center text-iris">
                    <FileText className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 font-mono">
                      Session ID: {report.id}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
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
                
                <div className="flex items-center gap-2 text-iris font-semibold text-xs bg-iris/5 px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
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
