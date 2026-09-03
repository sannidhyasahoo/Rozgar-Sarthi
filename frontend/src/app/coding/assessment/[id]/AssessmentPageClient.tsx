"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Editor } from "@monaco-editor/react";
import {
  Play,
  Send,
  Lightbulb,
  RotateCcw,
  ChevronRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import { AssessmentHeader } from "@/components/coding/AssessmentHeader";
import { ProblemPanel } from "@/components/coding/ProblemPanel";
import { TestResults } from "@/components/coding/TestResults";

import {
  runCode,
  submitCode,
  nextQuestion,
  getHint,
  formatTime,
  LANGUAGE_LABELS,
  type CodingProblem,
  type ExecutionResult,
  type SubmitResult,
  type QuestionState,
} from "@/lib/codingApi";

type Language = "python" | "javascript" | "cpp";

const MONACO_LANG: Record<Language, string> = {
  python: "python",
  javascript: "javascript",
  cpp: "cpp",
};

interface AssessmentPageClientProps {
  assessmentId: string;
  initialQuestion: CodingProblem;
  initialIndex: number;
  totalQuestions: number;
  timeLimitMinutes: number;
  initialSubmissions: QuestionState["submissions"];
}

export default function AssessmentPageClient({
  assessmentId,
  initialQuestion,
  initialIndex,
  totalQuestions,
  timeLimitMinutes,
  initialSubmissions,
}: AssessmentPageClientProps) {
  const router = useRouter();

  // ── State ──────────────────────────────────────────────────────────────────
  const [question, setQuestion] = useState<CodingProblem>(initialQuestion);
  const [questionIndex, setQuestionIndex] = useState(initialIndex);
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [timeRemaining, setTimeRemaining] = useState(timeLimitMinutes * 60);

  const [language, setLanguage] = useState<Language>("python");
  const [code, setCode] = useState<string>(initialQuestion.starterCode.python);

  const [runResult, setRunResult] = useState<ExecutionResult | SubmitResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);

  const [lastSubmitResult, setLastSubmitResult] = useState<SubmitResult | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const editorRef = useRef<unknown>(null);

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Reset on question change ───────────────────────────────────────────────
  useEffect(() => {
    setCode(question.starterCode[language] ?? "");
    setRunResult(null);
    setLastSubmitResult(null);
    setHint(null);
    setShowSuccess(false);
  }, [question.id]);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setCode(question.starterCode[lang] ?? "");
    setRunResult(null);
  };

  const handleResetCode = () => {
    setCode(question.starterCode[language] ?? "");
    setRunResult(null);
  };

  // ── Run Code ───────────────────────────────────────────────────────────────
  const handleRun = async () => {
    if (!code.trim()) return;
    setIsRunning(true);
    setRunResult(null);
    setHint(null);
    try {
      const result = await runCode(assessmentId, question.id, language, code);
      setRunResult(result);
    } catch (err) {
      setRunResult({
        status: "RUNTIME_ERROR",
        passedTests: 0,
        totalTests: 0,
        executionTimeMs: 0,
        runtimeError: String(err),
        testDetails: [],
        compileError: null,
        isRunOnly: true,
      });
    } finally {
      setIsRunning(false);
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!code.trim()) return;
    setIsSubmitting(true);
    setRunResult(null);
    setHint(null);
    try {
      const result = await submitCode(assessmentId, question.id, language, code);
      setRunResult(result);
      setLastSubmitResult(result);

      // Update local submissions state
      setSubmissions((prev) => [
        ...prev,
        {
          attemptNumber: result.attemptNumber,
          isRun: false,
          submittedAt: new Date().toISOString(),
          status: result.status,
          passedTests: result.passedTests,
          totalTests: result.totalTests,
        },
      ]);

      if (result.status === "ACCEPTED") {
        setShowSuccess(true);
      }
    } catch (err) {
      setRunResult({
        status: "RUNTIME_ERROR",
        passedTests: 0,
        totalTests: 0,
        executionTimeMs: 0,
        runtimeError: String(err),
        testDetails: [],
        compileError: null,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Hint ───────────────────────────────────────────────────────────────────
  const handleHint = async () => {
    setHintLoading(true);
    try {
      const data = await getHint(assessmentId, question.id);
      setHint(data.hint);
    } catch {
      setHint("Think carefully about which data structure gives you O(1) lookup. Consider the trade-offs between time and space complexity.");
    } finally {
      setHintLoading(false);
    }
  };

  // ── Next Question ──────────────────────────────────────────────────────────
  const handleNext = async () => {
    setIsAdvancing(true);
    try {
      const res = await nextQuestion(assessmentId);
      if (res.status === "completed") {
        setIsComplete(true);
        router.push(`/coding/assessment/${assessmentId}/report`);
      } else if (res.question) {
        setQuestion(res.question);
        setQuestionIndex(res.questionIndex ?? questionIndex + 1);
        setSubmissions([]);
        setShowSuccess(false);
        setLastSubmitResult(null);
      }
    } catch (err) {
      console.error("Next question failed:", err);
    } finally {
      setIsAdvancing(false);
    }
  };

  const handleExit = () => {
    if (confirm("Exit assessment? Your progress will be saved.")) {
      router.push("/coding");
    }
  };

  const isLastQuestion = questionIndex + 1 >= totalQuestions;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#0f0f10]">
      {/* Header */}
      <AssessmentHeader
        questionIndex={questionIndex}
        totalQuestions={totalQuestions}
        timeRemainingSeconds={timeRemaining}
        status="active"
        onExit={handleExit}
      />

      {/* ── Main workspace ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Problem Panel */}
        <div className="w-[380px] min-w-[300px] max-w-[420px] border-r border-[#2a2a2e] shrink-0 flex flex-col">
          <ProblemPanel
            problem={question}
            submissions={submissions}
          />
        </div>

        {/* Right: Editor + Controls */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Editor toolbar */}
          <div className="bg-[#1a1a1e] border-b border-[#2a2a2e] flex items-center justify-between px-4 py-2 shrink-0">
            {/* Language switcher */}
            <div className="flex items-center gap-1">
              {(["python", "javascript", "cpp"] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`px-3 py-1 rounded text-[11px] font-mono font-bold uppercase transition-all ${
                    language === lang
                      ? "bg-[#6a5ed9] text-white"
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-[#2a2a2e]"
                  }`}
                >
                  {LANGUAGE_LABELS[lang]}
                </button>
              ))}
            </div>

            {/* Reset */}
            <button
              onClick={handleResetCode}
              title="Reset to starter code"
              className="flex items-center gap-1.5 text-[11px] text-zinc-600 hover:text-zinc-400 font-mono transition-colors px-2 py-1 rounded hover:bg-[#2a2a2e]"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          {/* Monaco */}
          <div className="flex-1 relative overflow-hidden">
            <Editor
              height="100%"
              language={MONACO_LANG[language]}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val ?? "")}
              onMount={(editor) => {
                editorRef.current = editor;
              }}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                fontLigatures: true,
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                lineHeight: 22,
                tabSize: 4,
                automaticLayout: true,
                quickSuggestions: true,
                suggestOnTriggerCharacters: true,
                bracketPairColorization: { enabled: true },
                renderLineHighlight: "all",
                overviewRulerBorder: false,
              }}
            />
          </div>

          {/* Hint banner */}
          {hint && (
            <div className="bg-[#1a1d2e] border-t border-[#6a5ed9]/20 px-5 py-3 flex items-start gap-3">
              <Lightbulb className="w-4 h-4 text-[#6a5ed9] shrink-0 mt-0.5" />
              <p className="text-sm text-zinc-300 leading-relaxed">{hint}</p>
              <button
                onClick={() => setHint(null)}
                className="text-zinc-600 hover:text-zinc-400 ml-auto shrink-0 text-xs"
              >
                ×
              </button>
            </div>
          )}

          {/* Success overlay action */}
          {showSuccess && (
            <div className="bg-emerald-950/30 border-t border-emerald-800/30 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold text-emerald-400">
                  All tests passed!
                </span>
              </div>
              <button
                onClick={handleNext}
                disabled={isAdvancing}
                className="flex items-center gap-2 text-sm font-bold text-white bg-[#6a5ed9] hover:bg-[#7b6fe0] px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {isAdvancing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
                {isLastQuestion ? "Finish & View Report" : "Next Question"}
              </button>
            </div>
          )}

          {/* Action bar */}
          <div className="bg-[#111113] border-t border-[#2a2a2e] px-5 py-3 flex items-center gap-3 shrink-0">
            {/* Run */}
            <button
              onClick={handleRun}
              disabled={isRunning || isSubmitting}
              id="run-code-btn"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#1a1a1e] border border-[#2a2a2e] text-zinc-300 hover:bg-[#2a2a2e] hover:text-white transition-colors disabled:opacity-40"
            >
              {isRunning ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              Run Code
            </button>

            {/* Hint */}
            <button
              onClick={handleHint}
              disabled={hintLoading}
              id="get-hint-btn"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#1a1d2e] border border-[#6a5ed9]/20 text-[#6a5ed9] hover:bg-[#6a5ed9]/10 transition-colors disabled:opacity-40"
            >
              {hintLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Lightbulb className="w-3.5 h-3.5" />
              )}
              Hint
            </button>

            <div className="flex-1" />

            {/* Next (if not last) or Finish */}
            {!showSuccess && (
              <button
                onClick={handleNext}
                disabled={isAdvancing}
                id="next-question-btn"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#1a1a1e] border border-[#2a2a2e] text-zinc-400 hover:text-zinc-200 hover:bg-[#2a2a2e] transition-colors disabled:opacity-40"
              >
                {isAdvancing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
                {isLastQuestion ? "Finish" : "Skip"}
              </button>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={isRunning || isSubmitting}
              id="submit-code-btn"
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold bg-[#1bb152] hover:bg-emerald-500 text-white transition-colors disabled:opacity-40"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* Test Results */}
      <TestResults
        result={runResult}
        isRunning={isRunning}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
