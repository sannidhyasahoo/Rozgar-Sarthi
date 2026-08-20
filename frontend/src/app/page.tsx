"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  HelpCircle,
  BarChart3,
  Flame,
  Code2,
  FileText,
} from "lucide-react";
import { MonoEyebrow } from "@/components/shared/MonoEyebrow";
import { MacWindowFrame } from "@/components/shared/MacWindowFrame";
import { CompetencyRadar } from "@/components/interview/CompetencyRadar";
import { PressureDial } from "@/components/interview/PressureDial";
import { CompetencyVector, PressureLevel } from "@/lib/types";

export default function HomePage() {
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
    } else {
      setSandboxSignal("unsubstantiated");
      setSandboxPressure(4);
    }
  };

  const previewCompetencies: CompetencyVector = {
    technical_depth: 0.78,
    system_design: 0.69,
    problem_solving: 0.84,
    communication_clarity: 0.72,
    ownership_specificity: 0.66,
  };

  return (
    <div className="flex flex-col">
      {/* 1. HERO SECTION */}
      <section className="pt-16 sm:pt-24 pb-20 px-4 sm:px-6 max-w-[1200px] mx-auto text-center">
        <div className="flex justify-center mb-6">
          <MonoEyebrow color="sprout">ADAPTIVE INTERVIEW INTELLIGENCE</MonoEyebrow>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-900 leading-[1.08] max-w-4xl mx-auto mb-6">
          Interviews That Probe What You <span className="text-zinc-900 underline decoration-iris/40 decoration-wavy">Actually Know</span>.
        </h1>

        <p className="text-lg sm:text-xl text-zinc-600 max-w-2xl mx-auto leading-relaxed mb-8">
          Most AI platforms just grade answers. Rozgar Sarthi maintains a live competency state, extracts technical claims, and adaptively pressure-tests what it still needs to learn.
        </p>

        {/* Primary Iris Action CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
          <Link href="/sign-up" className="btn-primary-action w-full sm:w-auto shadow-md">
            <span>Launch Practice Session</span>
            <ArrowRight className="w-4 h-4 stroke-[2]" />
          </Link>
          <Link href="/dashboard" className="btn-secondary-action w-full sm:w-auto">
            <span>Explore Candidate Dashboard</span>
          </Link>
        </div>

        <div className="flex items-center justify-center gap-6 text-xs text-zinc-500 font-mono pt-2">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sprout" />
            Zero generic questions
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cobalt" />
            Continuous LangGraph state
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-coral" />
            Reasoning trajectory logging
          </span>
        </div>

        {/* Product Screenshot Frame Preview */}
        <div className="mt-14 max-w-4xl mx-auto">
          <MacWindowFrame title="rozgar-sarthi-live-session.app">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center text-left">
              {/* Radar Column */}
              <div className="md:col-span-5 flex flex-col items-center border-b md:border-b-0 md:border-r border-zinc-200 pb-6 md:pb-0 md:pr-6">
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="font-mono text-xs uppercase tracking-wider text-zinc-500 font-semibold">
                    Live Competency State
                  </span>
                  <span className="text-[11px] font-mono text-sprout font-bold bg-sprout/10 px-2 py-0.5 rounded border border-sprout/20">
                    78% CONFIDENCE
                  </span>
                </div>
                <CompetencyRadar competencies={previewCompetencies} size={220} />
              </div>

              {/* Live Probe Telemetry Stream */}
              <div className="md:col-span-7 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-wider text-zinc-500 font-semibold">
                    Active Probe Loop (Turn 4)
                  </span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-coral/10 text-coral border border-coral/20 font-bold">
                    PRESSURE L4: CHALLENGE
                  </span>
                </div>

                {/* Simulated AI Question Card */}
                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 space-y-2">
                  <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-iris" />
                    AI EVALUATOR PROBE:
                  </div>
                  <p className="leading-relaxed">
                    &ldquo;You mentioned reducing latency from 350ms to 45ms by adding composite indexes. What was your write amplification overhead on table mutations, and how did you measure replica lag under peak traffic?&rdquo;
                  </p>
                </div>

                {/* Evidence Extraction Node */}
                <div className="p-3 rounded-lg bg-sprout/5 border border-sprout/20 flex items-start gap-2.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-sprout stroke-[2] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-mono font-bold text-sprout text-[11px] block">
                      EVIDENCE SUBSTANTIATED
                    </span>
                    <p className="text-zinc-600 text-[11px] leading-snug">
                      Candidate verified root cause via PostgreSQL query plan breakdown (`EXPLAIN ANALYZE`).
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-2 border-t border-zinc-200">
                  <span>LATENCY: 194ms</span>
                  <span>THREAD: session_backend_sr_04</span>
                  <span className="text-iris font-semibold">ACTIVE STREAM</span>
                </div>
              </div>
            </div>
          </MacWindowFrame>
        </div>
      </section>

      {/* 2. THE 7 CORE ARCHITECTURE PILLARS (README-BASED) */}
      <section className="py-20 bg-zinc-100/70 border-y border-zinc-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="flex justify-center mb-3">
              <MonoEyebrow color="cobalt">SYSTEM ARCHITECTURE</MonoEyebrow>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 mb-4">
              Seven Pillars of Adaptive Assessment
            </h2>
            <p className="text-base text-zinc-600">
              Traditional mock interviews are static chatbots. Rozgar Sarthi runs an evidence-driven state machine built around deep candidate verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <div className="dev-card p-6 flex flex-col justify-between hover:border-zinc-300 transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-cobalt/10 flex items-center justify-center text-cobalt mb-4 border border-cobalt/20">
                  <Activity className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div className="font-mono text-[11px] text-cobalt font-bold tracking-wide uppercase mb-1">
                  PILLAR 01
                </div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">
                  Continuous Candidate State
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Instead of a flat percentage score, we maintain a live 5-dimensional competency vector. Every answer mutates weights with explicit Bayesian confidence updates.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 font-mono text-xs text-zinc-500">
                Vector: Tech • Design • Problem • Comm • Ownership
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="dev-card p-6 flex flex-col justify-between hover:border-zinc-300 transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-sprout/10 flex items-center justify-center text-sprout mb-4 border border-sprout/20">
                  <GitBranch className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div className="font-mono text-[11px] text-sprout font-bold tracking-wide uppercase mb-1">
                  PILLAR 02
                </div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">
                  Evidence Graph Construction
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Every score is directly auditable. The system answers &ldquo;Why did I get this rating?&rdquo; by linking turn quotes to concrete observed strengths or missing baselines.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 font-mono text-xs text-zinc-500">
                Turn-by-turn quote & claim linkage
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="dev-card p-6 flex flex-col justify-between hover:border-zinc-300 transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-coral/10 flex items-center justify-center text-coral mb-4 border border-coral/20">
                  <Zap className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div className="font-mono text-[11px] text-coral font-bold tracking-wide uppercase mb-1">
                  PILLAR 03
                </div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">
                  Evidence Pressure & Probing
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  When you claim &ldquo;I scaled our system by 10x&rdquo;, the engine immediately probes the baseline, measurement tools, and bottleneck trade-offs to test substance.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 font-mono text-xs text-zinc-500">
                Skeptical claim verification loop
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="dev-card p-6 flex flex-col justify-between hover:border-zinc-300 transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-iris/10 flex items-center justify-center text-iris mb-4 border border-iris/20">
                  <Code2 className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div className="font-mono text-[11px] text-iris font-bold tracking-wide uppercase mb-1">
                  PILLAR 04
                </div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">
                  Reasoning Trajectory (Coding)
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  For coding assessments, we trace the full problem-solving trajectory: approach selection → complexity analysis → debugging → counterexample resilience.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 font-mono text-xs text-zinc-500">
                Evaluates thinking process, not just final code
              </div>
            </div>

            {/* Pillar 5 */}
            <div className="dev-card p-6 flex flex-col justify-between hover:border-zinc-300 transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-zinc-200 flex items-center justify-center text-zinc-700 mb-4 border border-zinc-300">
                  <ShieldCheck className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div className="font-mono text-[11px] text-zinc-700 font-bold tracking-wide uppercase mb-1">
                  PILLAR 05
                </div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">
                  Cross-Answer Consistency
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Claims made in Turn 1 are cross-compared with architecture statements in Turn 8. Flags discrepancies neutrally to seek clarification without labeling.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 font-mono text-xs text-zinc-500">
                Holistic session integrity verification
              </div>
            </div>

            {/* Pillar 6 & 7 combined */}
            <div className="dev-card p-6 flex flex-col justify-between hover:border-zinc-300 transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-crimson/10 flex items-center justify-center text-crimson mb-4 border border-crimson/20">
                  <Flame className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div className="font-mono text-[11px] text-crimson font-bold tracking-wide uppercase mb-1">
                  PILLAR 06 & 07
                </div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">
                  Adaptive Pressure Ramp (L1–L5)
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  From open-ended exploration (L1) up to pathological edge cases and counterexamples (L5). Plus longitudinal diagnosis across multiple practice sessions.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 font-mono text-xs text-zinc-500">
                5-level stress ladder & longitudinal trends
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DRAMATIC DARK BAND (Rhythm Device: DESIGN.md Specification) */}
      <section className="py-24 bg-[#18181b] text-white border-y border-zinc-800">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="flex justify-center mb-3">
              <MonoEyebrow color="sprout" className="!bg-sprout/20 !border-sprout/40 !text-lime">
                ENGINE WORKSHOP & PROBE SANDBOX
              </MonoEyebrow>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
              Test How the Engine Probes Technical Claims
            </h2>
            <p className="text-base text-zinc-400">
              Try clicking different candidate claim statements below to see how the LangGraph evaluator detects missing baselines and dynamically escalates pressure.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Interactive Claim Trigger */}
            <div className="lg:col-span-5 space-y-4">
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                Select Sample Candidate Statement
              </div>

              <button
                onClick={() =>
                  handleTestClaim("I decreased API latency in our backend service by 40%.")
                }
                className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs ${
                  probeInput.includes("by 40%")
                    ? "bg-zinc-800 border-coral text-white shadow-md"
                    : "bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                }`}
              >
                <div className="font-mono text-[10px] text-coral font-bold mb-1">
                  VAGUE QUANTIFIED CLAIM (TRIGGER PROBE)
                </div>
                &ldquo;I decreased API latency in our backend service by 40%.&rdquo;
              </button>

              <button
                onClick={() =>
                  handleTestClaim(
                    "We used Redis with composite indexes in PostgreSQL, reducing p99 latency from 200ms to 45ms verified via Prometheus."
                  )
                }
                className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs ${
                  probeInput.includes("Prometheus")
                    ? "bg-zinc-800 border-sprout text-white shadow-md"
                    : "bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                }`}
              >
                <div className="font-mono text-[10px] text-sprout font-bold mb-1">
                  EVIDENCE-BACKED CLAIM (SUBSTANTIATED)
                </div>
                &ldquo;We used Redis with composite indexes in PostgreSQL, reducing p99 latency from 200ms to 45ms verified via Prometheus.&rdquo;
              </button>

              <button
                onClick={() =>
                  handleTestClaim(
                    "Our microservices handled over 10 million requests with zero errors."
                  )
                }
                className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs ${
                  probeInput.includes("10 million")
                    ? "bg-zinc-800 border-coral text-white shadow-md"
                    : "bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                }`}
              >
                <div className="font-mono text-[10px] text-coral font-bold mb-1">
                  UNSUBSTANTIATED THROUGHPUT CLAIM
                </div>
                &ldquo;Our microservices handled over 10 million requests with zero errors.&rdquo;
              </button>

              <div className="pt-2">
                <PressureDial currentLevel={sandboxPressure} dark />
              </div>
            </div>

            {/* Right: Engine Telemetry Response */}
            <div className="lg:col-span-7">
              <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-sprout" />
                    <span className="font-mono text-xs text-zinc-300 font-bold">
                      ENGINE EVALUATION INSPECTOR
                    </span>
                  </div>
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
                      sandboxSignal === "substantiated"
                        ? "bg-sprout/20 text-lime border-sprout/40"
                        : "bg-coral/20 text-coral border-coral/40"
                    }`}
                  >
                    SIGNAL: {sandboxSignal.toUpperCase()}
                  </span>
                </div>

                {/* Candidate Quote Display */}
                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-mono">
                  <span className="text-zinc-500 text-[10px] block mb-1">CANDIDATE INPUT:</span>
                  &ldquo;{probeInput}&rdquo;
                </div>

                {/* Evaluator Next Action */}
                <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-iris font-mono font-bold text-[11px]">
                    <Zap className="w-3.5 h-3.5 text-iris" />
                    ENGINE PROBE ACTION (PRESSURE LEVEL {sandboxPressure}):
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

                {/* Missing & Observed Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                    <div className="text-[10px] font-mono uppercase text-zinc-400 font-bold mb-1.5 flex items-center gap-1.5">
                      <AlertCircle className="w-3 h-3 text-coral" />
                      Missing Context
                    </div>
                    {sandboxSignal === "unsubstantiated" ? (
                      <ul className="space-y-1 text-[11px] text-zinc-400">
                        <li>• Missing baseline latency value</li>
                        <li>• Missing profiling/measurement tool</li>
                        <li>• Missing failure rollback plan</li>
                      </ul>
                    ) : (
                      <p className="text-[11px] text-zinc-500">None detected (Concrete triad verified)</p>
                    )}
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                    <div className="text-[10px] font-mono uppercase text-zinc-400 font-bold mb-1.5 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-sprout" />
                      Observed Strengths
                    </div>
                    {sandboxSignal === "substantiated" ? (
                      <ul className="space-y-1 text-[11px] text-lime">
                        <li>• Explicit before/after percentiles</li>
                        <li>• Real tool cited (Prometheus)</li>
                        <li>• Concrete indexing mechanism</li>
                      </ul>
                    ) : (
                      <p className="text-[11px] text-zinc-500">Awaiting specific methodology probe response</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. COMPARISON AGAINST STATUS QUO (Anti-AI-Slop Requirement) */}
      <section className="py-20 max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex justify-center mb-3">
            <MonoEyebrow color="coral">COMPARISON</MonoEyebrow>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 mb-4">
            Standard AI Mock Interviews vs Rozgar Sarthi
          </h2>
          <p className="text-base text-zinc-600">
            Why conventional AI interviewers fail to prepare engineers for high-bar technical loops.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-zinc-200 dev-card">
            <thead>
              <tr className="bg-zinc-100/80 border-b border-zinc-200 font-mono text-xs text-zinc-600">
                <th className="p-4">CAPABILITY</th>
                <th className="p-4 text-zinc-400">GENERIC AI CHATBOTS</th>
                <th className="p-4 text-iris font-bold bg-iris/5 border-x border-iris/20">
                  ROZGAR SARTHI ENGINE
                </th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-zinc-200">
              <tr>
                <td className="p-4 font-semibold text-zinc-900">Question Progression</td>
                <td className="p-4 text-zinc-500">Static script or random questions from fixed bank</td>
                <td className="p-4 font-medium text-zinc-900 bg-iris/5 border-x border-iris/20">
                  Selects next probe based on what it still needs to learn about your state
                </td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-zinc-900">Claim Verification</td>
                <td className="p-4 text-zinc-500">Accepts exaggerated numbers without challenge</td>
                <td className="p-4 font-medium text-zinc-900 bg-iris/5 border-x border-iris/20">
                  Probes baselines, profiling methodology, and system trade-offs
                </td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-zinc-900">Coding Evaluation</td>
                <td className="p-4 text-zinc-500">Only looks at final LeetCode submission string</td>
                <td className="p-4 font-medium text-zinc-900 bg-iris/5 border-x border-iris/20">
                  Traces reasoning trajectory, approach selection, and debugging resilience
                </td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-zinc-900">Consistency Checks</td>
                <td className="p-4 text-zinc-500">Zero cross-turn memory or contradiction detection</td>
                <td className="p-4 font-medium text-zinc-900 bg-iris/5 border-x border-iris/20">
                  Cross-checks claims made throughout the interview for alignment
                </td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-zinc-900">Actionable Feedback</td>
                <td className="p-4 text-zinc-500">&ldquo;Good job, 8/10! Be more confident.&rdquo;</td>
                <td className="p-4 font-medium text-zinc-900 bg-iris/5 border-x border-iris/20">
                  Auditable evidence graph with turn-linked quotes and concrete engineering tips
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. FINAL CALL TO ACTION */}
      <section className="py-20 bg-zinc-100 border-t border-zinc-200 text-center">
        <div className="max-w-[720px] mx-auto px-4 sm:px-6">
          <div className="flex justify-center mb-3">
            <MonoEyebrow color="iris">GET STARTED TODAY</MonoEyebrow>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 mb-4">
            Ready to Pressure-Test Your Technical Reasoning?
          </h2>
          <p className="text-base text-zinc-600 mb-8 leading-relaxed">
            Upload your resume, pick your target technical track, and experience adaptive interview intelligence designed for real software engineering standards.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up" className="btn-primary-action shadow-md">
              <span>Create Candidate Account</span>
              <ArrowRight className="w-4 h-4 stroke-[2]" />
            </Link>
            <Link href="/interview" className="btn-secondary-action">
              <span>Start Instant AI Interview</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
