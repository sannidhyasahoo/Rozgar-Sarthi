"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAppAuth } from "@/components/auth/AuthProvider";
import { MonoEyebrow } from "@/components/shared/MonoEyebrow";
import { CompetencyRadar } from "@/components/interview/CompetencyRadar";
import { getStoredProfile, getStoredSessions } from "@/lib/storage";
import { CandidateProfile, SessionInsights } from "@/lib/types";
import { INITIAL_SAMPLE_SESSION } from "@/lib/mock-data";
import {
  Mic,
  Code2,
  ArrowRight,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Activity,
  History,
  Sliders,
  Clock,
  ExternalLink,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

export default function DashboardPage() {
  const { profile } = useAppAuth();
  const [candidate, setCandidate] = useState<CandidateProfile>(profile);
  const [recentSessions, setRecentSessions] = useState<SessionInsights[]>([]);

  useEffect(() => {
    const loadedProfile = getStoredProfile();
    setCandidate(loadedProfile);
    const loadedSessions = getStoredSessions();
    if (loadedSessions.length === 0) {
      setRecentSessions([INITIAL_SAMPLE_SESSION]);
    } else {
      setRecentSessions(loadedSessions);
    }
  }, [profile]);

  const latestSession = recentSessions[0] || INITIAL_SAMPLE_SESSION;
  const readinessScore = Math.round((latestSession.overall_score || 0.78) * 100);

  const competencyList = [
    { label: "Technical Depth", key: "technical_depth", val: candidate.competencies.technical_depth ?? 0.8 },
    { label: "System Design", key: "system_design", val: candidate.competencies.system_design ?? 0.75 },
    { label: "Problem Solving", key: "problem_solving", val: candidate.competencies.problem_solving ?? 0.85 },
    { label: "Communication", key: "communication_clarity", val: candidate.competencies.communication_clarity ?? 0.7 },
    { label: "Ownership", key: "ownership_specificity", val: candidate.competencies.ownership_specificity ?? 0.8 },
  ];

  return (
    <div className="space-y-8">
      {/* ── Top Header Strip ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-[#1f1c2b]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MonoEyebrow color="iris">CANDIDATE INTELLIGENCE</MonoEyebrow>
            <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-600">•</span>
            <span className="font-mono text-[11px] text-zinc-500 dark:text-[#9e98b7]">
              {candidate.experienceYears}y Calibrated
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Welcome back, {candidate.name}
          </h1>
          <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-[#9e98b7]">
            <span>
              Target: <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">{candidate.targetRole}</strong>
            </span>
            <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <span className="inline-flex items-center gap-1.5 font-mono text-zinc-600 dark:text-[#9e98b7]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1bb152]" />
              Adaptive Graph Active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/onboarding"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono font-medium text-zinc-700 dark:text-zinc-200 bg-white dark:bg-[#12111a] hover:bg-zinc-50 dark:hover:bg-[#181622] border border-zinc-200 dark:border-[#1f1c2b] transition-colors shadow-sm"
          >
            <UserCheck className="w-3.5 h-3.5 stroke-[1.8] text-iris" />
            <span>Edit Profile & Role</span>
          </Link>
          <Link
            href="/report"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono font-medium text-white bg-[#6a5ed9] hover:bg-[#7b6fe0] transition-colors shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 stroke-[1.8]" />
            <span>Diagnostic Audit</span>
          </Link>
        </div>
      </div>

      {/* ── High-Signal Telemetry Strip (4 Metrics) ─────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Readiness */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-mono">
            <span>READINESS INDEX</span>
            <Activity className="w-4 h-4 text-[#6a5ed9]" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-900">
            {readinessScore}%
          </div>
          <p className="text-[11px] text-zinc-500 font-mono">
            5-axis Bayesian baseline
          </p>
        </div>

        {/* Metric 2: Active Chambers */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-mono">
            <span>ASSESSMENT TRACKS</span>
            <ShieldCheck className="w-4 h-4 text-[#1bb152]" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-900">
            2 Active
          </div>
          <p className="text-[11px] text-zinc-500 font-mono">
            Dialogue & Coding IDE
          </p>
        </div>

        {/* Metric 3: Claims Audited */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-mono">
            <span>CLAIMS TRACKED</span>
            <FileText className="w-4 h-4 text-[#3f71d4]" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-900">
            {candidate.keyClaims?.length || 4}
          </div>
          <p className="text-[11px] text-zinc-500 font-mono">
            Cross-answer sentry active
          </p>
        </div>

        {/* Metric 4: Streaming Latency */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-mono">
            <span>STREAMING LATENCY</span>
            <Clock className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-900">
            &lt; 220ms
          </div>
          <p className="text-[11px] text-zinc-500 font-mono">
            FastAPI + LangGraph loop
          </p>
        </div>
      </div>

      {/* ── Candidate Profile & Role (Above Assessment Chambers) ───────────── */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-iris/10 text-iris flex items-center justify-center">
              <UserCheck className="w-4 h-4 stroke-[1.8]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900">
                Candidate Profile & Role
              </h3>
              <p className="text-xs text-zinc-500">
                Your personal details, target track, and resume used for live question generation
              </p>
            </div>
          </div>

          <Link
            href="/onboarding"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-iris bg-iris/10 hover:bg-iris/15 border border-iris/20 transition-colors w-fit cursor-pointer"
          >
            <span>Edit Profile & Resume</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80">
            <span className="block font-mono text-[10px] uppercase font-bold text-zinc-400 mb-1">
              Target Track
            </span>
            <span className="font-semibold text-sm text-zinc-900 block">
              {candidate.targetRole}
            </span>
            <span className="text-[11px] font-mono text-zinc-500 mt-0.5 block">
              Calibrated for {candidate.experienceYears} years experience
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80">
            <span className="block font-mono text-[10px] uppercase font-bold text-zinc-400 mb-1">
              Attached Resume
            </span>
            <div className="flex items-center gap-1.5 text-zinc-800 font-medium text-xs truncate">
              <FileText className="w-3.5 h-3.5 text-cobalt shrink-0" />
              <span className="truncate">{candidate.resumeName || "alex_senior_backend_resume.pdf"}</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600 mt-1">
              <CheckCircle2 className="w-3 h-3" />
              Claims Extracted & Active
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80">
            <span className="block font-mono text-[10px] uppercase font-bold text-zinc-400 mb-1">
              Verified Technical Stack
            </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {(candidate.skills || ["Go", "Python", "PostgreSQL", "Redis", "Kafka"]).slice(0, 5).map((skill, i) => (
                <span key={i} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-zinc-700 border border-zinc-200">
                  {skill}
                </span>
              ))}
              {(candidate.skills?.length || 0) > 5 && (
                <span className="text-[10px] font-mono px-1 py-0.5 text-zinc-400">
                  +{candidate.skills.length - 5} more
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 2 Primary Assessment Chambers ────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-mono text-xs uppercase tracking-wider text-zinc-500 font-bold">
            Available Assessment Chambers
          </div>
          <span className="text-xs font-mono text-zinc-400">
            Select Track to Begin
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chamber 1: AI Conversational Round */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col justify-between hover:border-zinc-300 hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-[#6a5ed9]/10 text-[#6a5ed9] flex items-center justify-center">
                  <Mic className="w-5 h-5 stroke-[1.8]" />
                </div>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wide">
                  Live Voice + Text
                </span>
              </div>

              <div>
                <div className="font-mono text-[11px] text-[#6a5ed9] font-bold uppercase tracking-wider mb-1">
                  ROUND 01 • REAL-TIME DIALOGUE
                </div>
                <h2 className="text-lg font-bold text-zinc-900 mb-1.5">
                  Adaptive AI Interview
                </h2>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Engage in a live conversational assessment. The engine evaluates your answers in real time, extracts technical claims, and adaptively ramps pressure from L1 to L5 based on uncertainty.
                </p>
              </div>

              {/* Technical chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="font-mono text-[10px] px-2 py-1 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                  LangGraph Core v2.4
                </span>
                <span className="font-mono text-[10px] px-2 py-1 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                  Claim Sentry Probes
                </span>
                <span className="font-mono text-[10px] px-2 py-1 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                  Streaming Dialogue
                </span>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/interview"
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#6a5ed9] hover:bg-[#7b6fe0] transition-colors shadow-sm"
              >
                <span>Start AI Interview</span>
                <ArrowRight className="w-4 h-4 stroke-[2]" />
              </Link>
            </div>
          </div>

          {/* Chamber 2: AI Coding Round */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col justify-between hover:border-zinc-300 hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-[#3f71d4]/10 text-[#3f71d4] flex items-center justify-center">
                  <Code2 className="w-5 h-5 stroke-[1.8]" />
                </div>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
                  Online IDE Environment
                </span>
              </div>

              <div>
                <div className="font-mono text-[11px] text-[#3f71d4] font-bold uppercase tracking-wider mb-1">
                  ROUND 02 • ALGORITHMS & SYSTEMS
                </div>
                <h2 className="text-lg font-bold text-zinc-900 mb-1.5">
                  Adaptive Coding Round
                </h2>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Solve real engineering challenges (e.g. LRU Cache, Rate Limiter). Execute code securely against hidden test suites with automated Tree-sitter AST complexity detection.
                </p>
              </div>

              {/* Technical chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="font-mono text-[10px] px-2 py-1 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                  Python • JavaScript • C++
                </span>
                <span className="font-mono text-[10px] px-2 py-1 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                  Tree-sitter AST Static Analysis
                </span>
                <span className="font-mono text-[10px] px-2 py-1 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                  Sub-millisecond Execution
                </span>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/coding"
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#3f71d4] hover:bg-[#4f80e1] transition-colors shadow-sm cursor-pointer"
              >
                <span>Launch Coding IDE</span>
                <ArrowRight className="w-4 h-4 stroke-[2]" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Analytical Vector & Evidence Audit (2 Columns) ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Competency Radar Vector */}
        <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#6a5ed9]" />
              <h3 className="font-bold text-sm text-zinc-900">
                Competency Vector
              </h3>
            </div>
            <span className="font-mono text-[11px] text-zinc-500">5-Axis Model</span>
          </div>

          <div className="flex justify-center py-2">
            <CompetencyRadar competencies={candidate.competencies} size={240} />
          </div>

          {/* 5-axis progress breakdown */}
          <div className="space-y-2 pt-1 border-t border-zinc-100">
            {competencyList.map((item) => {
              const pct = Math.round(item.val * 100);
              return (
                <div key={item.key} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-zinc-600">{item.label}</span>
                    <span className="text-zinc-900 font-semibold">{pct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#6a5ed9] rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-zinc-500 leading-snug font-mono pt-1">
            Bayesian evidence accumulation runs continuously during both interview & coding rounds.
          </p>
        </div>

        {/* Right: Latest Session Audit & Resume Claims */}
        <div className="lg:col-span-7 space-y-6">
          {/* Latest Session Audit */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#3f71d4]" />
                <h3 className="font-bold text-sm text-zinc-900">
                  Latest Assessment Audit
                </h3>
              </div>
              <span className="font-mono text-xs text-[#1bb152] font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Score: {readinessScore}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-700 font-mono font-bold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>CONFIRMED STRENGTHS</span>
                </div>
                <ul className="space-y-1 text-zinc-700 text-[11px]">
                  {latestSession.identified_strengths.slice(0, 2).map((s, i) => (
                    <li key={i} className="leading-snug">• {s}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-700 font-mono font-bold text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>AREAS FOR PROBING</span>
                </div>
                <ul className="space-y-1 text-zinc-700 text-[11px]">
                  {latestSession.areas_for_improvement.slice(0, 2).map((a, i) => (
                    <li key={i} className="leading-snug">• {a}</li>
                  ))}
                </ul>
              </div>
            </div>

            {latestSession.actionable_tips && latestSession.actionable_tips.length > 0 && (
              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-xs">
                <span className="font-mono text-[10px] uppercase text-[#6a5ed9] font-bold block mb-1">
                  Actionable Engineering Tip:
                </span>
                <p className="text-zinc-700 leading-relaxed text-[11px]">
                  {latestSession.actionable_tips[0]}
                </p>
              </div>
            )}
          </div>

          {/* Extracted Resume Claims */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-zinc-600" />
                <h3 className="font-bold text-sm text-zinc-900">
                  Extracted Resume Claims (Under Audit)
                </h3>
              </div>
              <span className="font-mono text-xs text-zinc-500">
                {candidate.keyClaims?.length || 0} Tracked
              </span>
            </div>

            <div className="space-y-2">
              {candidate.keyClaims && candidate.keyClaims.length > 0 ? (
                candidate.keyClaims.map((claim, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs flex items-start gap-2.5 text-zinc-700"
                  >
                    <span className="font-mono text-zinc-400 text-[10px] mt-0.5 shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="leading-snug flex-1 font-mono text-[11px]">
                      &ldquo;{claim}&rdquo;
                    </span>
                    <span className="shrink-0 text-[9px] font-mono px-1.5 py-0.5 rounded bg-white text-zinc-600 border border-zinc-200 font-medium">
                      Audited
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-zinc-500 font-mono py-2">
                  No claims extracted yet. Calibrate role to populate.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
