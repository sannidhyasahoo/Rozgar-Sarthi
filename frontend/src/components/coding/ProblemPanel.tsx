"use client";
// components/coding/ProblemPanel.tsx

import { CodingProblem, DIFFICULTY_COLORS } from "@/lib/codingApi";
import { Tag, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface Submission {
  attemptNumber: number;
  isRun: boolean;
  status: string | null;
  passedTests: number;
  totalTests: number;
}

interface ProblemPanelProps {
  problem: CodingProblem;
  submissions: Submission[];
}

export function ProblemPanel({ problem, submissions }: ProblemPanelProps) {
  const [showHistory, setShowHistory] = useState(false);

  const diffColor = DIFFICULTY_COLORS[problem.difficultyLabel] ?? "text-zinc-500 bg-zinc-100 border-zinc-200";
  const submitSubs = submissions.filter((s) => !s.isRun);

  return (
    <div className="flex flex-col h-full bg-[#111113] text-zinc-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-[#2a2a2e] shrink-0">
        <div className="flex items-start gap-2 mb-2">
          <h2 className="text-base font-bold text-white leading-snug flex-1">
            {problem.title}
          </h2>
          <span
            className={`shrink-0 text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wide ${diffColor}`}
          >
            {problem.difficultyLabel}
          </span>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            ~{problem.estimatedMinutes}m
          </span>
          <span className="flex items-center gap-1">
            <Tag className="w-3 h-3" />
            {problem.topics.slice(0, 3).join(", ")}
          </span>
        </div>
      </div>

      {/* Body — scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-4 space-y-5">
          {/* Description */}
          <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
            {problem.description}
          </div>

          {/* Examples */}
          {problem.examples.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
                Examples
              </h3>
              {problem.examples.map((ex, i) => (
                <div
                  key={i}
                  className="bg-[#1a1a1e] rounded-lg p-3 text-xs font-mono border border-[#2a2a2e] space-y-1"
                >
                  <div>
                    <span className="text-zinc-500">Input: </span>
                    <span className="text-zinc-200">{ex.input}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Output: </span>
                    <span className="text-[#1bb152] font-semibold">{ex.output}</span>
                  </div>
                  {ex.explanation && (
                    <div className="text-zinc-500 mt-1 leading-relaxed font-sans text-[11px]">
                      {ex.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Constraints */}
          {problem.constraints.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
                Constraints
              </h3>
              <ul className="space-y-1">
                {problem.constraints.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                    <span className="text-zinc-600 mt-0.5">•</span>
                    <code className="font-mono">{c}</code>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Expected complexity hint */}
          {problem.expectedComplexity && (
            <div className="bg-[#1a1a1e] border border-[#2a2a2e] rounded-lg p-3 space-y-1">
              <h3 className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                Expected Complexity
              </h3>
              <div className="flex gap-4 text-xs font-mono">
                <span className="text-zinc-500">
                  Time:{" "}
                  <span className="text-[#6a5ed9]">{problem.expectedComplexity.time}</span>
                </span>
                <span className="text-zinc-500">
                  Space:{" "}
                  <span className="text-[#6a5ed9]">{problem.expectedComplexity.space}</span>
                </span>
              </div>
            </div>
          )}

          {/* Submission history */}
          {submitSubs.length > 0 && (
            <div>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-widest hover:text-zinc-300 transition-colors w-full"
              >
                <span>Attempt History ({submitSubs.length})</span>
                {showHistory ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
              </button>

              {showHistory && (
                <div className="mt-2 space-y-1.5">
                  {submitSubs.map((sub) => {
                    const passed = sub.status === "ACCEPTED";
                    const pct = sub.totalTests
                      ? Math.round((sub.passedTests / sub.totalTests) * 100)
                      : 0;
                    return (
                      <div
                        key={sub.attemptNumber}
                        className={`flex items-center justify-between text-xs px-3 py-2 rounded-md border ${
                          passed
                            ? "border-emerald-800/40 bg-emerald-900/10 text-emerald-400"
                            : "border-[#2a2a2e] bg-[#1a1a1e] text-zinc-400"
                        }`}
                      >
                        <span className="font-mono">Attempt {sub.attemptNumber}</span>
                        <span className="font-mono">
                          {sub.passedTests}/{sub.totalTests} tests
                          <span className="ml-2 text-[10px] opacity-70">({pct}%)</span>
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase ${
                            passed ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {sub.status?.replace("_", " ")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
