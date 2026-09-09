"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAppAuth } from "@/components/auth/AuthProvider";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  GitBranch,
  Terminal,
  Layers,
  Cpu,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Flame,
  Code2,
  FileText,
  Volume2,
  Sparkles,
  Award,
  ChevronRight,
  TrendingUp,
  Search,
  Compass,
  ShieldAlert,
} from "lucide-react";
import { MonoEyebrow } from "@/components/shared/MonoEyebrow";
import { MacWindowFrame } from "@/components/shared/MacWindowFrame";
import { CompetencyRadar } from "@/components/interview/CompetencyRadar";
import { PressureDial } from "@/components/interview/PressureDial";
import { CompetencyVector, PressureLevel } from "@/lib/types";

export default function HomePage() {
  const { isSignedIn } = useAppAuth();

  // Interactive Live Probe Sandbox State
  const [probeInput, setProbeInput] = useState(
    "I decreased API latency in our backend service by 40%."
  );
  const [sandboxPressure, setSandboxPressure] = useState<PressureLevel>(3);
  const [sandboxSignal, setSandboxSignal] = useState<"unsubstantiated" | "substantiated">("unsubstantiated");

  const handleTestClaim = (claim: string) => {
    setProbeInput(claim);
    if (claim.includes("Prometheus") || claim.includes("200ms to 45ms") || claim.includes("composite index")) {
      setSandboxSignal("substantiated");
      setSandboxPressure(2);
    } else if (claim.includes("single-handedly") || claim.includes("re-architected")) {
      setSandboxSignal("unsubstantiated");
      setSandboxPressure(5);
    } else {
      setSandboxSignal("unsubstantiated");
      setSandboxPressure(4);
    }
  };

  const previewCompetencies: CompetencyVector = {
    technical_depth: 0.82,
    system_design: 0.76,
    problem_solving: 0.88,
    communication_clarity: 0.74,
    ownership_specificity: 0.70,
  };

  const primaryCta = isSignedIn ? "/dashboard" : "/sign-in";

  return (
    <div className="flex flex-col bg-[#fafafa] dark:bg-[#0c0a17] text-zinc-900 dark:text-zinc-100 relative overflow-hidden transition-colors duration-200">
      {/* Subtle modern ambient background glow */}
      <div className="absolute top-0 inset-x-0 h-[640px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(106,94,217,0.12),rgba(255,255,255,0))] pointer-events-none" />

      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION (interview.co structure + sexy visual polish)
      ───────────────────────────────────────────────────────────── */}
      <section className="pt-16 sm:pt-24 pb-16 px-4 sm:px-6 max-w-[1200px] mx-auto text-center relative z-10 w-full">
        {/* Pill Eyebrow */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-zinc-200/90 shadow-sm text-xs font-semibold text-zinc-800 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-iris animate-pulse" />
            <span className="tracking-wide">ADAPTIVE INTERVIEW INTELLIGENCE</span>
          </div>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight text-zinc-900 leading-[1.12] max-w-4xl mx-auto mb-6">
          Mock Interviews to Mastery.{" "}
          <span className="text-zinc-900 block sm:inline">
            Interviews That Probe What You{" "}
            <span className="relative inline-block text-iris">
              Actually Know
              <svg
                className="absolute -bottom-1.5 left-0 w-full h-3 text-iris/30"
                viewBox="0 0 200 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 5.5C40 2 120 2 199 5.5"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            .
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-lg sm:text-xl text-zinc-600 max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
          Most AI platforms just grade answers. Rozgar Sarthi maintains a live competency state, extracts technical claims, and adaptively pressure-tests what it still needs to learn.
        </p>

        {/* Pill CTA Actions (interview.co pattern) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <Link
            href={primaryCta}
            className="rounded-full bg-iris hover:bg-iris/90 text-white px-8 py-3.5 text-base font-semibold shadow-lg shadow-iris/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2.5 group w-full sm:w-auto cursor-pointer"
          >
            <span>{isSignedIn ? "Go to Dashboard" : "Get Started"}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <a
            href="#how-it-works"
            className="rounded-full bg-white dark:bg-[#12111a] border border-zinc-300 dark:border-[#1f1c2b] hover:border-zinc-400 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-[#181622] text-zinc-800 dark:text-zinc-200 px-7 py-3.5 text-base font-medium shadow-xs transition-all w-full sm:w-auto cursor-pointer"
          >
            Explore 3 Steps
          </a>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-zinc-500 font-mono pt-2">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Zero generic questions
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-iris" />
            Continuous LangGraph state
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-coral" />
            Traceable evidence graph
          </span>
        </div>

        {/* ── Sexy macOS Live Session Window Frame ── */}
        <div className="mt-14 max-w-4xl mx-auto drop-shadow-2xl">
          <MacWindowFrame title="rozgar-sarthi-live-session.app">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center text-left">
              {/* Radar Column */}
              <div className="md:col-span-5 flex flex-col items-center border-b md:border-b-0 md:border-r border-zinc-200/90 pb-6 md:pb-0 md:pr-6">
                <div className="flex items-center justify-between w-full mb-3">
                  <span className="font-mono text-xs uppercase tracking-wider text-zinc-500 font-semibold">
                    Live Competency State
                  </span>
                  <span className="text-[11px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    84% CONFIDENCE
                  </span>
                </div>
                <CompetencyRadar competencies={previewCompetencies} size={220} />
              </div>

              {/* Live Probe Telemetry Stream */}
              <div className="md:col-span-7 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-wider text-zinc-500 font-semibold">
                    Active Probe Loop (Turn 4)
                  </span>
                  <span className="text-xs font-mono text-coral font-bold bg-coral/10 px-2.5 py-0.5 rounded-full border border-coral/20 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-coral" />
                    Pressure Level {sandboxPressure}
                  </span>
                </div>

                {/* Candidate Speech Quote */}
                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono text-zinc-700">
                  <span className="text-zinc-400 text-[10px] block mb-1 font-semibold uppercase tracking-wider font-sans">
                    CANDIDATE CLAIM:
                  </span>
                  &ldquo;{probeInput}&rdquo;
                </div>

                {/* Dynamic Evaluator Probe */}
                <div className="p-4 rounded-xl bg-zinc-900 text-white space-y-2 text-xs shadow-sm">
                  <div className="flex items-center gap-2 text-iris font-mono font-bold text-[11px]">
                    <Zap className="w-3.5 h-3.5 text-iris" />
                    ENGINE PROBE ACTION:
                  </div>
                  {sandboxSignal === "unsubstantiated" ? (
                    <p className="text-zinc-200 leading-relaxed">
                      &ldquo;What was the baseline latency value before the change, and what specific profiling tools did you use to measure the 40% improvement in production?&rdquo;
                    </p>
                  ) : (
                    <p className="text-zinc-200 leading-relaxed">
                      &ldquo;Excellent verification. Now let's stress test the design: what happens when Redis experiences a cache avalanche during peak traffic? How does the database protect itself?&rdquo;
                    </p>
                  )}
                </div>

                {/* Missing vs Observed Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-zinc-200 shadow-2xs">
                    <div className="text-[10px] font-mono uppercase text-zinc-500 font-bold mb-1.5 flex items-center gap-1.5">
                      <AlertCircle className="w-3 h-3 text-coral" />
                      Missing Context
                    </div>
                    {sandboxSignal === "unsubstantiated" ? (
                      <ul className="space-y-1 text-[11px] text-zinc-600">
                        <li>• Missing baseline latency metric</li>
                        <li>• Missing profiling/measurement tool</li>
                      </ul>
                    ) : (
                      <p className="text-[11px] text-zinc-400">None detected (Triad verified)</p>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-zinc-200 shadow-2xs">
                    <div className="text-[10px] font-mono uppercase text-zinc-500 font-bold mb-1.5 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Observed Strengths
                    </div>
                    {sandboxSignal === "substantiated" ? (
                      <ul className="space-y-1 text-[11px] text-emerald-600 font-medium">
                        <li>• Explicit before/after percentiles</li>
                        <li>• Real tool cited (Prometheus)</li>
                      </ul>
                    ) : (
                      <p className="text-[11px] text-zinc-400">Awaiting methodology probe response</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </MacWindowFrame>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. 3-STEPS TO MASTERY (interview.co iconic 3-step section)
      ───────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-white dark:bg-[#08070c] border-y border-zinc-200/80 dark:border-[#1f1c2b] transition-colors">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-[#12111a] border border-zinc-200 dark:border-[#1f1c2b] text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-3">
              METHODOLOGY
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-3">
              Unlock Your Interview Success in 3 Steps!
            </h2>
            <p className="text-base text-zinc-600 dark:text-[#9e98b7]">
              From resume calibration to real-time voice and coding diagnostics in minutes.
            </p>
          </div>

          {/* 3 Step Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Step 1 */}
            <div className="relative flex flex-col items-center pt-6 group">
              <div className="w-12 h-12 rounded-full bg-iris text-white font-extrabold text-lg flex items-center justify-center absolute -top-0 shadow-lg ring-4 ring-white dark:ring-[#08070c] group-hover:scale-110 transition-transform">
                1
              </div>
              <div className="w-full bg-zinc-50/70 dark:bg-[#0e0d14] border border-zinc-200 dark:border-[#1f1c2b] rounded-3xl pt-10 pb-8 px-6 text-center flex flex-col flex-1 shadow-2xs hover:shadow-md hover:bg-white dark:hover:bg-[#12111a] transition-all">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                  Choose a Role or Upload Resume
                </h3>
                <p className="text-sm text-zinc-600 dark:text-[#9e98b7] leading-relaxed mb-4">
                  AI parses your projects, tech stack, and achievements. It calibrates targeted technical probes tailored specifically to your claimed background.
                </p>
                <div className="mt-auto pt-3 border-t border-zinc-200/60 dark:border-[#1f1c2b] flex items-center justify-center gap-1.5 text-xs text-iris font-semibold">
                  <span>Resume Ingestion & Calibration</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col items-center pt-6 group">
              <div className="w-12 h-12 rounded-full bg-iris text-white font-extrabold text-lg flex items-center justify-center absolute -top-0 shadow-lg ring-4 ring-white dark:ring-[#08070c] group-hover:scale-110 transition-transform">
                2
              </div>
              <div className="w-full bg-zinc-50/70 dark:bg-[#0e0d14] border border-zinc-200 dark:border-[#1f1c2b] rounded-3xl pt-10 pb-8 px-6 text-center flex flex-col flex-1 shadow-2xs hover:shadow-md hover:bg-white dark:hover:bg-[#12111a] transition-all">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                  Start Your Mock Interview
                </h3>
                <p className="text-sm text-zinc-600 dark:text-[#9e98b7] leading-relaxed mb-4">
                  Engage in a realistic voice session. If you provide vague answers, the AI increases pressure to demand baselines, trade-offs, and metrics.
                </p>
                <div className="mt-auto pt-3 border-t border-zinc-200/60 dark:border-[#1f1c2b] flex items-center justify-center gap-1.5 text-xs text-iris font-semibold">
                  <span>Adaptive Pressure Levels 1–5</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center pt-6 group">
              <div className="w-12 h-12 rounded-full bg-iris text-white font-extrabold text-lg flex items-center justify-center absolute -top-0 shadow-lg ring-4 ring-white dark:ring-[#08070c] group-hover:scale-110 transition-transform">
                3
              </div>
              <div className="w-full bg-zinc-50/70 dark:bg-[#0e0d14] border border-zinc-200 dark:border-[#1f1c2b] rounded-3xl pt-10 pb-8 px-6 text-center flex flex-col flex-1 shadow-2xs hover:shadow-md hover:bg-white dark:hover:bg-[#12111a] transition-all">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                  Get AI-Based Feedback
                </h3>
                <p className="text-sm text-zinc-600 dark:text-[#9e98b7] leading-relaxed mb-4">
                  Receive your 4-page diagnostic report with Hiring Calibration badge, verified claims audit, STAR coaching, and personalized study roadmap.
                </p>
                <div className="mt-auto pt-3 border-t border-zinc-200/60 dark:border-[#1f1c2b] flex items-center justify-center gap-1.5 text-xs text-iris font-semibold">
                  <span>Hiring Calibration & STAR Audit</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Centered Pill Action */}
          <div className="text-center">
            <Link
              href={primaryCta}
              className="inline-flex items-center justify-center rounded-full bg-iris hover:bg-iris/90 text-white text-base font-semibold px-8 py-3.5 transition-all shadow-md shadow-iris/20 hover:scale-105 cursor-pointer"
            >
              <span>{isSignedIn ? "Go to Dashboard" : "Get Started"}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. "YOU TALKED. AI LISTENED." (interview.co feedback card preview)
      ───────────────────────────────────────────────────────────── */}
      <section id="evidence" className="py-24 px-4 sm:px-6 max-w-[1200px] mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-xs font-mono font-semibold text-zinc-700 uppercase tracking-wider mb-3">
            EVIDENCE-BACKED TELEMETRY
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight mb-3">
            You Talked. AI Listened. Get Your Feedback.
          </h2>
          <p className="text-base text-zinc-600">
            Transparent, auditable evaluation backed by traceable quotes, claim verifications, and calibrated benchmarks.
          </p>
        </div>

        {/* High-Fidelity Diagnostic Feedback Visual (Sexy Dark Theme) */}
        <div className="rounded-3xl bg-zinc-950 text-white p-6 sm:p-12 shadow-2xl border border-zinc-800 relative overflow-hidden">
          {/* Ambient light streak */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-iris/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Overall Hiring Calibration Badge */}
            <div className="lg:col-span-5 bg-zinc-900/90 rounded-2xl p-6 sm:p-7 border border-zinc-800 flex flex-col justify-between h-full shadow-lg">
              <div>
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                  Diagnostic Report Synthesis
                </span>
                <div className="mt-4 mb-6">
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30">
                    <Award className="w-4 h-4 text-emerald-400" />
                    CALIBRATION: STRONG HIRE
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-4 tracking-tight">
                    Top 10% Candidate Readiness
                  </h3>
                  <p className="text-xs text-zinc-300 mt-2.5 leading-relaxed font-normal">
                    Demonstrated first-principles mastery on distributed systems and provided quantitative baselines on query optimization claims.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 text-xs text-zinc-400 flex items-center justify-between font-mono">
                <span>Model: Gemini Evaluator</span>
                <span className="text-emerald-400 font-bold">92% Overall Score</span>
              </div>
            </div>

            {/* Right: 5-Axis Competency Bars & Claim Verification Audit */}
            <div className="lg:col-span-7 space-y-6">
              {/* 5-Axis Competency Scorecard */}
              <div className="space-y-3.5">
                <div>
                  <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                    <span className="text-zinc-300">Technical Depth</span>
                    <span className="text-emerald-400 font-bold">0.84 / 1.0</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-800/80 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[84%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                    <span className="text-zinc-300">System Design & Scalability</span>
                    <span className="text-emerald-400 font-bold">0.78 / 1.0</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-800/80 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[78%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                    <span className="text-zinc-300">Problem Solving & Edge Cases</span>
                    <span className="text-emerald-400 font-bold">0.91 / 1.0</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-800/80 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[91%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                    <span className="text-zinc-300">Ownership & Specificity</span>
                    <span className="text-amber-400 font-bold">0.68 / 1.0</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-800/80 overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full w-[68%]" />
                  </div>
                </div>
              </div>

              {/* Claims Audit Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="bg-zinc-900/80 rounded-xl p-3.5 border border-zinc-800 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified Claim (Turn 4)</span>
                  </div>
                  <p className="text-zinc-300 italic">
                    &quot;Migrated monolith to Kafka cluster handling 50k events/sec...&quot;
                  </p>
                  <span className="block text-[10px] text-zinc-400 mt-1 font-mono">
                    Substantiated with partition key architecture
                  </span>
                </div>

                <div className="bg-zinc-900/80 rounded-xl p-3.5 border border-zinc-800 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Probed Risk Area (Turn 2)</span>
                  </div>
                  <p className="text-zinc-300 italic">
                    &quot;Led full infrastructure re-write single-handedly...&quot;
                  </p>
                  <span className="block text-[10px] text-zinc-400 mt-1 font-mono">
                    Flagged: Missing team coordination details
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. THE CYCLICAL BRAIN (LangGraph State Machine Architecture)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white dark:bg-[#08070c] border-y border-zinc-200/80 dark:border-[#1f1c2b] transition-colors">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-[#12111a] border border-zinc-200 dark:border-[#1f1c2b] text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-3">
              CYCLICAL STATE MACHINE
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4">
              How the Brain Works
            </h2>
            <p className="text-base text-zinc-600 dark:text-[#9e98b7]">
              Unlike static chat bots that follow a linear script, Rozgar Sarthi runs an adaptive LangGraph state machine that evaluates every word before choosing the next move.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 max-w-5xl mx-auto">
            <div className="bg-zinc-50 dark:bg-[#0e0d14] border border-zinc-200 dark:border-[#1f1c2b] rounded-2xl p-5 text-center flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-[#181622] text-white border dark:border-[#1f1c2b] flex items-center justify-center mb-3">
                <Volume2 className="w-5 h-5 text-emerald-400" />
              </div>
              <h4 className="font-bold text-sm text-zinc-900 dark:text-white mb-1">1. Observe</h4>
              <p className="text-xs text-zinc-500 dark:text-[#9e98b7]">
                Candidate response ingested via real-time Vapi voice stream.
              </p>
            </div>

            <div className="bg-zinc-50 dark:bg-[#0e0d14] border border-zinc-200 dark:border-[#1f1c2b] rounded-2xl p-5 text-center flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-[#181622] text-white border dark:border-[#1f1c2b] flex items-center justify-center mb-3">
                <Search className="w-5 h-5 text-cobalt" />
              </div>
              <h4 className="font-bold text-sm text-zinc-900 dark:text-white mb-1">2. Extract Claims</h4>
              <p className="text-xs text-zinc-500 dark:text-[#9e98b7]">
                Pulls technical facts, claims, metrics, and detects evasion.
              </p>
            </div>

            <div className="bg-zinc-50 dark:bg-[#0e0d14] border border-zinc-200 dark:border-[#1f1c2b] rounded-2xl p-5 text-center flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-[#181622] text-white border dark:border-[#1f1c2b] flex items-center justify-center mb-3">
                <BarChart3 className="w-5 h-5 text-iris" />
              </div>
              <h4 className="font-bold text-sm text-zinc-900 dark:text-white mb-1">3. Competency Δ</h4>
              <p className="text-xs text-zinc-500 dark:text-[#9e98b7]">
                Computes deltas across the 5 axes and updates state vector.
              </p>
            </div>

            <div className="bg-zinc-50 dark:bg-[#0e0d14] border border-zinc-200 dark:border-[#1f1c2b] rounded-2xl p-5 text-center flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-[#181622] text-white border dark:border-[#1f1c2b] flex items-center justify-center mb-3">
                <Flame className="w-5 h-5 text-coral" />
              </div>
              <h4 className="font-bold text-sm text-zinc-900 dark:text-white mb-1">4. Adjust Pressure</h4>
              <p className="text-xs text-zinc-500 dark:text-[#9e98b7]">
                Scales pressure level (1–5) based on vagueness or evasion.
              </p>
            </div>

            <div className="bg-zinc-50 dark:bg-[#0e0d14] border border-zinc-200 dark:border-[#1f1c2b] rounded-2xl p-5 text-center flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-[#181622] text-white border dark:border-[#1f1c2b] flex items-center justify-center mb-3">
                <Compass className="w-5 h-5 text-emerald-400" />
              </div>
              <h4 className="font-bold text-sm text-zinc-900 dark:text-white mb-1">5. Dynamic Probe</h4>
              <p className="text-xs text-zinc-500 dark:text-[#9e98b7]">
                Synthesizes next question targeting the biggest gap.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. INTERACTIVE PROBE WORKSHOP (Hands-on test of claim verification)
      ───────────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-4 sm:px-6 max-w-[1200px] mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-[#12111a] border border-zinc-200 dark:border-[#1f1c2b] text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-3">
            INTERACTIVE WORKSHOP
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-3">
            Test the Claim Extraction Engine Live
          </h2>
          <p className="text-base text-zinc-600 dark:text-[#9e98b7]">
            Click an example claim below to see how the engine adjusts pressure and extracts missing metrics.
          </p>
        </div>

        <div className="max-w-3xl mx-auto bg-white dark:bg-[#0e0d14] border border-zinc-200 dark:border-[#1f1c2b] rounded-3xl p-6 sm:p-8 shadow-sm">
          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-2.5 mb-6">
            <button
              onClick={() => handleTestClaim("I optimized our database to handle more traffic.")}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                probeInput.includes("traffic")
                  ? "bg-iris text-white shadow-xs font-semibold"
                  : "bg-zinc-100 dark:bg-[#181622] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-[#221e33] border border-transparent dark:border-[#1f1c2b]"
              }`}
            >
              Vague Claim (&quot;optimized database&quot;)
            </button>

            <button
              onClick={() => handleTestClaim("I decreased API latency in our backend service by 40%.")}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                probeInput.includes("40%")
                  ? "bg-iris text-white shadow-xs font-semibold"
                  : "bg-zinc-100 dark:bg-[#181622] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-[#221e33] border border-transparent dark:border-[#1f1c2b]"
              }`}
            >
              Unsubstantiated Metric (&quot;40% latency&quot;)
            </button>

            <button
              onClick={() =>
                handleTestClaim(
                  "Used Prometheus to profile p99 latency from 200ms to 45ms with a composite index on (tenant_id, created_at)."
                )
              }
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                probeInput.includes("composite index")
                  ? "bg-iris text-white shadow-xs font-semibold"
                  : "bg-zinc-100 dark:bg-[#181622] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-[#221e33] border border-transparent dark:border-[#1f1c2b]"
              }`}
            >
              Substantiated Claim (Tools + Metrics)
            </button>
          </div>

          {/* Claim Display Box */}
          <div className="bg-zinc-50 dark:bg-[#12111a] rounded-2xl border border-zinc-200 dark:border-[#1f1c2b] p-4 mb-4 font-mono text-xs sm:text-sm text-zinc-800 dark:text-zinc-200">
            <span className="text-zinc-400 dark:text-zinc-500 select-none block mb-1 font-sans text-[11px] uppercase tracking-wider font-semibold">
              Candidate Statement:
            </span>
            &quot;{probeInput}&quot;
          </div>

          {/* Engine Analysis Outcome */}
          <div className="bg-zinc-900 dark:bg-[#161422] text-white border border-zinc-800 dark:border-[#221e33] rounded-2xl p-5 space-y-3 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-white dark:text-zinc-100 uppercase tracking-wider font-mono">
                Engine Verdict:
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    sandboxSignal === "substantiated"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  }`}
                >
                  {sandboxSignal === "substantiated" ? "✓ Verified Triad" : "⚠ Missing Baseline Metrics"}
                </span>
                <span className="px-3 py-1 rounded-full bg-zinc-800 dark:bg-[#252136] text-white dark:text-zinc-100 text-xs font-mono font-semibold border border-zinc-700 dark:border-[#332e4a]">
                  Pressure Level {sandboxPressure} / 5
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-200 dark:text-zinc-200 leading-relaxed font-normal">
              {sandboxSignal === "substantiated"
                ? "Excellent: Baseline metrics (200ms to 45ms), profiling tooling (Prometheus), and exact implementation details (composite index) verified. Engine advances to architectural trade-offs."
                : "Engine flagged missing data: No baseline measurement tooling or trade-off evaluation cited. The AI will next challenge the candidate for specific metrics and profiling evidence."}
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. COMPARISON MATRIX (Generic bots vs Rozgar Sarthi)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-zinc-50 border-t border-zinc-200/80">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-xs font-mono font-semibold text-zinc-700 uppercase tracking-wider mb-3 shadow-2xs">
              COMPETITIVE BENCHMARK
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight mb-4">
              Generic AI Mock Interviews vs Rozgar Sarthi
            </h2>
            <p className="text-base text-zinc-600">
              Why conventional AI interviewers fail to prepare engineers for high-bar technical loops.
            </p>
          </div>

          <div className="overflow-x-auto max-w-4xl mx-auto shadow-sm rounded-3xl border border-zinc-200 bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-100/80 border-b border-zinc-200 font-mono text-xs text-zinc-600">
                  <th className="p-4 sm:p-5 font-semibold">CAPABILITY</th>
                  <th className="p-4 sm:p-5 text-zinc-400 font-semibold">GENERIC AI CHATBOTS</th>
                  <th className="p-4 sm:p-5 text-iris font-bold bg-iris/5 border-x border-iris/20">
                    ROZGAR SARTHI ENGINE
                  </th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-zinc-200">
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-zinc-900">Question Progression</td>
                  <td className="p-4 sm:p-5 text-zinc-500">Static script or random questions from fixed bank</td>
                  <td className="p-4 sm:p-5 font-medium text-zinc-900 bg-iris/5 border-x border-iris/20">
                    Selects next probe based on what it still needs to learn about your state
                  </td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-zinc-900">Claim Verification</td>
                  <td className="p-4 sm:p-5 text-zinc-500">Accepts exaggerated numbers without challenge</td>
                  <td className="p-4 sm:p-5 font-medium text-zinc-900 bg-iris/5 border-x border-iris/20">
                    Probes baselines, profiling methodology, and system trade-offs
                  </td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-zinc-900">Coding Evaluation</td>
                  <td className="p-4 sm:p-5 text-zinc-500">Only looks at final LeetCode submission string</td>
                  <td className="p-4 sm:p-5 font-medium text-zinc-900 bg-iris/5 border-x border-iris/20">
                    Monaco editor + Tree-Sitter AST static analysis & hidden test cases
                  </td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-zinc-900">Consistency Checks</td>
                  <td className="p-4 sm:p-5 text-zinc-500">Zero cross-turn memory or contradiction detection</td>
                  <td className="p-4 sm:p-5 font-medium text-zinc-900 bg-iris/5 border-x border-iris/20">
                    Cross-checks claims made throughout the interview for alignment
                  </td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-zinc-900">Actionable Feedback</td>
                  <td className="p-4 sm:p-5 text-zinc-500">&ldquo;Good job, 8/10! Be more confident.&rdquo;</td>
                  <td className="p-4 sm:p-5 font-medium text-zinc-900 bg-iris/5 border-x border-iris/20">
                    4-page diagnostic report with Hiring Calibration badge & STAR analysis
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. BOTTOM CTA BANNER (Sexy Dark Theme)
      ───────────────────────────────────────────────────────────── */}
      <section className="pb-24 pt-12 px-4 sm:px-6 max-w-[1200px] mx-auto w-full">
        <div className="rounded-3xl bg-zinc-950 text-white p-8 sm:p-16 text-center relative overflow-hidden shadow-2xl border border-zinc-800">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(106,94,217,0.15),rgba(0,0,0,0))] pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Ready to Pressure-Test Your Technical Reasoning?
            </h2>
            <p className="text-zinc-400 text-base leading-relaxed">
              Upload your resume, select your target role, and experience adaptive interview intelligence designed for real software engineering standards.
            </p>
            <div className="pt-2">
              <Link
                href={primaryCta}
                className="inline-flex items-center gap-2 rounded-full bg-white hover:bg-zinc-100 text-zinc-900 text-base font-semibold px-8 py-3.5 transition-all shadow-md hover:scale-105 cursor-pointer"
              >
                <span>{isSignedIn ? "Go to Dashboard" : "Get Started"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
