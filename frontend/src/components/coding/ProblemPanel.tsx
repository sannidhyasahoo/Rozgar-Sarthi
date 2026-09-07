"use client";
// components/coding/ProblemPanel.tsx

import React, { useState } from "react";
import { MarkdownView } from "@/components/shared/MarkdownView";
import {
  FileText,
  BookOpen,
  History,
  Clock,
  Tag,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  Lightbulb,
} from "lucide-react";
import { CodingProblem } from "@/lib/codingApi";

interface Submission {
  attemptNumber: number;
  isRun: boolean;
  status: string | null;
  passedTests: number;
  totalTests: number;
  language?: string;
  executionTimeMs?: number;
}

interface ProblemPanelProps {
  problem: CodingProblem;
  submissions: Submission[];
  theme?: "dark" | "light";
  questionIndex?: number;
}

export function ProblemPanel({
  problem,
  submissions,
  theme = "dark",
  questionIndex = 0,
}: ProblemPanelProps) {
  const [activeTab, setActiveTab] = useState<"description" | "editorial" | "submissions">("description");

  const isDark = theme === "dark";

  // LeetCode style difficulty styling
  const getDifficultyBadge = (label: string) => {
    switch (label.toLowerCase()) {
      case "easy":
        return {
          text: "text-[#00b8a3]",
          bg: isDark ? "bg-[#00b8a3]/10 border-[#00b8a3]/30" : "bg-[#00b8a3]/15 border-[#00b8a3]/40",
        };
      case "medium":
        return {
          text: "text-[#ffc01e]",
          bg: isDark ? "bg-[#ffc01e]/10 border-[#ffc01e]/30" : "bg-[#ffc01e]/15 border-[#ffc01e]/40",
        };
      case "hard":
        return {
          text: "text-[#ff375f]",
          bg: isDark ? "bg-[#ff375f]/10 border-[#ff375f]/30" : "bg-[#ff375f]/15 border-[#ff375f]/40",
        };
      default:
        return {
          text: "text-zinc-400",
          bg: "bg-zinc-500/10 border-zinc-500/30",
        };
    }
  };

  const diffStyle = getDifficultyBadge(problem.difficultyLabel);
  const submitSubs = submissions.filter((s) => !s.isRun);

  return (
    <div
      className={`flex flex-col h-full overflow-hidden transition-colors duration-200 ${
        isDark ? "bg-[#18181b] text-zinc-200" : "bg-white text-zinc-800"
      }`}
    >
      {/* ── Top Tabs (LeetCode style) ─────────────────────────────────── */}
      <div
        className={`flex items-center px-2 border-b shrink-0 transition-colors duration-200 ${
          isDark ? "bg-[#1f1f23] border-[#2e2e33]" : "bg-zinc-100/90 border-zinc-200"
        }`}
      >
        <button
          onClick={() => setActiveTab("description")}
          className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-all ${
            activeTab === "description"
              ? isDark
                ? "border-white text-white font-semibold"
                : "border-zinc-900 text-zinc-900 font-semibold"
              : isDark
              ? "border-transparent text-zinc-400 hover:text-zinc-200"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-[#00b8a3]" />
          <span>Description</span>
        </button>

        <button
          onClick={() => setActiveTab("editorial")}
          className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-all ${
            activeTab === "editorial"
              ? isDark
                ? "border-white text-white font-semibold"
                : "border-zinc-900 text-zinc-900 font-semibold"
              : isDark
              ? "border-transparent text-zinc-400 hover:text-zinc-200"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-[#ffc01e]" />
          <span>Editorial</span>
        </button>

        <button
          onClick={() => setActiveTab("submissions")}
          className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-all ${
            activeTab === "submissions"
              ? isDark
                ? "border-white text-white font-semibold"
                : "border-zinc-900 text-zinc-900 font-semibold"
              : isDark
              ? "border-transparent text-zinc-400 hover:text-zinc-200"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          <History className="w-3.5 h-3.5 text-[#6a5ed9]" />
          <span>Submissions</span>
          {submitSubs.length > 0 && (
            <span
              className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                isDark ? "bg-[#2a2a2e] text-zinc-300" : "bg-zinc-200 text-zinc-700"
              }`}
            >
              {submitSubs.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Scrollable Tab Content ───────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {/* TAB 1: DESCRIPTION */}
        {activeTab === "description" && (
          <div className="p-5 space-y-6">
            {/* Title & Difficulty Pill */}
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-3">
                <h1
                  className={`text-lg font-bold tracking-tight ${
                    isDark ? "text-white" : "text-zinc-900"
                  }`}
                >
                  {questionIndex + 1}. {problem.title}
                </h1>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${diffStyle.bg} ${diffStyle.text}`}
                >
                  {problem.difficultyLabel}
                </span>

                <div
                  className={`flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border ${
                    isDark
                      ? "bg-[#242429] border-[#333338] text-zinc-400"
                      : "bg-zinc-100 border-zinc-200 text-zinc-600"
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  <span>~{problem.estimatedMinutes} mins</span>
                </div>
              </div>

              {/* Topics chips */}
              {problem.topics.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap mt-3">
                  {problem.topics.map((t) => (
                    <span
                      key={t}
                      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border transition-colors ${
                        isDark
                          ? "bg-[#222227] border-[#313138] text-zinc-400 hover:text-zinc-200"
                          : "bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-zinc-900"
                      }`}
                    >
                      <Tag className="w-2.5 h-2.5 text-zinc-400" />
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Markdown Description */}
            <MarkdownView content={problem.description} isDark={isDark} />

            {/* Examples (LeetCode formatted cards) */}
            {problem.examples.length > 0 && (
              <div className="space-y-4">
                {problem.examples.map((ex, i) => (
                  <div key={i} className="space-y-1.5">
                    <h3
                      className={`text-xs font-semibold ${
                        isDark ? "text-zinc-300" : "text-zinc-800"
                      }`}
                    >
                      Example {i + 1}:
                    </h3>
                    <div
                      className={`p-3 rounded-lg font-mono text-xs border space-y-1.5 transition-colors ${
                        isDark
                          ? "bg-[#202024] border-[#2f2f35]"
                          : "bg-zinc-50 border-zinc-200 shadow-sm"
                      }`}
                    >
                      <div>
                        <span className={isDark ? "text-zinc-400 font-semibold" : "text-zinc-500 font-semibold"}>
                          Input:{" "}
                        </span>
                        <span className={isDark ? "text-zinc-200" : "text-zinc-800"}>
                          {ex.input}
                        </span>
                      </div>
                      <div>
                        <span className={isDark ? "text-zinc-400 font-semibold" : "text-zinc-500 font-semibold"}>
                          Output:{" "}
                        </span>
                        <span className="text-[#00b8a3] font-bold">
                          {ex.output}
                        </span>
                      </div>
                      {ex.explanation && (
                        <div className="pt-1.5 border-t border-dashed border-zinc-500/20 font-sans">
                          <span className={isDark ? "text-zinc-400 font-semibold text-xs" : "text-zinc-500 font-semibold text-xs"}>
                            Explanation:{" "}
                          </span>
                          <MarkdownView
                            content={ex.explanation}
                            isDark={isDark}
                            className="text-xs inline"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Constraints */}
            {problem.constraints.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-dashed border-zinc-500/20">
                <h3
                  className={`text-xs font-bold uppercase tracking-wider ${
                    isDark ? "text-zinc-400" : "text-zinc-600"
                  }`}
                >
                  Constraints:
                </h3>
                <ul className="space-y-1.5">
                  {problem.constraints.map((c, i) => (
                    <li
                      key={i}
                      className={`flex items-start gap-2 text-xs ${
                        isDark ? "text-zinc-400" : "text-zinc-600"
                      }`}
                    >
                      <span className="text-[#00b8a3] mt-0.5 font-bold">•</span>
                      <MarkdownView
                        content={c.includes('`') ? c : `\`${c}\``}
                        isDark={isDark}
                        className="text-xs font-mono"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EDITORIAL & SOLUTIONS */}
        {activeTab === "editorial" && (
          <div className="p-5 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-[#ffc01e]" />
                <h2
                  className={`text-sm font-bold uppercase tracking-wide ${
                    isDark ? "text-white" : "text-zinc-900"
                  }`}
                >
                  Editorial & Approach
                </h2>
              </div>
              <p
                className={`text-xs leading-relaxed ${
                  isDark ? "text-zinc-400" : "text-zinc-600"
                }`}
              >
                Key patterns, intuition, and complexity analysis for this problem.
              </p>
            </div>

            {/* Expected Complexity */}
            {problem.expectedComplexity && (
              <div
                className={`p-4 rounded-lg border space-y-2 ${
                  isDark
                    ? "bg-[#202024] border-[#2f2f35]"
                    : "bg-zinc-50 border-zinc-200"
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-indigo-400">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Target Complexity</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-1">
                  <div
                    className={`p-2 rounded border ${
                      isDark ? "bg-[#18181b] border-[#2a2a2e]" : "bg-white border-zinc-200"
                    }`}
                  >
                    <span className="text-zinc-400 block text-[10px] uppercase font-sans">Time</span>
                    <span className="font-bold text-[#00b8a3]">
                      {problem.expectedComplexity.time}
                    </span>
                  </div>
                  <div
                    className={`p-2 rounded border ${
                      isDark ? "bg-[#18181b] border-[#2a2a2e]" : "bg-white border-zinc-200"
                    }`}
                  >
                    <span className="text-zinc-400 block text-[10px] uppercase font-sans">Space</span>
                    <span className="font-bold text-[#6a5ed9]">
                      {problem.expectedComplexity.space}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Problem skills / patterns */}
            <div className="space-y-2">
              <h3
                className={`text-xs font-bold uppercase tracking-wider ${
                  isDark ? "text-zinc-400" : "text-zinc-600"
                }`}
              >
                Evaluated Skills:
              </h3>
              <div className="flex flex-wrap gap-2">
                {problem.skills.map((s) => (
                  <span
                    key={s}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-medium border ${
                      isDark
                        ? "bg-[#222227] border-[#313138] text-zinc-300"
                        : "bg-zinc-100 border-zinc-200 text-zinc-800"
                    }`}
                  >
                    #{s}
                  </span>
                ))}
              </div>
            </div>

            {/* Hint notes */}
            <div
              className={`p-3 rounded-lg border text-xs leading-relaxed ${
                isDark
                  ? "bg-amber-950/20 border-amber-900/30 text-amber-300/90"
                  : "bg-amber-50 border-amber-200 text-amber-900"
              }`}
            >
              <strong>Tip:</strong> Pay close attention to corner cases, such as empty inputs, single elements, and boundary values specified in the constraints.
            </div>
          </div>
        )}

        {/* TAB 3: SUBMISSIONS */}
        {activeTab === "submissions" && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2
                className={`text-sm font-bold uppercase tracking-wide ${
                  isDark ? "text-white" : "text-zinc-900"
                }`}
              >
                Submission History ({submitSubs.length})
              </h2>
            </div>

            {submitSubs.length === 0 ? (
              <div
                className={`text-center py-12 text-xs font-mono border rounded-lg border-dashed ${
                  isDark ? "border-[#2f2f35] text-zinc-500" : "border-zinc-300 text-zinc-500"
                }`}
              >
                No submissions yet for this problem. Click &quot;Submit&quot; to test all cases.
              </div>
            ) : (
              <div className="space-y-2">
                {submitSubs.map((sub, idx) => {
                  const passed = sub.status === "ACCEPTED";
                  const pct = sub.totalTests
                    ? Math.round((sub.passedTests / sub.totalTests) * 100)
                    : 0;

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border flex items-center justify-between transition-colors ${
                        passed
                          ? isDark
                            ? "bg-[#00b8a3]/5 border-[#00b8a3]/20 text-zinc-200"
                            : "bg-[#00b8a3]/10 border-[#00b8a3]/30 text-zinc-800"
                          : isDark
                          ? "bg-[#ff375f]/5 border-[#ff375f]/20 text-zinc-200"
                          : "bg-[#ff375f]/10 border-[#ff375f]/30 text-zinc-800"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {passed ? (
                          <CheckCircle2 className="w-4 h-4 text-[#00b8a3] shrink-0" />
                        ) : sub.status === "COMPILE_ERROR" ? (
                          <AlertTriangle className="w-4 h-4 text-[#ffc01e] shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-[#ff375f] shrink-0" />
                        )}
                        <div>
                          <span
                            className={`text-xs font-bold ${
                              passed
                                ? "text-[#00b8a3]"
                                : sub.status === "COMPILE_ERROR"
                                ? "text-[#ffc01e]"
                                : "text-[#ff375f]"
                            }`}
                          >
                            {sub.status ?? "SUBMITTED"}
                          </span>
                          <span className="text-[10px] text-zinc-400 block font-mono">
                            Attempt #{sub.attemptNumber} {sub.language ? `· ${sub.language}` : ""}
                          </span>
                        </div>
                      </div>

                      <div className="text-right font-mono text-xs">
                        <span className="font-bold">
                          {sub.passedTests}/{sub.totalTests}
                        </span>
                        <span className="text-[10px] text-zinc-400 ml-1">({pct}%)</span>
                        {sub.executionTimeMs !== undefined && sub.executionTimeMs > 0 && (
                          <span className="text-[10px] text-zinc-500 block">
                            {sub.executionTimeMs.toFixed(0)} ms
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
