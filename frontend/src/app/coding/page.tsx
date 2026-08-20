"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppAuth } from "@/components/auth/AuthProvider";
import { MonoEyebrow } from "@/components/shared/MonoEyebrow";
import { SAMPLE_CODING_CHALLENGES } from "@/lib/mock-data";
import { CodingChallenge, ReasoningTrajectoryStep } from "@/lib/types";
import { saveSessionToHistory, saveStoredProfile } from "@/lib/storage";
import {
  Code2,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Terminal,
  Zap,
  ArrowRight,
  HelpCircle,
  Layers,
  Sparkles,
} from "lucide-react";

export default function CodingRoundPage() {
  const router = useRouter();
  const { profile, setProfile } = useAppAuth();

  const [selectedChallenge, setSelectedChallenge] = useState<CodingChallenge>(
    SAMPLE_CODING_CHALLENGES[0]
  );
  const [selectedLang, setSelectedLang] = useState<"python" | "typescript" | "go">("python");
  const [code, setCode] = useState<string>(selectedChallenge.starterCode.python);
  const [approachNotes, setApproachNotes] = useState(
    "Using a Hash Map (lookup table) paired with a Doubly Linked List. The doubly linked list maintains the LRU access order in O(1), while each node stores an `expires_at` timestamp in seconds."
  );
  const [complexityTime, setComplexityTime] = useState("O(1) average for get and put");
  const [complexitySpace, setComplexitySpace] = useState("O(capacity) space bound");

  const [runningTests, setRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<{
    passed: boolean;
    output: string;
    details: { caseId: number; status: "pass" | "fail"; runtime: string }[];
  } | null>(null);

  const [trajectorySteps, setTrajectorySteps] = useState<ReasoningTrajectoryStep[]>([
    {
      id: "step_1",
      phase: "approach",
      title: "Approach Formulated",
      content: "Selected Doubly Linked List + Hash Map to guarantee strict O(1) mutations.",
      timestamp: "00:02:15",
      status: "success",
    },
    {
      id: "step_2",
      phase: "complexity",
      title: "Complexity Hypothesis",
      content: "Hypothesized Time O(1) & Space O(N) bounded by capacity.",
      timestamp: "00:04:30",
      status: "success",
    },
  ]);

  const [counterResponse, setCounterResponse] = useState("");
  const [counterAnswered, setCounterAnswered] = useState(false);

  const handleLanguageChange = (lang: "python" | "typescript" | "go") => {
    setSelectedLang(lang);
    setCode(selectedChallenge.starterCode[lang]);
  };

  const handleRunTests = () => {
    setRunningTests(true);
    setTestResults(null);

    setTimeout(() => {
      setRunningTests(false);
      setTestResults({
        passed: true,
        output: "All 3 sample test cases and 5 hidden edge cases passed successfully.",
        details: [
          { caseId: 1, status: "pass", runtime: "0.14ms" },
          { caseId: 2, status: "pass", runtime: "0.22ms" },
          { caseId: 3, status: "pass", runtime: "0.18ms" },
        ],
      });

      setTrajectorySteps((prev) => [
        ...prev,
        {
          id: `step_${Date.now()}`,
          phase: "test_execution",
          title: "Test Execution & Edge Checks",
          content: "Passed all standard capacity eviction tests and TTL expiry checks.",
          timestamp: new Date().toLocaleTimeString(),
          status: "success",
        },
      ]);
    }, 800);
  };

  const handleAnswerCounterExample = () => {
    if (!counterResponse.trim()) return;
    setCounterAnswered(true);

    setTrajectorySteps((prev) => [
      ...prev,
      {
        id: `step_probe_${Date.now()}`,
        phase: "counter_example_probe",
        title: "Counterexample Stress Probe Resolved",
        content: `Candidate reasoned: "${counterResponse.slice(0, 100)}..."`,
        timestamp: new Date().toLocaleTimeString(),
        status: "info",
      },
    ]);
  };

  const handleFinishCoding = () => {
    const updatedComp = {
      technical_depth: Math.min(0.95, (profile.competencies?.technical_depth || 0.7) + 0.06),
      system_design: Math.min(0.95, (profile.competencies?.system_design || 0.65) + 0.05),
      problem_solving: Math.min(0.98, (profile.competencies?.problem_solving || 0.75) + 0.08),
      communication_clarity: profile.competencies?.communication_clarity || 0.7,
      ownership_specificity: Math.min(0.95, (profile.competencies?.ownership_specificity || 0.65) + 0.04),
    };

    saveStoredProfile({ competencies: updatedComp });
    setProfile({ competencies: updatedComp });

    saveSessionToHistory({
      session_id: `coding-session-${Date.now()}`,
      candidate_name: profile.name,
      target_role: profile.targetRole,
      last_updated: new Date().toISOString(),
      duration_minutes: 35,
      overall_score: 0.88,
      competencies: updatedComp,
      evidence_log: [
        {
          turn_id: 1,
          competency: "Data Structure Selection",
          quote: "Chose Doubly Linked List + Hash Map to guarantee O(1) key promotion and eviction.",
          signal: "substantiated",
          observation: "Optimal approach formulation with strict asymptotic complexity awareness.",
          pressure_level: 2,
        },
        {
          turn_id: 2,
          competency: "Concurrency & Clock Drift Defense",
          quote: counterResponse || "Used monotonic clock time (`time.monotonic()`) rather than wall clock.",
          signal: "substantiated",
          observation: "Demonstrated production-grade resilience against NTP skew and clock adjustments.",
          pressure_level: 5,
        },
      ],
      identified_strengths: [
        "Flawless O(1) doubly linked list node pointer manipulation.",
        "Demonstrated deep understanding of monotonic time vs wall-clock skew in distributed systems.",
      ],
      areas_for_improvement: [
        "Consider discussing active memory reclamation thread pool trade-offs versus lazy eviction.",
      ],
      actionable_tips: [
        "In production caches, pair lazy TTL checks with a probabilistic sampled background cleaner (like Redis `activeExpireCycle`).",
      ],
      reasoning_trajectory: trajectorySteps,
    });

    router.push("/report");
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl dev-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cobalt/10 border border-cobalt/20 flex items-center justify-center text-cobalt">
            <Code2 className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-zinc-900">
                AI Coding Round • Reasoning Trajectory Mode
              </span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-cobalt/10 text-cobalt border border-cobalt/20 font-bold">
                DIFFICULTY: {selectedChallenge.difficulty.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-mono">
              Problem: {selectedChallenge.title} • Time Limit: {selectedChallenge.timeLimitMinutes} min
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleFinishCoding}
            className="btn-primary-action !py-2 !px-4 !text-xs shadow-sm !bg-zinc-900 hover:!bg-zinc-800"
          >
            <span>Submit Solution & View Report</span>
            <ArrowRight className="w-4 h-4 stroke-[2]" />
          </button>
        </div>
      </div>

      {/* Main 2-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Problem & Reasoning Trajectory (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Problem Statement Card */}
          <div className="dev-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h2 className="text-base font-bold text-zinc-900">
                {selectedChallenge.title}
              </h2>
              <span className="font-mono text-xs text-zinc-500">
                Track: {selectedChallenge.track}
              </span>
            </div>

            <div className="text-xs text-zinc-700 leading-relaxed whitespace-pre-wrap font-sans">
              {selectedChallenge.description}
            </div>

            {/* Constraints */}
            <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-xs space-y-1">
              <span className="font-mono text-[10px] uppercase text-zinc-500 font-bold block">
                Constraints:
              </span>
              <ul className="space-y-1 text-zinc-600 font-mono text-[11px]">
                {selectedChallenge.constraints.map((c, i) => (
                  <li key={i}>• {c}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Reasoning Trajectory Logger */}
          <div className="dev-card p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-iris" />
                <span className="font-bold text-xs text-zinc-900">
                  Candidate Reasoning Trajectory
                </span>
              </div>
              <span className="font-mono text-[10px] text-zinc-400">
                {trajectorySteps.length} Steps Recorded
              </span>
            </div>

            <div className="space-y-2">
              {trajectorySteps.map((step) => (
                <div
                  key={step.id}
                  className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs space-y-0.5"
                >
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="text-iris font-bold uppercase">{step.title}</span>
                    <span className="text-zinc-400">{step.timestamp}</span>
                  </div>
                  <p className="text-zinc-700 text-[11px] leading-snug">{step.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Adaptive Counterexample Stress Probe */}
          <div className="dev-card p-5 space-y-3 border-coral/40 bg-coral/5">
            <div className="flex items-center gap-2 text-coral font-mono font-bold text-xs">
              <Zap className="w-4 h-4" />
              <span>ADAPTIVE STRESS PROBE (COUNTEREXAMPLE)</span>
            </div>

            <div className="text-xs text-zinc-800 space-y-1">
              <div className="font-bold">
                {selectedChallenge.counterExamples[0].title}
              </div>
              <p className="text-zinc-600 text-[11px] leading-relaxed">
                {selectedChallenge.counterExamples[0].scenario}
              </p>
              <p className="font-semibold text-zinc-900 pt-1 text-[11px]">
                {selectedChallenge.counterExamples[0].probeQuestion}
              </p>
            </div>

            {!counterAnswered ? (
              <div className="space-y-2 pt-1">
                <textarea
                  rows={3}
                  value={counterResponse}
                  onChange={(e) => setCounterResponse(e.target.value)}
                  placeholder="Explain your mitigation (e.g. using monotonic clocks, active background sampling)..."
                  className="w-full p-2 text-xs rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-iris/20 bg-white"
                />
                <button
                  onClick={handleAnswerCounterExample}
                  className="btn-primary-action !py-1.5 !px-3 !text-xs !bg-coral hover:!bg-coral/90"
                >
                  <span>Submit Stress-Probe Defense</span>
                </button>
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-sprout/10 border border-sprout/20 text-xs text-sprout font-mono">
                ✓ Defense recorded and integrated into Candidate Evidence Graph.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Code Editor & Test Console (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Approach & Complexity Formulation Bar */}
          <div className="dev-card p-4 space-y-3">
            <div className="text-xs font-mono font-bold text-zinc-700 uppercase">
              1. Approach Formulation & Complexity Hypothesis
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 mb-1">
                  Time Complexity (Expected)
                </label>
                <input
                  type="text"
                  value={complexityTime}
                  onChange={(e) => setComplexityTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-zinc-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 mb-1">
                  Space Complexity (Expected)
                </label>
                <input
                  type="text"
                  value={complexitySpace}
                  onChange={(e) => setComplexitySpace(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-zinc-200 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Code Editor Surface */}
          <div className="rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 overflow-hidden shadow-xl">
            {/* Editor Toolbar */}
            <div className="px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 mr-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                </div>
                <span className="font-mono text-xs text-zinc-400 font-medium">
                  solution.{selectedLang === "python" ? "py" : selectedLang === "typescript" ? "ts" : "go"}
                </span>
              </div>

              {/* Language Switcher */}
              <div className="flex items-center gap-1 font-mono text-xs">
                {(["python", "typescript", "go"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`px-2.5 py-1 rounded text-[11px] capitalize transition-colors ${
                      selectedLang === lang
                        ? "bg-iris text-white font-bold"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Input */}
            <textarea
              rows={18}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-4 font-mono text-xs bg-zinc-950 text-emerald-300 focus:outline-none resize-none leading-relaxed selection:bg-iris/30"
              spellCheck={false}
            />

            {/* Run Button Bar */}
            <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between">
              <div className="font-mono text-[11px] text-zinc-500">
                Evaluates O(1) access & eviction resilience
              </div>
              <button
                onClick={handleRunTests}
                disabled={runningTests}
                className="btn-primary-action !py-2 !px-5 !text-xs !bg-sprout hover:!bg-emerald-600 shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{runningTests ? "Executing Tests..." : "Run Test Suite"}</span>
              </button>
            </div>
          </div>

          {/* Test Results Console */}
          {testResults && (
            <div className="dev-card p-4 space-y-3 bg-zinc-900 border-zinc-800 text-zinc-200">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-lime">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ALL TEST CASES PASSED</span>
                </div>
                <span className="font-mono text-[11px] text-zinc-400">Total Latency: 0.54ms</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                {testResults.details.map((d) => (
                  <div
                    key={d.caseId}
                    className="p-2 rounded bg-zinc-950 border border-zinc-800 flex items-center justify-between"
                  >
                    <span className="text-zinc-400">Case #{d.caseId}</span>
                    <span className="text-lime">{d.runtime}</span>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-zinc-400 font-mono">
                {testResults.output}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
