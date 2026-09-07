"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Code2,
  Zap,
  Brain,
  Target,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Play,
  Database,
  GitBranch,
  Cpu,
} from "lucide-react";
import { startAssessment } from "@/lib/codingApi";

const FEATURES = [
  {
    icon: Code2,
    title: "Monaco Editor",
    desc: "VS Code-powered editor with syntax highlighting and autocomplete",
  },
  {
    icon: Database,
    title: "Hidden Test Cases",
    desc: "Secure execution against visible + hidden test cases you can't see",
  },
  {
    icon: Brain,
    title: "Adaptive Selection",
    desc: "Questions selected dynamically based on your demonstrated skill profile",
  },
  {
    icon: Zap,
    title: "AST Analysis",
    desc: "Tree-sitter parses your code to detect complexity signals and patterns",
  },
  {
    icon: GitBranch,
    title: "15 Canonical Problems",
    desc: "From Two Sum to Course Schedule — spanning arrays, graphs, and DP",
  },
  {
    icon: Target,
    title: "Candidate Report",
    desc: "Evidence-backed report with skill profile and hiring calibration",
  },
];

const PROBLEMS_PREVIEW = [
  { title: "Two Sum", tag: "Easy", skills: "Arrays · Hashmap" },
  { title: "Longest Substring", tag: "Medium", skills: "Sliding Window · Hashmap" },
  { title: "Coin Change", tag: "Medium", skills: "Dynamic Programming" },
  { title: "Course Schedule", tag: "Hard", skills: "Graphs · Topological Sort" },
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
      setError("Failed to start assessment. Make sure the backend is running.");
      setIsStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0f0f10] text-white py-20">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% -10%, #6a5ed9 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#6a5ed9]/10 border border-[#6a5ed9]/20 text-[#6a5ed9] text-xs font-mono font-bold">
            <Cpu className="w-3.5 h-3.5" />
            Adaptive AI Coding Assessment
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            Prove Your Skills.
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #6a5ed9, #3f71d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Not Your Luck.
            </span>
          </h1>

          <p className="text-zinc-400 text-lg leading-relaxed max-w-xl mx-auto">
            An adaptive coding engine that selects problems based on your demonstrated
            skills — not randomly. Code in Monaco, executed against hidden tests, analyzed
            with Tree-sitter.
          </p>

          {/* Configuration */}
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 bg-[#1a1a1e] border border-[#2a2a2e] rounded-lg px-4 py-2">
              <span className="text-zinc-500 text-sm font-mono">Questions:</span>
              {[5, 7, 10].map((n) => (
                <button
                  key={n}
                  onClick={() => setQuestions(n)}
                  className={`w-7 h-7 rounded text-sm font-bold font-mono transition-all ${
                    questions === n
                      ? "bg-[#6a5ed9] text-white"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button
            id="start-assessment-btn"
            onClick={handleStart}
            disabled={isStarting}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-[#6a5ed9] hover:bg-[#7b6fe0] text-white font-bold text-lg transition-all disabled:opacity-50 shadow-lg shadow-[#6a5ed9]/20"
          >
            {isStarting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Starting Assessment…
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                Start Coding Assessment
              </>
            )}
          </button>

          {error && (
            <p className="text-red-400 text-sm bg-red-950/20 border border-red-900/30 rounded-lg px-4 py-2 inline-block">
              {error}
            </p>
          )}

          <p className="text-zinc-600 text-xs font-mono">
            {questions} questions · 60 min · Python, JavaScript, C++
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-center text-2xl font-bold text-zinc-900 mb-10">
          Built differently from other coding platforms
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="dev-card p-5 space-y-3 hover:border-zinc-300 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-[#6a5ed9]/10 border border-[#6a5ed9]/20 flex items-center justify-center">
                <f.icon className="w-4.5 h-4.5 text-[#6a5ed9]" />
              </div>
              <h3 className="font-bold text-zinc-900 text-sm">{f.title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Problem preview */}
      <section className="bg-[#f4f4f5] border-t border-zinc-200 py-14">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-xl font-bold text-zinc-900 mb-2">
            15 canonical problems
          </h2>
          <p className="text-sm text-zinc-500 mb-8">
            Carefully curated to test foundational algorithmic skills. Which ones you see depends on your performance.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PROBLEMS_PREVIEW.map((p) => (
              <div
                key={p.title}
                className="dev-card px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-medium text-zinc-800">{p.title}</div>
                  <div className="text-xs text-zinc-500 font-mono">{p.skills}</div>
                </div>
                <span
                  className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border uppercase ${
                    p.tag === "Easy"
                      ? "text-emerald-600 bg-emerald-50 border-emerald-200"
                      : p.tag === "Medium"
                      ? "text-amber-600 bg-amber-50 border-amber-200"
                      : "text-red-600 bg-red-50 border-red-200"
                  }`}
                >
                  {p.tag}
                </span>
              </div>
            ))}
            <div className="dev-card px-4 py-3 flex items-center gap-2 text-zinc-400 text-sm col-span-full sm:col-span-2">
              <span>+11 more problems across arrays, trees, graphs, and DP</span>
              <ArrowRight className="w-3.5 h-3.5 ml-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-xl font-bold text-zinc-900 mb-8">How adaptive selection works</h2>
        <div className="space-y-4">
          {[
            { step: "1", title: "Start with Easy", desc: "First question is always foundational — Arrays or Strings." },
            { step: "2", title: "Code & Submit", desc: "Your code runs in an isolated subprocess against visible + hidden tests." },
            { step: "3", title: "AST Analysis", desc: "Tree-sitter parses your code to detect nested loops, recursion, data structures, and complexity signals." },
            { step: "4", title: "Profile Update", desc: "Your skill profile updates deterministically based on pass rate, efficiency, and attempt count." },
            { step: "5", title: "Adaptive Selection", desc: "Next question is chosen to maximize information about weak and uncertain skills." },
            { step: "6", title: "Evidence Report", desc: "Final report maps every score claim back to recorded execution evidence." },
          ].map((item) => (
            <div key={item.step} className="flex gap-4 items-start">
              <div className="w-7 h-7 rounded-full bg-[#6a5ed9] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {item.step}
              </div>
              <div>
                <div className="text-sm font-bold text-zinc-800">{item.title}</div>
                <div className="text-xs text-zinc-500 leading-relaxed">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={handleStart}
            disabled={isStarting}
            className="btn-primary-action gap-2"
          >
            {isStarting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            Begin Assessment
          </button>
        </div>
      </section>
    </div>
  );
}
