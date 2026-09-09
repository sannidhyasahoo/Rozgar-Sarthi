"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Code2,
  Zap,
  Brain,
  Target,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Play,
  Database,
  GitBranch,
  Cpu,
  Terminal,
  ShieldCheck,
  Clock,
  Sparkles,
  Layers,
  Lock,
} from "lucide-react";
import { startAssessment } from "@/lib/codingApi";

const CHAMBER_PROTOCOLS = [
  {
    step: "01",
    title: "Interactive Compiler & Subprocess Sandbox",
    desc: "Execute code on demand against sample test fixtures. View live stdout, stderr, and execution timings directly inside the editor.",
    tag: "Subprocess Execution",
  },
  {
    step: "02",
    title: "Hidden Stress & Edge Case Verification",
    desc: "Submissions are benchmarked against private scale constraints, memory budgets, and adversarial boundary cases.",
    tag: "Private Test Suite",
  },
  {
    step: "03",
    title: "Polyglot Language Flexibility",
    desc: "Select Python 3.11, Node.js 20, or C++ 20 per challenge. Language switches preserve code buffers independently.",
    tag: "Multiple Runtimes",
  },
  {
    step: "04",
    title: "Continuous State Synchronization",
    desc: "Keystrokes, buffer edits, and remaining assessment duration are continuously synced. Accidental tab closures will not reset progress.",
    tag: "Auto-Save Active",
  },
];

const QUESTION_CONFIGS = [
  {
    count: 5,
    label: "5 Challenges",
    duration: "~45 min",
    desc: "Rapid diagnostic probe for core algorithmic patterns",
  },
  {
    count: 7,
    label: "7 Challenges",
    duration: "~60 min",
    desc: "Standard full track across data structures & AST depth",
    recommended: true,
  },
  {
    count: 10,
    label: "10 Challenges",
    duration: "~90 min",
    desc: "Deep architectural assessment spanning DP and graph topologies",
  },
];

