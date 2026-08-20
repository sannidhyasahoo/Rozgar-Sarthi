"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAppAuth } from "@/components/auth/AuthProvider";
import { MonoEyebrow } from "@/components/shared/MonoEyebrow";
import { CompetencyRadar } from "@/components/interview/CompetencyRadar";
import { EvidenceGraph } from "@/components/interview/EvidenceGraph";
import { getStoredProfile, getStoredSessions } from "@/lib/storage";
import { INITIAL_SAMPLE_SESSION } from "@/lib/mock-data";
import { SessionInsights } from "@/lib/types";
import {
  FileCheck,
  Download,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Activity,
  ArrowRight,
  Code2,
  Mic,
  FileCode,
} from "lucide-react";

export default function DiagnosticReportPage() {
  const { profile } = useAppAuth();
  const [session, setSession] = useState<SessionInsights>(INITIAL_SAMPLE_SESSION);
  const [showJsonModal, setShowJsonModal] = useState(false);

  useEffect(() => {
    const sessions = getStoredSessions();
    if (sessions && sessions.length > 0) {
      setSession(sessions[0]);
    } else {
      setSession(INITIAL_SAMPLE_SESSION);
    }
  }, []);

  const overallScorePercent = Math.round((session.overall_score || 0.76) * 100);

  const downloadJsonReport = () => {
    const blob = new Blob([JSON.stringify(session, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${session.session_id}_insights.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Top Banner */}
      <div className="dev-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <MonoEyebrow color="sprout">AUDIT REPORT & EVIDENCE SUMMARY</MonoEyebrow>
            <span className="font-mono text-xs text-zinc-500">ID: {session.session_id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
            Candidate Diagnostic Assessment
          </h1>
          <p className="text-sm text-zinc-600 max-w-xl leading-relaxed">
            Candidate: <span className="font-semibold text-zinc-800">{session.candidate_name || profile.name}</span> • Track: <span className="font-semibold text-zinc-800">{session.target_role || profile.targetRole}</span> • Generated: {new Date(session.last_updated).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowJsonModal(!showJsonModal)}
            className="btn-secondary-action !py-2 !px-3.5 !text-xs"
          >
            <FileCode className="w-4 h-4" />
            <span>{showJsonModal ? "Hide Raw JSON" : "Inspect JSON"}</span>
          </button>
          <button
            onClick={downloadJsonReport}
            className="btn-primary-action !py-2 !px-4 !text-xs shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export Report (.json)</span>
          </button>
        </div>
      </div>

      {/* Raw JSON Modal / Dropdown Inspector */}
      {showJsonModal && (
        <div className="rounded-xl bg-zinc-950 p-4 border border-zinc-800 text-emerald-300 font-mono text-xs overflow-x-auto shadow-xl">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-zinc-400">
            <span>FastAPI backend compatible format (default-session_insights.json)</span>
            <button
              onClick={downloadJsonReport}
              className="text-iris hover:underline font-sans"
            >
              Download
            </button>
          </div>
          <pre>{JSON.stringify(session, null, 2)}</pre>
        </div>
      )}

      {/* Main 2-Column Assessment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Overall Score & Competency Radar (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Overall Score Card */}
          <div className="dev-card p-6 text-center space-y-3">
            <span className="font-mono text-xs uppercase tracking-wider text-zinc-500 font-bold">
              Cumulative Assessment Rating
            </span>
            <div className="text-5xl font-bold text-zinc-900 tracking-tight">
              {overallScorePercent}%
            </div>
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs font-semibold bg-sprout/10 text-sprout border border-sprout/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                STRONG CANDIDATE BENCHMARK
              </span>
            </div>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
              Based on claim substantiation rate, failure mode isolation, and reasoning trajectory.
            </p>
          </div>

          {/* Competency Radar Visualizer */}
          <div className="dev-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <span className="font-mono text-xs uppercase tracking-wider text-zinc-500 font-bold">
                5-Axis Competency Profile
              </span>
              <span className="font-mono text-xs text-iris font-semibold">
                AUDITED
              </span>
            </div>
            <CompetencyRadar competencies={session.competencies} size={250} />
          </div>

          {/* Next Steps CTA Box */}
          <div className="dev-card p-6 space-y-4 bg-zinc-100/70">
            <h3 className="font-bold text-sm text-zinc-900">
              Continue Practicing
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Targeted practice rounds focus specifically on your areas with unsubstantiated baselines.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/interview"
                className="btn-primary-action !py-2 !px-3 !text-xs justify-center"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Retake AI Interview</span>
              </Link>
              <Link
                href="/coding"
                className="btn-secondary-action !py-2 !px-3 !text-xs justify-center"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Coding Round</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Evidence Log, Strengths, Areas & Tips (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Strengths and Improvement Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="dev-card p-5 space-y-2 border-sprout/30 bg-sprout/5">
              <div className="flex items-center gap-2 text-sprout font-mono font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>IDENTIFIED STRENGTHS</span>
              </div>
              <ul className="space-y-1.5 text-xs text-zinc-800">
                {session.identified_strengths?.map((s, i) => (
                  <li key={i} className="leading-snug flex items-start gap-1.5">
                    <span className="text-sprout font-bold mt-0.5">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="dev-card p-5 space-y-2 border-coral/30 bg-coral/5">
              <div className="flex items-center gap-2 text-coral font-mono font-bold text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>AREAS FOR PROBING</span>
              </div>
              <ul className="space-y-1.5 text-xs text-zinc-800">
                {session.areas_for_improvement?.map((a, i) => (
                  <li key={i} className="leading-snug flex items-start gap-1.5">
                    <span className="text-coral font-bold mt-0.5">•</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actionable Coaching Tips */}
          <div className="dev-card p-6 space-y-3">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
              <Zap className="w-4 h-4 text-iris" />
              <h3 className="font-bold text-sm text-zinc-900">
                Actionable Engineering Guidance
              </h3>
            </div>

            <div className="space-y-2.5">
              {session.actionable_tips?.map((tip, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 leading-relaxed flex items-start gap-2.5"
                >
                  <span className="font-mono text-iris font-bold text-xs mt-0.5">
                    0{idx + 1}.
                  </span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Turn-by-Turn Evidence Graph & Claim Dissection */}
          <div className="dev-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-bold text-sm text-zinc-900">
                Turn-by-Turn Evidence & Claim Audit Log
              </h3>
              <span className="font-mono text-xs text-zinc-500">
                {session.evidence_log?.length || 0} Nodes
              </span>
            </div>

            <EvidenceGraph evidenceList={session.evidence_log || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
