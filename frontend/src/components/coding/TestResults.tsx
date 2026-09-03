"use client";
// components/coding/TestResults.tsx

import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Cpu,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ExecutionResult, SubmitResult, STATUS_META } from "@/lib/codingApi";
import { useState } from "react";

interface TestResultsProps {
  result: ExecutionResult | SubmitResult | null;
  isRunning: boolean;
  isSubmitting: boolean;
}

function isSubmitResult(r: ExecutionResult | SubmitResult): r is SubmitResult {
  return "submissionId" in r;
}

export function TestResults({ result, isRunning, isSubmitting }: TestResultsProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (isRunning || isSubmitting) {
    return (
      <div className="bg-[#111113] border-t border-[#2a2a2e] px-5 py-4 flex items-center gap-3">
        <div className="w-4 h-4 border-2 border-[#6a5ed9]/30 border-t-[#6a5ed9] rounded-full animate-spin shrink-0" />
        <span className="text-sm text-zinc-400 font-mono">
          {isSubmitting ? "Running all test cases (including hidden)…" : "Running visible tests…"}
        </span>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-[#111113] border-t border-[#2a2a2e] px-5 py-3 text-xs text-zinc-600 font-mono">
        Run your code to see test results.
      </div>
    );
  }

  const meta = STATUS_META[result.status] ?? { label: result.status, color: "text-zinc-400" };
  const passRate = result.totalTests
    ? Math.round((result.passedTests / result.totalTests) * 100)
    : 0;
  const accepted = result.status === "ACCEPTED";

  const submitResult = isSubmitResult(result) ? result : null;

  return (
    <div className="bg-[#111113] border-t border-[#2a2a2e] shrink-0">
      {/* Status bar */}
      <div className="px-5 py-3 flex items-center gap-4 flex-wrap">
        {/* Status badge */}
        <div className="flex items-center gap-2">
          {accepted ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : result.status === "COMPILE_ERROR" || result.status === "RUNTIME_ERROR" ? (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span className={`text-sm font-bold font-mono ${meta.color}`}>
            {meta.label}
          </span>
        </div>

        {/* Test counts */}
        {result.totalTests > 0 && !result.compileError && (
          <div className="flex items-center gap-1 font-mono text-xs">
            <span className="text-zinc-500">Tests:</span>
            <span className="text-emerald-400 font-bold">{result.passedTests}</span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-300">{result.totalTests}</span>
            <span className="text-zinc-600 ml-1">({passRate}%)</span>
          </div>
        )}

        {/* Runtime */}
        {result.executionTimeMs > 0 && (
          <div className="flex items-center gap-1 text-xs text-zinc-500 font-mono">
            <Clock className="w-3 h-3" />
            <span>{result.executionTimeMs.toFixed(0)}ms</span>
          </div>
        )}

        {/* Submit-specific: hidden test info + complexity */}
        {submitResult && (
          <>
            <div className="text-xs text-zinc-600 font-mono">
              {submitResult.visibleTests} visible · {submitResult.hiddenTests} hidden
            </div>

            {submitResult.codeAnalysis && (
              <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-500">
                <Zap className="w-3 h-3" />
                <span>
                  Detected{" "}
                  <span className="text-[#6a5ed9]">
                    {submitResult.codeAnalysis.estimatedTimeComplexity}
                  </span>
                </span>
                {submitResult.expectedComplexity?.time && (
                  <span className="text-zinc-600">
                    (expected{" "}
                    <span className="text-zinc-400">
                      {submitResult.expectedComplexity.time}
                    </span>
                    )
                  </span>
                )}
                {submitResult.codeAnalysis.confidence > 0 && (
                  <span className="text-zinc-600">
                    · {Math.round(submitResult.codeAnalysis.confidence * 100)}% conf
                  </span>
                )}
              </div>
            )}
          </>
        )}

        {/* Toggle details */}
        {(result.testDetails?.length > 0 || result.compileError || result.runtimeError) && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="ml-auto flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-mono"
          >
            Details
            {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>

      {/* Test indicator dots (always shown) */}
      {result.totalTests > 0 && !result.compileError && result.testDetails && (
        <div className="px-5 pb-3 flex gap-1.5 flex-wrap">
          {result.testDetails.map((t) => (
            <div
              key={t.index}
              title={`Test ${t.index + 1}: ${t.passed ? "Passed" : "Failed"}${t.error ? ` — ${t.error}` : ""}`}
              className={`w-5 h-5 rounded text-[9px] font-bold flex items-center justify-center transition-all cursor-default ${
                t.passed
                  ? "bg-emerald-900/40 text-emerald-400 border border-emerald-800/40"
                  : "bg-red-900/40 text-red-400 border border-red-800/40"
              }`}
            >
              {t.index + 1}
            </div>
          ))}
          {/* Hidden test summary */}
          {submitResult && submitResult.hiddenTests > 0 && (
            <div
              title="Hidden tests — results counted but inputs not shown"
              className="px-2 h-5 rounded text-[9px] font-mono font-bold flex items-center justify-center bg-[#1a1a1e] text-zinc-600 border border-[#2a2a2e]"
            >
              +{submitResult.hiddenTests} hidden
            </div>
          )}
        </div>
      )}

      {/* Expanded details */}
      {showDetails && (
        <div className="border-t border-[#2a2a2e] px-5 py-3 space-y-3 max-h-48 overflow-y-auto">
          {/* Compile / Runtime error */}
          {(result.compileError || result.runtimeError) && (
            <div className="bg-red-950/20 border border-red-900/30 rounded-lg p-3">
              <div className="text-xs font-mono text-red-400 font-bold mb-1">
                {result.compileError ? "Compile Error" : "Runtime Error"}
              </div>
              <pre className="text-xs text-red-300 whitespace-pre-wrap font-mono leading-relaxed">
                {result.compileError ?? result.runtimeError}
              </pre>
            </div>
          )}

          {/* Per-test detail */}
          {result.testDetails?.filter((t) => !t.passed).map((t) => (
            <div
              key={t.index}
              className="bg-[#1a1a1e] border border-[#2a2a2e] rounded-lg p-3 space-y-1.5"
            >
              <div className="flex items-center gap-2 text-xs font-mono">
                <XCircle className="w-3 h-3 text-red-400" />
                <span className="text-red-400 font-bold">Test {t.index + 1} Failed</span>
              </div>
              {t.error ? (
                <pre className="text-[11px] text-amber-400 font-mono whitespace-pre-wrap">
                  {t.error}
                </pre>
              ) : (
                <>
                  <div className="text-[11px] font-mono">
                    <span className="text-zinc-500">Expected: </span>
                    <span className="text-emerald-400">{t.expected}</span>
                  </div>
                  <div className="text-[11px] font-mono">
                    <span className="text-zinc-500">Got: </span>
                    <span className="text-red-400">{t.got}</span>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Complexity signals */}
          {(submitResult?.codeAnalysis?.signals?.length ?? 0) > 0 && (
            <div className="bg-[#1a1a1e] border border-[#2a2a2e] rounded-lg p-3">
              <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-2">
                AST Signals Detected
              </div>
              <div className="flex flex-wrap gap-1.5">
                {submitResult?.codeAnalysis?.signals?.map((sig) => (
                  <span
                    key={sig}
                    className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#6a5ed9]/10 text-[#6a5ed9] border border-[#6a5ed9]/20"
                  >
                    {sig.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