export default function CodingHubPage() {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState(7);

  const handleStart = async () => {
    setIsStarting(true);
    setError(null);
    try {
      const state = await startAssessment(questions);
      router.push(`/coding/assessment/${state.assessmentId}`);
    } catch (err) {
      setError("Failed to start assessment. Please ensure the backend server is running.");
      setIsStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#08070c] text-zinc-900 dark:text-zinc-100 pb-24 transition-colors duration-200">
      {/* ── Sub Navigation Bar ────────────────────────────────────────── */}
      <div className="border-b border-zinc-200 dark:border-[#1f1c2b] bg-white/80 dark:bg-[#0e0d14]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-50 dark:bg-[#12111a] hover:bg-zinc-100 dark:hover:bg-[#181622] border border-zinc-200 dark:border-[#1f1c2b] transition-colors shadow-2xs group"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-zinc-500 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Dashboard</span>
            </Link>

            <div className="h-4 w-px bg-zinc-200 dark:bg-[#1f1c2b] hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
              </span>
              <span className="text-xs font-mono font-medium text-zinc-600 dark:text-zinc-400">
                Monaco IDE Sandbox Ready
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleStart}
              disabled={isStarting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-zinc-900 dark:bg-iris hover:bg-zinc-800 dark:hover:bg-iris/90 text-white text-xs font-mono font-semibold shadow-sm shadow-iris/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isStarting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Launching IDE...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current text-iris-light dark:text-white" />
                  <span>Start Coding Round</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* ── Title & Intro Header ─────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-[#1f1c2b]">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-iris/10 dark:bg-iris/20 border border-iris/20 text-iris dark:text-iris-light text-[11px] font-mono font-semibold mb-2">
              <Code2 className="w-3 h-3 text-iris" />
              <span>ROUND 02 • ALGORITHMIC ASSESSMENT CHAMBER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Adaptive Coding Environment
            </h1>
            <p className="text-sm text-zinc-500 dark:text-[#9e98b7] mt-1 max-w-2xl leading-relaxed">
              Solve engineering challenges in a full-screen VS Code Monaco editor. 
              Solutions are securely executed against hidden test cases and analyzed with Tree-sitter AST parsing.
            </p>
          </div>

          {/* Quick Environment Badges */}
          <div className="flex items-center gap-2 bg-white dark:bg-[#12111a] p-2.5 rounded-2xl border border-zinc-200 dark:border-[#1f1c2b] shadow-2xs self-start md:self-auto font-mono text-xs text-zinc-600 dark:text-zinc-300">
            <div className="w-8 h-8 rounded-xl bg-iris/10 dark:bg-iris/20 border border-iris/20 flex items-center justify-center text-iris dark:text-iris-light">
              <Terminal className="w-4 h-4" />
            </div>
            <div className="pr-1">
              <div className="font-bold text-zinc-900 dark:text-zinc-100">Python · JS · C++</div>
              <div className="text-[10px] text-zinc-400 dark:text-zinc-500">Tree-sitter AST Sentry</div>
            </div>
          </div>
        </div>

        {/* ── 2-Column Bento Grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── Left Column (7 cols): Chamber Launch & Curriculum ──────────── */}
          <div className="lg:col-span-7 space-y-6">
            {/* Card 1: Session Configuration & Quick Launch */}
            <div className="bg-white dark:bg-[#12111a] rounded-2xl border border-zinc-200/90 dark:border-[#1f1c2b] shadow-2xs p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-[#1a1726] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-iris/20 text-indigo-600 dark:text-iris flex items-center justify-center font-mono text-xs font-bold">
                    01
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase font-mono tracking-wider">
                      Assessment Track Configuration
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-[#9e98b7]">Select challenge depth and time budget</p>
                  </div>
                </div>
                <Clock className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
              </div>

              {/* Question Count Selection Tiles */}
              <div className="space-y-3">
                <label className="block text-xs font-mono text-zinc-700 dark:text-zinc-300 font-semibold uppercase tracking-wider">
                  Select Question Volume:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {QUESTION_CONFIGS.map((cfg) => {
                    const isSelected = questions === cfg.count;
                    return (
                      <button
                        type="button"
                        key={cfg.count}
                        onClick={() => setQuestions(cfg.count)}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "border-iris bg-iris/10 dark:bg-iris/20 ring-2 ring-iris/30 shadow-xs"
                            : "border-zinc-200 dark:border-[#1f1c2b] hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-[#0e0d14] hover:bg-white dark:hover:bg-[#151320]"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span
                              className={`text-xs font-mono font-bold ${
                                isSelected ? "text-iris dark:text-white" : "text-zinc-900 dark:text-zinc-200"
                              }`}
                            >
                              {cfg.label}
                            </span>
                            {cfg.recommended && (
                              <span className="text-[9px] font-mono font-bold bg-iris/15 text-iris dark:bg-iris/30 dark:text-iris-light px-1.5 py-0.5 rounded">
                                Recommended
                              </span>
                            )}
                          </div>
                          <div className={`text-[11px] font-mono font-semibold ${
                            isSelected ? "text-iris/80 dark:text-iris-light/90" : "text-zinc-500 dark:text-zinc-400"
                          }`}>
                            {cfg.duration}
                          </div>
                        </div>
                        <div className={`text-[10px] mt-2 leading-relaxed ${
                          isSelected ? "text-zinc-600 dark:text-zinc-300" : "text-zinc-500 dark:text-zinc-400"
                        }`}>
                          {cfg.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Supported Language Chips */}
              <div className="pt-2 border-t border-zinc-100 dark:border-[#1a1726] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                <span className="text-zinc-500 dark:text-[#9e98b7]">Supported In-Chamber Runtimes:</span>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-[#181622] border border-zinc-200 dark:border-[#221e33] text-zinc-700 dark:text-zinc-300 font-bold">
                    Python 3.11
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-[#181622] border border-zinc-200 dark:border-[#221e33] text-zinc-700 dark:text-zinc-300 font-bold">
                    Node.js 20
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-[#181622] border border-zinc-200 dark:border-[#221e33] text-zinc-700 dark:text-zinc-300 font-bold">
                    C++ 20 (GCC)
                  </span>
                </div>
              </div>

              {/* Launch Action Button */}
              <div className="pt-3">
                <button
                  id="start-assessment-btn"
                  onClick={handleStart}
                  disabled={isStarting}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-iris hover:bg-iris/90 text-white font-mono text-sm font-bold shadow-md shadow-iris/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {isStarting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Initializing Isolated Subprocess Session...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current text-white/90" />
                      <span>Launch Monaco IDE ({questions} Questions · Timed Assessment)</span>
                    </>
                  )}
                </button>

                {error && (
                  <p className="mt-3 text-red-600 dark:text-red-400 text-xs font-mono bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 rounded-xl px-4 py-2.5">
                    {error}
                  </p>
                )}
              </div>
            </div>

            {/* Card 2: Examination Guidelines & Integrity Protocol */}
            <div className="bg-white dark:bg-[#12111a] rounded-2xl border border-zinc-200/90 dark:border-[#1f1c2b] shadow-2xs p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-[#1a1726] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-iris/20 text-indigo-600 dark:text-iris flex items-center justify-center font-mono text-xs font-bold">
                    02
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase font-mono tracking-wider">
                      Examination Guidelines & Integrity Protocol
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-[#9e98b7]">Read carefully before initiating your timed assessment session</p>
                  </div>
                </div>
                <ShieldCheck className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
              </div>

              {/* Confidential Sealed Notice */}
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#0e0d14] border border-zinc-200/90 dark:border-[#1f1c2b] flex items-start gap-3">
                <Lock className="w-4 h-4 text-zinc-700 dark:text-zinc-300 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-zinc-900 dark:text-white font-mono">Confidential Blind Testing:</span>{" "}
                  <span className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    All problem statements, constraints, and test fixtures are sealed to ensure an authentic evaluation of your real-time engineering ability. Challenges are dynamically revealed in the Monaco IDE chamber once your session begins.
                  </span>
                </div>
              </div>

              {/* Protocol Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CHAMBER_PROTOCOLS.map((protocol) => (
                  <div
                    key={protocol.step}
                    className="p-3.5 rounded-xl bg-zinc-50/70 dark:bg-[#0e0d14] border border-zinc-200/80 dark:border-[#1f1c2b] hover:bg-white dark:hover:bg-[#151320] hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-mono font-bold text-indigo-600 dark:text-iris">
                          [{protocol.step}]
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-[#181622] border border-zinc-200 dark:border-[#221e33] text-zinc-600 dark:text-zinc-300 font-medium">
                          {protocol.tag}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-zinc-900 dark:text-white">
                        {protocol.title}
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-[#9e98b7] mt-1 leading-relaxed">
                        {protocol.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Integrity Guidelines Footer */}
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#0e0d14] border border-zinc-200 dark:border-[#1f1c2b] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-200 font-medium">
                  <ShieldCheck className="w-4 h-4 text-iris shrink-0" />
                  <span>Tree-sitter AST Plagiarism & Sentry Telemetry Active</span>
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">
                  Standard Library Permitted
                </span>
              </div>
            </div>
          </div>

          {/* ── Right Column (5 cols): Architecture & Evaluation Engine ────── */}
          <div className="lg:col-span-5 space-y-6">
            {/* Card 3: Tree-sitter & AST Sentry Architecture */}
            <div className="bg-white dark:bg-[#12111a] text-zinc-900 dark:text-zinc-200 rounded-2xl p-6 border border-zinc-200/90 dark:border-[#1f1c2b] shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-[#1a1726] pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                    Tree-sitter AST & Evaluation Pipeline
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">
                  Real-time AST
                </span>
              </div>

              <p className="text-xs text-zinc-500 dark:text-[#9e98b7] leading-relaxed">
                Your code is not just checked for test cases. An automated AST sentry inspects syntax trees for complexity patterns:
              </p>

              <div className="space-y-3 pt-1 text-xs font-mono">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-[#0e0d14] border border-zinc-200 dark:border-[#1f1c2b] space-y-1">
                  <div className="text-indigo-600 dark:text-iris font-bold flex items-center gap-2">
                    <span>[01] Isolated Execution Sandbox</span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                    Evaluated against visible edge cases plus hidden adversarial tests in a secure subprocess.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-[#0e0d14] border border-zinc-200 dark:border-[#1f1c2b] space-y-1">
                  <div className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-2">
                    <span>[02] Tree-sitter AST Complexity</span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                    Detects nested iteration loops, recursion depth, memory allocations, and helper structure overhead.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-[#0e0d14] border border-zinc-200 dark:border-[#1f1c2b] space-y-1">
                  <div className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-2">
                    <span>[03] Bayesian Skill Graph Update</span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                    Recalibrates candidate skill nodes after every submission to pick the optimal subsequent challenge.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
