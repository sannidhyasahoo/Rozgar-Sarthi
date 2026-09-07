"use client";
// components/coding/TestResults.tsx
// LeetCode style collapsible console drawer with Testcase and Test Result tabs

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Zap,
  Terminal,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { ExecutionResult, SubmitResult } from "@/lib/codingApi";

interface TestCase {
  input: Record<string, unknown>;
  expected: unknown;
}

interface TestResultsProps {
  result: ExecutionResult | SubmitResult | null;
  testCases?: TestCase[];
  isRunning: boolean;
  isSubmitting: boolean;
  theme?: "dark" | "light";
  isOpen?: boolean;
  onToggleOpen?: () => void;
}

function isSubmitResult(r: ExecutionResult | SubmitResult): r is SubmitResult {
  return "submissionId" in r;
}

export function TestResults({
  result,
  testCases = [],
  isRunning,
  isSubmitting,
  theme = "dark",
  isOpen = true,
  onToggleOpen,
}: TestResultsProps) {
  const [activeTab, setActiveTab] = useState<"testcase" | "result">("testcase");
  const [selectedCaseIdx, setSelectedCaseIdx] = useState<number>(0);

  const isDark = theme === "dark";

  // Automatically switch to result tab when execution finishes
  useEffect(() => {
    if (result) {
      setActiveTab("result");
    }
  }, [result]);

  if (!isOpen) {
    return null;
  }

  const submitResult = result && isSubmitResult(result) ? result : null;
  const accepted = result?.status === "ACCEPTED";
  const isError = result?.status === "COMPILE_ERROR" || result?.status === "RUNTIME_ERROR";

  const numCases = Math.max(testCases.length, result?.totalTests ?? 0, 1);
  const activeCase = testCases[selectedCaseIdx];

  // Test detail for the selected case (if available from result)
  const caseDetail = result?.testDetails?.[selectedCaseIdx];

  return (
    <div
      className={`border-t flex flex-col shrink-0 transition-colors duration-200 ${
        isDark ? "bg-[#18181b] border-[#2e2e33]" : "bg-white border-zinc-200"
      }`}
      style={{ height: "260px" }}
    >
      {/* ── Console Header / Tab Bar ──────────────────────────────────── */}
      <div
        className={`flex items-center justify-between px-3 border-b shrink-0 select-none ${
          isDark ? "bg-[#1f1f23] border-[#2e2e33]" : "bg-zinc-100/90 border-zinc-200"
        }`}
      >
        <div className="flex items-center gap-1">
          {/* Testcase Tab */}
          <button
            onClick={() => setActiveTab("testcase")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "testcase"
                ? isDark
                  ? "border-white text-white"
                  : "border-zinc-900 text-zinc-900"
                : isDark
                ? "border-transparent text-zinc-400 hover:text-zinc-200"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-zinc-400" />
            <span>Testcase</span>
          </button>

          {/* Test Result Tab */}
          <button
            onClick={() => setActiveTab("result")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "result"
                ? isDark
                  ? "border-white text-white"
                  : "border-zinc-900 text-zinc-900"
                : isDark
                ? "border-transparent text-zinc-400 hover:text-zinc-200"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <PlayCircle
              className={`w-3.5 h-3.5 ${
                result
                  ? accepted
                    ? "text-[#00b8a3]"
                    : "text-[#ff375f]"
                  : "text-zinc-400"
              }`}
            />
            <span>Test Result</span>
            {result && (
              <span
                className={`w-2 h-2 rounded-full ${
                  accepted ? "bg-[#00b8a3]" : "bg-[#ff375f]"
                }`}
              />
            )}
          </button>
        </div>

        {/* Minimize / Toggle button */}
        {onToggleOpen && (
          <button
            onClick={onToggleOpen}
            className={`p-1.5 rounded hover:bg-zinc-500/10 transition-colors ${
              isDark ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-500 hover:text-zinc-800"
            }`}
            title="Collapse Console"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Console Body ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {/* TAB 1: TESTCASE VIEWER */}
        {activeTab === "testcase" && (
          <div className="space-y-4">
            {/* Case selector pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {Array.from({ length: numCases }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedCaseIdx(idx)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                    selectedCaseIdx === idx
                      ? isDark
                        ? "bg-[#2f2f35] text-white shadow-sm ring-1 ring-white/10"
                        : "bg-zinc-200 text-zinc-900 shadow-sm ring-1 ring-zinc-300"
                      : isDark
                      ? "bg-[#222226] text-zinc-400 hover:text-zinc-200 hover:bg-[#28282e]"
                      : "bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-150"
                  }`}
                >
                  Case {idx + 1}
                </button>
              ))}
            </div>

            {/* Inputs for selected test case */}
            {activeCase ? (
              <div className="space-y-3">
                {Object.entries(activeCase.input).map(([key, val]) => (
                  <div key={key} className="space-y-1">
                    <span className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">
                      {key} =
                    </span>
                    <div
                      className={`p-2.5 rounded-md font-mono text-xs border ${
                        isDark
                          ? "bg-[#202024] border-[#2f2f35] text-zinc-200"
                          : "bg-zinc-50 border-zinc-200 text-zinc-800"
                      }`}
                    >
                      {JSON.stringify(val)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs font-mono text-zinc-500 py-4 text-center">
                Select a testcase above to view inputs.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TEST RESULT */}
        {activeTab === "result" && (
          <div className="space-y-4">
            {/* Loading state */}
            {(isRunning || isSubmitting) && (
              <div className="flex items-center gap-3 py-6 justify-center">
                <Loader2 className="w-5 h-5 text-[#6a5ed9] animate-spin" />
                <span className="text-xs font-mono text-zinc-400">
                  {isSubmitting
                    ? "Evaluating all test cases against test harness..."
                    : "Executing test cases in subprocess runner..."}
                </span>
              </div>
            )}

            {/* Empty state */}
            {!isRunning && !isSubmitting && !result && (
              <div className="text-center py-8">
                <p className="text-xs font-mono text-zinc-500">
                  Click &quot;Run Code&quot; to execute your solution against test cases.
                </p>
              </div>
            )}

            {/* Execution Result */}
            {!isRunning && !isSubmitting && result && (
              <div className="space-y-4">
                {/* Status & Stats Banner */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2.5">
                    {accepted ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-[#00b8a3]" />
                        <span className="text-base font-bold text-[#00b8a3]">
                          Accepted
                        </span>
                      </>
                    ) : result.status === "WRONG_ANSWER" ? (
                      <>
                        <XCircle className="w-5 h-5 text-[#ff375f]" />
                        <span className="text-base font-bold text-[#ff375f]">
                          Wrong Answer
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-5 h-5 text-[#ffc01e]" />
                        <span className="text-base font-bold text-[#ffc01e]">
                          {result.status}
                        </span>
                      </>
                    )}

                    {result.executionTimeMs > 0 && (
                      <span className="text-xs font-mono text-zinc-400 flex items-center gap-1 ml-2">
                        <Clock className="w-3 h-3" />
                        Runtime: {result.executionTimeMs.toFixed(0)} ms
                      </span>
                    )}
                  </div>

                  {/* Pass count */}
                  <div className="text-xs font-mono">
                    <span className="text-zinc-500">Passed: </span>
                    <span
                      className={`font-bold ${
                        accepted ? "text-[#00b8a3]" : "text-[#ff375f]"
                      }`}
                    >
                      {result.passedTests}/{result.totalTests}
                    </span>
                  </div>
                </div>

                {/* Tree-sitter / Submit complexity badge */}
                {submitResult?.codeAnalysis && (
                  <div
                    className={`p-2.5 rounded-lg border text-xs font-mono flex items-center gap-3 flex-wrap ${
                      isDark ? "bg-[#202024] border-[#2f2f35]" : "bg-zinc-50 border-zinc-200"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
                      <Zap className="w-3.5 h-3.5" />
                      <span>AST Analysis:</span>
                    </div>
                    <div className="text-zinc-300">
                      Time: <span className="font-bold text-[#00b8a3]">{submitResult.codeAnalysis.estimatedTimeComplexity}</span>
                    </div>
                    {submitResult.expectedComplexity?.space && (
                      <div className="text-zinc-300">
                        Space: <span className="font-bold text-[#6a5ed9]">{submitResult.expectedComplexity.space}</span>
                      </div>
                    )}
                    <div className="text-zinc-500 ml-auto">
                      Confidence: {Math.round(submitResult.codeAnalysis.confidence * 100)}%
                    </div>
                  </div>
                )}

                {/* Error Box if Compile Error or Runtime Error */}
                {result.compileError && (
                  <div className="p-3 rounded-lg bg-red-950/20 border border-red-900/30 font-mono text-xs text-red-400 whitespace-pre-wrap leading-relaxed">
                    {result.compileError}
                  </div>
                )}

                {result.runtimeError && (
                  <div className="p-3 rounded-lg bg-red-950/20 border border-red-900/30 font-mono text-xs text-red-400 whitespace-pre-wrap leading-relaxed">
                    {result.runtimeError}
                  </div>
                )}

                {/* Per-case result inspector */}
                {!isError && result.totalTests > 0 && (
                  <div className="space-y-3 pt-1">
                    {/* Case buttons with pass/fail dots */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {Array.from({ length: result.totalTests }).map((_, idx) => {
                        const detail = result.testDetails?.find((d) => d.index === idx) ?? result.testDetails?.[idx];
                        const failed = detail ? !detail.passed : result.status !== "ACCEPTED";
                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedCaseIdx(idx)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                              selectedCaseIdx === idx
                                ? isDark
                                  ? "bg-[#2f2f35] text-white ring-1 ring-white/10"
                                  : "bg-zinc-200 text-zinc-900 ring-1 ring-zinc-300"
                                : isDark
                                ? "bg-[#222226] text-zinc-400 hover:text-zinc-200"
                                : "bg-zinc-100 text-zinc-600 hover:text-zinc-900"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                failed ? "bg-[#ff375f]" : "bg-[#00b8a3]"
                              }`}
                            />
                            Case {idx + 1}
                          </button>
                        );
                      })}
                    </div>

                    {/* Case details (Input, Output, Expected) */}
                    <div
                      className={`p-3 rounded-lg border font-mono text-xs space-y-2.5 ${
                        isDark
                          ? "bg-[#202024] border-[#2f2f35]"
                          : "bg-zinc-50 border-zinc-200"
                      }`}
                    >
                      {activeCase && (
                        <div>
                          <span className="text-[11px] text-zinc-400 block font-semibold mb-1">
                            Input:
                          </span>
                          <div
                            className={`p-2 rounded border ${
                              isDark ? "bg-[#18181b] border-[#2e2e33]" : "bg-white border-zinc-200"
                            }`}
                          >
                            {Object.entries(activeCase.input).map(([k, v]) => (
                              <div key={k}>
                                <span className="text-zinc-400">{k} = </span>
                                <span className={isDark ? "text-zinc-200" : "text-zinc-800"}>
                                  {JSON.stringify(v)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {caseDetail && (
                        <>
                          <div>
                            <span className="text-[11px] text-zinc-400 block font-semibold mb-1">
                              Output:
                            </span>
                            <div
                              className={`p-2 rounded border font-bold ${
                                caseDetail.passed
                                  ? "text-[#00b8a3] bg-[#00b8a3]/5 border-[#00b8a3]/20"
                                  : "text-[#ff375f] bg-[#ff375f]/5 border-[#ff375f]/20"
                              }`}
                            >
                              {caseDetail.got || "(no output)"}
                            </div>
                          </div>

                          <div>
                            <span className="text-[11px] text-zinc-400 block font-semibold mb-1">
                              Expected:
                            </span>
                            <div
                              className={`p-2 rounded border ${
                                isDark
                                  ? "bg-[#18181b] border-[#2e2e33] text-zinc-200"
                                  : "bg-white border-zinc-200 text-zinc-800"
                              }`}
                            >
                              {caseDetail.expected}
                            </div>
                          </div>

                          {caseDetail.error && (
                            <div>
                              <span className="text-[11px] text-red-400 block font-semibold mb-1">
                                Error:
                              </span>
                              <div className="p-2 rounded bg-red-950/20 border border-red-900/30 text-red-400">
                                {caseDetail.error}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
