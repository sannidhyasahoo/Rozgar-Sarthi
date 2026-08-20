"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppAuth } from "@/components/auth/AuthProvider";
import { fetchBackendQuestions, submitBackendCode } from "@/lib/api";
import { BackendQuestion, BackendSubmitResponse, ReasoningTrajectoryStep } from "@/lib/types";
import { saveSessionToHistory, saveStoredProfile } from "@/lib/storage";
import {
  Code2,
  Play,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Terminal,
  Zap,
  ArrowRight,
  HelpCircle,
  Layers,
  Sparkles,
  RotateCcw,
  Cpu,
  Check,
  ChevronRight,
} from "lucide-react";

export default function CodingRoundPage() {
  const router = useRouter();
  const { profile, setProfile } = useAppAuth();

  const [questions, setQuestions] = useState<BackendQuestion[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>("All");
  const [selectedQuestion, setSelectedQuestion] = useState<BackendQuestion | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  const [selectedLang, setSelectedLang] = useState<"python" | "typescript" | "go">("python");
  const [code, setCode] = useState<string>("");
  const [approachNotes, setApproachNotes] = useState("");
  const [complexityTime, setComplexityTime] = useState("O(N)");
  const [complexitySpace, setComplexitySpace] = useState("O(1)");

  const [runningTests, setRunningTests] = useState(false);
  const [submitResponse, setSubmitResponse] = useState<BackendSubmitResponse | null>(null);

  const [trajectorySteps, setTrajectorySteps] = useState<ReasoningTrajectoryStep[]>([
    {
      id: "step_init",
      phase: "approach",
      title: "Workspace Initialized",
      content: "Ready for live code execution and test verification.",
      timestamp: new Date().toLocaleTimeString(),
      status: "info",
    },
  ]);

  const [counterResponse, setCounterResponse] = useState("");
  const [counterAnswered, setCounterAnswered] = useState(false);

  // Fetch real questions from backend
  useEffect(() => {
    async function loadData() {
      setLoadingQuestions(true);
      const qList = await fetchBackendQuestions();
      setQuestions(qList);
      if (qList.length > 0) {
        const initial = qList[0];
        setSelectedQuestion(initial);
        setCode(initial.starter_code?.python || "");
      }
      setLoadingQuestions(false);
    }
    loadData();
  }, []);

  const handleSelectQuestion = (q: BackendQuestion) => {
    setSelectedQuestion(q);
    setCode(q.starter_code?.python || "");
    setSubmitResponse(null);
    setCounterAnswered(false);
    setCounterResponse("");

    setTrajectorySteps((prev) => [
      ...prev,
      {
        id: `step_${Date.now()}`,
        phase: "approach",
        title: `Question Selected: ${q.title}`,
        content: `Candidate switched to ${q.title} (${q.topic} • ${q.difficulty}).`,
        timestamp: new Date().toLocaleTimeString(),
        status: "info",
      },
    ]);
  };

  const handleResetCode = () => {
    if (selectedQuestion) {
      setCode(selectedQuestion.starter_code?.python || "");
      setSubmitResponse(null);
    }
  };

  const handleRunTests = async () => {
    if (!selectedQuestion) return;

    setRunningTests(true);
    setSubmitResponse(null);

    const startTime = Date.now();
    const result = await submitBackendCode(selectedQuestion.id, code);
    const elapsed = Date.now() - startTime;

    setSubmitResponse(result);
    setRunningTests(false);

    // Update trajectory step based on actual test outcome
    const passedCount = result.test_results?.filter((r) => r.passed).length || 0;
    const totalCount = result.test_results?.length || 0;

    if (result.passed) {
      setTrajectorySteps((prev) => [
        ...prev,
        {
          id: `step_${Date.now()}`,
          phase: "test_execution",
          title: `All Tests Passed (${totalCount}/${totalCount})`,
          content: `Optimal solution verified. Time Complexity: ${result.complexity?.estimated_time_complexity || "O(N)"}, Space Complexity: ${result.complexity?.estimated_space_complexity || "O(1)"}.`,
          timestamp: new Date().toLocaleTimeString(),
          status: "success",
        },
      ]);
    } else {
      setTrajectorySteps((prev) => [
        ...prev,
        {
          id: `step_${Date.now()}`,
          phase: "debugging",
          title: `Tests Failed (${passedCount}/${totalCount} Passed)`,
          content: result.stderr
            ? `Execution Error: ${result.stderr.slice(0, 100)}`
            : `Failed test cases. Adaptive Hint: ${result.decision?.next_action_detail || "Check edge cases"}`,
          timestamp: new Date().toLocaleTimeString(),
          status: "error",
        },
      ]);
    }
  };

  const handleAnswerCounterExample = () => {
    if (!counterResponse.trim()) return;
    setCounterAnswered(true);

    setTrajectorySteps((prev) => [
      ...prev,
      {
        id: `step_probe_${Date.now()}`,
        phase: "counter_example_probe",
        title: "Adaptive Stress Probe Defense",
        content: `Candidate reasoned: "${counterResponse.slice(0, 120)}..."`,
        timestamp: new Date().toLocaleTimeString(),
        status: "info",
      },
    ]);
  };

  const handleFinishCoding = () => {
    const passedRatio = submitResponse?.passed ? 0.92 : 0.72;
    const updatedComp = {
      technical_depth: Math.min(0.98, (profile.competencies?.technical_depth || 0.7) + (submitResponse?.passed ? 0.08 : 0.02)),
      system_design: Math.min(0.95, (profile.competencies?.system_design || 0.65) + 0.04),
      problem_solving: Math.min(0.98, (profile.competencies?.problem_solving || 0.75) + (submitResponse?.passed ? 0.09 : 0.03)),
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
      duration_minutes: 30,
      overall_score: passedRatio,
      competencies: updatedComp,
      evidence_log: [
        {
          turn_id: 1,
          competency: "Algorithmic Precision & Execution",
          quote: `Executed code for ${selectedQuestion?.title || "Problem"}. Passed: ${submitResponse?.passed ? "Yes (100%)" : "Partial"}`,
          signal: submitResponse?.passed ? "substantiated" : "probing",
          observation: submitResponse?.complexity?.reasoning || "Algorithmic problem solving and edge case verification.",
          pressure_level: submitResponse?.passed ? 2 : 4,
        },
      ],
      identified_strengths: submitResponse?.passed
        ? [
            `Demonstrated mastery in ${selectedQuestion?.topic || "DSA"}.`,
            `Optimal ${submitResponse.complexity?.estimated_time_complexity || "O(N)"} time complexity verified via AST inspection.`,
          ]
        : ["Systematic approach formulation under test verification constraints."],
      areas_for_improvement: submitResponse?.passed
        ? ["Continue practicing scaling data structure bounds to large distributed datasets."]
        : ["Review edge case handling and test case constraints."],
      actionable_tips: [
        submitResponse?.decision?.next_action_detail || "Consider tracing failing edge cases with bitwise and frequency tables.",
      ],
      reasoning_trajectory: trajectorySteps,
    });

    router.push("/report");
  };

  const topics = ["All", "Bit Manipulation", "Strings", "DP"];
  const filteredQuestions =
    selectedTopic === "All"
      ? questions
      : questions.filter((q) => q.topic.toLowerCase() === selectedTopic.toLowerCase());

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
                AI Coding Round • Live Test Execution Engine
              </span>
              {selectedQuestion && (
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-cobalt/10 text-cobalt border border-cobalt/20 font-bold uppercase">
                  {selectedQuestion.difficulty} • {selectedQuestion.topic}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 font-mono">
              Problem: {selectedQuestion ? selectedQuestion.title : "Loading..."} • Real-time Sandbox & AST Verification
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

      {/* Question Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white border border-zinc-200">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-mono font-bold text-zinc-500 mr-2">TOPICS:</span>
          {topics.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTopic(t)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                selectedTopic === t
                  ? "bg-zinc-900 text-white font-bold shadow-sm"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Question Pills */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-mono text-zinc-400 mr-1">Questions:</span>
          {filteredQuestions.map((q) => (
            <button
              key={q.id}
              onClick={() => handleSelectQuestion(q)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedQuestion?.id === q.id
                  ? "bg-cobalt text-white font-bold shadow-sm"
                  : "bg-zinc-50 text-zinc-700 hover:bg-zinc-100 border border-zinc-200"
              }`}
            >
              {q.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Problem, Test Cases, & Trajectory (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Problem Statement Card */}
          {selectedQuestion ? (
            <div className="dev-card p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-zinc-900">
                    {selectedQuestion.title}
                  </h2>
                  <span className="font-mono text-[11px] text-zinc-500">
                    Topic: {selectedQuestion.topic}
                  </span>
                </div>
                <span className={`font-mono text-xs px-2 py-0.5 rounded font-bold uppercase ${
                  selectedQuestion.difficulty.toLowerCase() === "easy"
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    : selectedQuestion.difficulty.toLowerCase() === "medium"
                    ? "bg-amber-100 text-amber-700 border border-amber-200"
                    : "bg-rose-100 text-rose-700 border border-rose-200"
                }`}>
                  {selectedQuestion.difficulty}
                </span>
              </div>

              <div className="text-xs text-zinc-800 leading-relaxed whitespace-pre-wrap font-sans">
                {selectedQuestion.prompt}
              </div>

              {/* Sample Test Cases Preview */}
              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2">
                <span className="font-mono text-[10px] uppercase text-zinc-500 font-bold block">
                  Sample Test Cases ({selectedQuestion.test_cases?.length || 0}):
                </span>
                <div className="space-y-1.5 font-mono text-[11px]">
                  {selectedQuestion.test_cases?.slice(0, 3).map((tc, idx) => (
                    <div key={idx} className="p-2 rounded bg-white border border-zinc-200 flex items-center justify-between">
                      <span className="text-zinc-600">Input: <code className="text-zinc-900 font-bold">{tc.input.replace(/\n/g, "\\n")}</code></span>
                      <span className="text-zinc-600">Expected: <code className="text-emerald-700 font-bold">{tc.expected}</code></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="dev-card p-5 text-center text-zinc-400 font-mono text-xs">
              Loading questions...
            </div>
          )}

          {/* Reasoning Trajectory Logger */}
          <div className="dev-card p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-iris" />
                <span className="font-bold text-xs text-zinc-900">
                  Live Execution Trajectory
                </span>
              </div>
              <span className="font-mono text-[10px] text-zinc-400">
                {trajectorySteps.length} Events Logged
              </span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {trajectorySteps.map((step) => (
                <div
                  key={step.id}
                  className={`p-2.5 rounded-lg border text-xs space-y-0.5 ${
                    step.status === "success"
                      ? "bg-emerald-50/50 border-emerald-200"
                      : step.status === "error"
                      ? "bg-rose-50/50 border-rose-200"
                      : "bg-zinc-50 border-zinc-200"
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className={`font-bold uppercase ${
                      step.status === "success"
                        ? "text-emerald-700"
                        : step.status === "error"
                        ? "text-rose-700"
                        : "text-iris"
                    }`}>
                      {step.title}
                    </span>
                    <span className="text-zinc-400">{step.timestamp}</span>
                  </div>
                  <p className="text-zinc-700 text-[11px] leading-snug">{step.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Adaptive Hint & Follow-up Section */}
          {submitResponse?.decision && (
            <div className={`dev-card p-5 space-y-3 border ${
              submitResponse.decision.decision === "retry_with_hints"
                ? "border-amber-300 bg-amber-50/40"
                : submitResponse.decision.decision === "add_complexity"
                ? "border-purple-300 bg-purple-50/40"
                : "border-emerald-300 bg-emerald-50/40"
            }`}>
              <div className="flex items-center gap-2 font-mono font-bold text-xs">
                <Zap className="w-4 h-4 text-iris" />
                <span className="text-zinc-900">
                  {submitResponse.decision.decision === "retry_with_hints"
                    ? "ADAPTIVE DSA HINT"
                    : submitResponse.decision.decision === "add_complexity"
                    ? "ADVANCED COMPLEXITY CHALLENGE"
                    : "ADAPTIVE EVALUATION STATUS"}
                </span>
              </div>

              <div className="text-xs text-zinc-800 space-y-1 font-sans">
                <p className="text-zinc-600 text-[11px] leading-relaxed">
                  {submitResponse.decision.reasoning}
                </p>
                {submitResponse.decision.next_action_detail && (
                  <div className="p-2.5 rounded-lg bg-white border border-zinc-200 font-mono text-[11px] text-zinc-800 mt-2">
                    {submitResponse.decision.next_action_detail}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Code Editor & Test Execution Console (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
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
                  solution.py • {selectedQuestion?.title || "Python"}
                </span>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <button
                  onClick={handleResetCode}
                  className="px-2.5 py-1 rounded text-[11px] text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center gap-1 transition-colors"
                  title="Reset to starter code"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
                <span className="px-2 py-0.5 rounded bg-iris/20 text-iris border border-iris/30 text-[10px] font-bold">
                  PYTHON 3
                </span>
              </div>
            </div>

            {/* Code Input */}
            <textarea
              rows={16}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-4 font-mono text-xs bg-zinc-950 text-emerald-300 focus:outline-none resize-none leading-relaxed selection:bg-iris/30"
              spellCheck={false}
              placeholder="Write your Python solution here..."
            />

            {/* Run Button Bar */}
            <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between">
              <div className="font-mono text-[11px] text-zinc-400 flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-zinc-500" />
                <span>Reads stdin • Compares stdout against test cases</span>
              </div>
              <button
                onClick={handleRunTests}
                disabled={runningTests || !selectedQuestion}
                className={`btn-primary-action !py-2 !px-5 !text-xs shadow-sm transition-all ${
                  runningTests
                    ? "bg-zinc-700 cursor-not-allowed text-zinc-300"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white"
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{runningTests ? "Executing Sandbox..." : "Run Test Suite"}</span>
              </button>
            </div>
          </div>

          {/* Test Results Console */}
          {submitResponse && (
            <div className={`dev-card p-5 space-y-4 text-zinc-200 border ${
              submitResponse.passed
                ? "bg-zinc-950 border-emerald-500/40"
                : "bg-zinc-950 border-rose-500/40"
            }`}>
              {/* Header Status */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2 font-mono text-xs font-bold">
                  {submitResponse.passed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">ALL TEST CASES PASSED</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span className="text-rose-400">
                        {submitResponse.test_results?.filter((r) => r.passed).length || 0} /{" "}
                        {submitResponse.test_results?.length || 0} TEST CASES PASSED
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3 font-mono text-[11px] text-zinc-400">
                  {submitResponse.ast_summary && (
                    <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px]">
                      AST: {submitResponse.ast_summary.loop_count} Loops • Nesting: {submitResponse.ast_summary.max_nesting_depth}
                    </span>
                  )}
                  {submitResponse.complexity?.estimated_time_complexity && (
                    <span className="text-emerald-300 font-bold">
                      Time: {submitResponse.complexity.estimated_time_complexity}
                    </span>
                  )}
                </div>
              </div>

              {/* Per-Test Case Detailed Breakdown */}
              <div className="space-y-2 font-mono text-xs">
                {submitResponse.test_results?.map((res, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border ${
                      res.passed
                        ? "bg-zinc-900/80 border-emerald-900/50 text-zinc-300"
                        : "bg-zinc-900/80 border-rose-900/50 text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        {res.passed ? (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                            PASS
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 text-[10px] font-bold">
                            FAIL
                          </span>
                        )}
                        <span className="font-bold text-zinc-200">Test Case #{res.test_case_id}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500">{res.runtime_ms} ms</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] bg-zinc-950/60 p-2 rounded border border-zinc-800/80">
                      <div>
                        <span className="text-zinc-500 block text-[10px]">Input:</span>
                        <span className="text-zinc-300">{res.input?.replace(/\n/g, " \\n ") || "-"}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[10px]">Expected:</span>
                        <span className="text-emerald-400">{res.expected || "-"}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[10px]">Your Output:</span>
                        <span className={res.passed ? "text-emerald-400" : "text-rose-400"}>
                          {res.actual || (res.error ? "Error" : "empty")}
                        </span>
                      </div>
                    </div>

                    {res.error && !res.passed && (
                      <div className="mt-2 text-[10px] text-rose-400 bg-rose-950/40 p-2 rounded border border-rose-900/40 whitespace-pre-wrap">
                        {res.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Complexity & Reasoning Card */}
              {submitResponse.complexity && (
                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs space-y-1">
                  <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400">
                    <span className="uppercase text-iris font-bold">AI Complexity Assessment</span>
                    <span>Confidence: {(submitResponse.complexity.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center gap-4 font-mono text-[11px] text-zinc-300">
                    <span>Estimated Time: <strong className="text-emerald-400">{submitResponse.complexity.estimated_time_complexity}</strong></span>
                    <span>Estimated Space: <strong className="text-purple-400">{submitResponse.complexity.estimated_space_complexity}</strong></span>
                  </div>
                  <p className="text-zinc-400 text-[11px] pt-1">
                    {submitResponse.complexity.reasoning}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
