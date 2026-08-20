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
  BarChart3,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Activity,
  History,
  Settings,
  Sparkles,
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

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Top Banner: Candidate Overview */}
      <div className="dev-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <MonoEyebrow color="iris">ACTIVE CANDIDATE PROFILE</MonoEyebrow>
            <span className="font-mono text-xs text-zinc-500">• {candidate.experienceYears} Years Exp</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
            Welcome back, {candidate.name}
          </h1>
          <p className="text-sm text-zinc-600 max-w-xl leading-relaxed">
            Target Track: <span className="font-semibold text-zinc-800">{candidate.targetRole}</span>. Your adaptive state is calibrated to probe distributed systems, latency baselines, and execution resilience.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/onboarding"
            className="btn-secondary-action !py-2 !px-3.5 !text-xs"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Recalibrate Role</span>
          </Link>
          <Link
            href="/report"
            className="btn-secondary-action !py-2 !px-3.5 !text-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View Full Report</span>
          </Link>
        </div>
      </div>

      {/* 2 MAIN ASSESSMENT OPTIONS (Requested by User) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-zinc-500 font-bold">
              Available Assessment Chambers
            </span>
          </div>
          <span className="text-xs font-mono text-zinc-500">2 Core Tracks Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Option 1: AI Interview Chamber */}
          <div className="dev-card p-6 flex flex-col justify-between hover:border-zinc-300 hover:shadow-md transition-all group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-iris/10 border border-iris/20 flex items-center justify-center text-iris group-hover:scale-105 transition-transform">
                  <Mic className="w-6 h-6 stroke-[1.8]" />
                </div>
                <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-sprout/10 text-sprout border border-sprout/20 font-bold">
                  VOICE + TEXT LIVE
                </span>
              </div>

              <div>
                <div className="font-mono text-xs text-iris font-bold tracking-wider uppercase mb-1">
                  ROUND 01 • ADAPTIVE DIALOGUE
                </div>
                <h2 className="text-xl font-bold text-zinc-900 mb-2">
                  1. AI Interview (Adaptive Dialogue)
                </h2>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Engage in a live conversational assessment. The engine evaluates your answers in real time, extracts technical claims, and adaptively ramps pressure from L1 to L5 based on uncertainty.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs space-y-1.5 font-mono text-zinc-600">
                <div className="flex items-center justify-between">
                  <span>Probing Engine:</span>
                  <span className="text-zinc-900 font-semibold">LangGraph State v2.4</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Claim Verification:</span>
                  <span className="text-sprout font-semibold">Active Baseline Sentry</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Latency Target:</span>
                  <span className="text-cobalt font-semibold">&lt; 250ms Streaming</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/interview"
                className="btn-primary-action w-full justify-between shadow-sm"
              >
                <span>Start AI Interview</span>
                <ArrowRight className="w-4 h-4 stroke-[2]" />
              </Link>
            </div>
          </div>

          {/* Option 2: AI Coding Round */}
          <div className="dev-card p-6 flex flex-col justify-between hover:border-zinc-300 hover:shadow-md transition-all group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-cobalt/10 border border-cobalt/20 flex items-center justify-center text-cobalt group-hover:scale-105 transition-transform">
                  <Code2 className="w-6 h-6 stroke-[1.8]" />
                </div>
                <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-cobalt/10 text-cobalt border border-cobalt/20 font-bold">
                  REASONING TRAJECTORY
                </span>
              </div>

              <div>
                <div className="font-mono text-xs text-cobalt font-bold tracking-wider uppercase mb-1">
                  ROUND 02 • ALGORITHMS & SYSTEMS
                </div>
                <h2 className="text-xl font-bold text-zinc-900 mb-2">
                  2. AI Coding Round (Trajectory Mode)
                </h2>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Solve real engineering challenges (e.g. LRU Cache with TTL, Sliding Window Rate Limiter). The engine records your full reasoning trajectory and stress-tests your solution with counterexamples.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs space-y-1.5 font-mono text-zinc-600">
                <div className="flex items-center justify-between">
                  <span>Languages:</span>
                  <span className="text-zinc-900 font-semibold">Python • TypeScript • Go</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Trajectory Logging:</span>
                  <span className="text-iris font-semibold">Approach → Complexity → Debug</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Stress Test:</span>
                  <span className="text-coral font-semibold">Edge Case & Clock Skew Probes</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/coding"
                className="btn-primary-action w-full justify-between shadow-sm !bg-zinc-900 hover:!bg-zinc-800"
              >
                <span>Launch AI Coding Round</span>
                <ArrowRight className="w-4 h-4 stroke-[2]" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2-COLUMN SECTION: Live Competency Radar & Evidence Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Competency Vector */}
        <div className="lg:col-span-5 dev-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-iris" />
              <h3 className="font-bold text-sm text-zinc-900">
                Competency State Vector
              </h3>
            </div>
            <span className="font-mono text-xs text-zinc-500">5-Axis Model</span>
          </div>

          <CompetencyRadar competencies={candidate.competencies} size={250} />

          <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 space-y-1">
            <div className="font-mono text-[10px] uppercase text-zinc-400 font-bold">
              State Mutation Note:
            </div>
            <p className="text-[11px] leading-snug">
              Every turn in AI Interview or Coding Round updates these vectors using Bayesian evidence accumulation.
            </p>
          </div>
        </div>

        {/* Right: Recent Insights & Evidence Summary */}
        <div className="lg:col-span-7 space-y-6">
          {/* Recent Session Summary */}
          <div className="dev-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-cobalt" />
                <h3 className="font-bold text-sm text-zinc-900">
                  Latest Assessment Audit
                </h3>
              </div>
              <span className="font-mono text-xs text-sprout font-semibold">
                Score: {Math.round((latestSession.overall_score || 0.76) * 100)}%
              </span>
            </div>

            {/* Identified Strengths & Areas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-sprout/5 border border-sprout/20 space-y-2">
                <div className="flex items-center gap-1.5 text-sprout font-mono font-bold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  CONFIRMED STRENGTHS
                </div>
                <ul className="space-y-1.5 text-zinc-700 text-[11px]">
                  {latestSession.identified_strengths.slice(0, 2).map((s, i) => (
                    <li key={i} className="leading-snug">• {s}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-coral/5 border border-coral/20 space-y-2">
                <div className="flex items-center gap-1.5 text-coral font-mono font-bold text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  AREAS FOR PROBING
                </div>
                <ul className="space-y-1.5 text-zinc-700 text-[11px]">
                  {latestSession.areas_for_improvement.slice(0, 2).map((a, i) => (
                    <li key={i} className="leading-snug">• {a}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actionable Engineering Tip */}
            {latestSession.actionable_tips && latestSession.actionable_tips.length > 0 && (
              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-xs">
                <span className="font-mono text-[10px] uppercase text-iris font-bold block mb-1">
                  Key Actionable Tip:
                </span>
                <p className="text-zinc-700 leading-relaxed">
                  {latestSession.actionable_tips[0]}
                </p>
              </div>
            )}
          </div>

          {/* Parsed Resume Claims Checklist */}
          <div className="dev-card p-6 space-y-3">
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
              {candidate.keyClaims?.map((claim, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs flex items-start gap-2 text-zinc-700"
                >
                  <span className="font-mono text-zinc-400 text-[10px] mt-0.5">#{idx + 1}</span>
                  <span className="leading-snug">&ldquo;{claim}&rdquo;</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
