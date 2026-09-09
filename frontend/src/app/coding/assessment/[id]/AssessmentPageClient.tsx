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
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Loader2,
  Terminal,
  Shield,
  ShieldAlert,
  AlertTriangle,
  Maximize2,
  LogOut,
  Lock,
} from "lucide-react";

import { AssessmentHeader } from "@/components/coding/AssessmentHeader";
import { ProblemPanel } from "@/components/coding/ProblemPanel";
import { TestResults } from "@/components/coding/TestResults";
import { MarkdownView } from "@/components/shared/MarkdownView";

import {
  runCode,
  submitCode,
  nextQuestion,
  getHint,
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

  // ── Assessment State ───────────────────────────────────────────────────────
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
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);

  const [, setLastSubmitResult] = useState<SubmitResult | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [, setIsComplete] = useState(false);

  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // ── OA Proctoring & Fullscreen Lockdown State ─────────────────────────────
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasStartedProctoring, setHasStartedProctoring] = useState(false);
  const [tabViolations, setTabViolations] = useState(0);
  const [showTabViolationModal, setShowTabViolationModal] = useState(false);
  const [showEndTestModal, setShowEndTestModal] = useState(false);
  const [showAutoTerminateModal, setShowAutoTerminateModal] = useState(false);
  const [autoTerminateCountdown, setAutoTerminateCountdown] = useState<number | null>(null);
  const [isTerminating, setIsTerminating] = useState(false);

  const lastViolationTime = useRef<number>(0);
  const editorRef = useRef<unknown>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("coding_theme") as "dark" | "light" | null;
      if (saved === "dark" || saved === "light") {
        setTheme(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("coding_theme", next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!hasStartedProctoring || isTerminating) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [hasStartedProctoring, isTerminating]);

  // ── Fullscreen Tracking ───────────────────────────────────────────────────
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handleStartProctoring = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn("Fullscreen trigger was declined or blocked:", err);
    }
    setHasStartedProctoring(true);
  };

  const handleReturnToFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn("Return to fullscreen was blocked:", err);
    }
  };

  // ── End Test & Submission Execution ───────────────────────────────────────
  const handleConfirmEndTest = useCallback(async () => {
    setIsTerminating(true);
    setShowEndTestModal(false);
    setShowAutoTerminateModal(false);
    setAutoTerminateCountdown(null);

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      // ignore
    }

    router.push(`/coding/assessment/${assessmentId}/report`);
  }, [assessmentId, router]);

  // ── Auto-terminate Countdown Hook ─────────────────────────────────────────
  useEffect(() => {
    if (autoTerminateCountdown === null) return;
    if (autoTerminateCountdown <= 0) {
      handleConfirmEndTest();
      return;
    }
    const timer = setTimeout(() => {
      setAutoTerminateCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [autoTerminateCountdown, handleConfirmEndTest]);

  // ── Tab Switch / Focus Loss Detection ─────────────────────────────────────
  const recordViolation = useCallback(() => {
    if (isTerminating) return;
    const now = Date.now();
    // Debounce to prevent simultaneous trigger by visibilitychange and window blur
    if (now - lastViolationTime.current < 1500) return;
    lastViolationTime.current = now;

    setTabViolations((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        setIsTerminating(true);
        setShowAutoTerminateModal(true);
        setShowTabViolationModal(false);
        setAutoTerminateCountdown(3);
      } else {
        setShowTabViolationModal(true);
      }
      return next;
    });
  }, [isTerminating]);

  useEffect(() => {
    if (!hasStartedProctoring || isTerminating) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordViolation();
      }
    };

    const handleBlur = () => {
      recordViolation();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [hasStartedProctoring, isTerminating, recordViolation]);

  // ── Browser Navigation Guard (Back button & Tab closure) ─────────────────
  useEffect(() => {
    if (!hasStartedProctoring) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isTerminating) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    // Trap back button
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      setShowEndTestModal(true);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasStartedProctoring, isTerminating]);

  // ── Reset on question change ───────────────────────────────────────────────
  useEffect(() => {
    setCode(question.starterCode[language]);
    setRunResult(null);
    setShowSuccess(false);
    setHint(null);
  }, [question, language]);

  // ── Language Switch ────────────────────────────────────────────────────────
  const handleLanguageChange = (newLang: Language) => {
    if (newLang === language) return;
    setLanguage(newLang);
    setCode(question.starterCode[newLang]);
  };

  // ── Run Code (Visible Tests Only) ─────────────────────────────────────────
  const handleRun = useCallback(async () => {
    if (isRunning || isSubmitting) return;
    setIsRunning(true);
    setIsConsoleOpen(true);
    try {
      const result = await runCode(assessmentId, question.id, language, code);
      setRunResult(result);
    } catch (err) {
      setRunResult({
        status: "RUNTIME_ERROR",
        passedTests: 0,
        totalTests: question.visibleTestCases.length,
        executionTimeMs: 0,
        runtimeError: String(err),
        testDetails: [],
        compileError: null,
      });
    } finally {
      setIsRunning(false);
    }
  }, [assessmentId, question.id, question.visibleTestCases.length, language, code, isRunning, isSubmitting]);

  // ── Submit Code (Hidden Test Cases + Sentry AST) ───────────────────────────
  const handleSubmit = useCallback(async () => {
    if (isRunning || isSubmitting) return;
    setIsSubmitting(true);
    setIsConsoleOpen(true);
    try {
      const result = await submitCode(assessmentId, question.id, language, code);
      setRunResult(result);
      setLastSubmitResult(result);

      if (result.status === "ACCEPTED") {
        setShowSuccess(true);
      }

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
  }, [assessmentId, question.id, language, code, isRunning, isSubmitting]);

  // ── Keyboard shortcuts: Ctrl+' to Run, Ctrl+Enter to Submit ───────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "'") {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSubmit, handleRun]);

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

  const isLastQuestion = questionIndex + 1 >= totalQuestions;
  const isDark = theme === "dark";

  const isLocked =
    !hasStartedProctoring ||
    isTerminating ||
    tabViolations >= 3 ||
    !isFullscreen ||
    showTabViolationModal ||
    showEndTestModal ||
    showAutoTerminateModal;

  return (
    <div
      className={`h-screen flex flex-col overflow-hidden transition-colors duration-200 relative ${
        isDark ? "bg-[#111114] text-zinc-200" : "bg-[#f8fafc] text-zinc-800"
      }`}
    >
      {/* ── Top Header ────────────────────────────────────────────────────── */}
      <AssessmentHeader
        questionIndex={questionIndex}
        totalQuestions={totalQuestions}
        timeRemainingSeconds={timeRemaining}
        status="active"
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onEndTest={() => setShowEndTestModal(true)}
        onRun={handleRun}
        onSubmit={handleSubmit}
        isRunning={isRunning}
        isSubmitting={isSubmitting}
        onNext={questionIndex < totalQuestions - 1 ? handleNext : undefined}
        tabViolations={tabViolations}
        maxViolations={3}
      />

      {/* ── Main Workspace: LeetCode Two-Column Split ────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Problem Panel */}
        <div
          className={`w-[46%] min-w-[360px] max-w-[620px] border-r shrink-0 flex flex-col transition-colors duration-200 ${
            isDark ? "border-[#2e2e33]" : "border-zinc-200"
          }`}
        >
          <ProblemPanel
            problem={question}
            submissions={submissions}
            theme={theme}
            questionIndex={questionIndex}
          />
        </div>

        {/* Right: Code Editor + LeetCode Console Drawer */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Editor Top Toolbar */}
          <div
            className={`border-b flex items-center justify-between px-4 py-2 shrink-0 select-none transition-colors duration-200 ${
              isDark
                ? "bg-[#18181b] border-[#2e2e33]"
                : "bg-zinc-100/90 border-zinc-200"
            }`}
          >
            {/* Language Switcher Tabs */}
            <div className="flex items-center gap-1">
              {(["python", "javascript", "cpp"] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
                    language === lang
                      ? isDark
                        ? "bg-[#27272a] text-white shadow-xs"
                        : "bg-white text-zinc-900 shadow-xs border border-zinc-200"
                      : isDark
                      ? "text-zinc-400 hover:text-zinc-200 hover:bg-[#202023]"
                      : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60"
                  }`}
                >
                  {LANGUAGE_LABELS[lang]}
                </button>
              ))}
            </div>

            {/* Editor Action Shortcuts */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCode(question.starterCode[language])}
                title="Reset code template"
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  isDark
                    ? "text-zinc-400 hover:text-white hover:bg-[#27272a]"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/60"
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleHint}
                disabled={hintLoading}
                title="Request AST Adaptive Hint"
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                  hint
                    ? "text-amber-400 bg-amber-950/30 border border-amber-800/40"
                    : isDark
                    ? "text-zinc-400 hover:text-amber-300 hover:bg-[#27272a]"
                    : "text-zinc-500 hover:text-amber-600 hover:bg-zinc-200/60"
                }`}
              >
                {hintLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Lightbulb className="w-3 h-3" />
                )}
                <span>Hint</span>
              </button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 relative overflow-hidden">
            <Editor
              height="100%"
              language={MONACO_LANG[language]}
              value={code}
              theme={isDark ? "vs-dark" : "light"}
              onChange={(val) => setCode(val ?? "")}
              onMount={(editor) => {
                editorRef.current = editor;
              }}
              options={{
                fontSize: 13,
                fontFamily: "var(--font-geist-mono), 'Fira Code', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                renderLineHighlight: "all",
                tabSize: 4,
                wordWrap: "on",
                padding: { top: 12, bottom: 12 },
                smoothScrolling: true,
                cursorBlinking: "smooth",
                overviewRulerBorder: false,
                hideCursorInOverviewRuler: true,
                readOnly: isLocked,
                domReadOnly: isLocked,
              }}
            />

            {/* Hint Callout Overlay */}
            {hint && (
              <div
                className={`absolute bottom-3 left-4 right-4 p-3 rounded-xl border shadow-lg backdrop-blur-md transition-all z-10 flex items-start gap-3 ${
                  isDark
                    ? "bg-[#18181b]/95 border-amber-700/40 text-amber-200"
                    : "bg-amber-50/95 border-amber-300 text-amber-900"
                }`}
              >
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1 text-xs font-mono leading-relaxed">
                  <span className="font-bold block mb-1">AST Adaptive Hint:</span>
                  <MarkdownView content={hint} />
                </div>
                <button
                  onClick={() => setHint(null)}
                  className="text-xs opacity-60 hover:opacity-100 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* LeetCode Style Bottom Console Drawer */}
          <TestResults
            result={runResult}
            testCases={question.visibleTestCases}
            isRunning={isRunning}
            isSubmitting={isSubmitting}
            theme={theme}
            isOpen={isConsoleOpen}
            onToggleOpen={() => setIsConsoleOpen(false)}
          />

          {/* Bottom Dock Control Bar */}
          <div
            className={`border-t px-4 py-2 flex items-center justify-between shrink-0 select-none ${
              isDark ? "bg-[#18181b] border-[#2e2e33]" : "bg-white border-zinc-200"
            }`}
          >
            {/* Left: Console toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsConsoleOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                  isDark
                    ? "text-zinc-400 hover:text-zinc-200 hover:bg-[#242428]"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                }`}
              >
                <Terminal className="w-3 h-3" />
                <span>Console</span>
                {isConsoleOpen ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronUp className="w-3 h-3" />
                )}
              </button>
            </div>

            {/* Right: Skip, Run, Submit */}
            <div className="flex items-center gap-2.5">
              {!showSuccess && (
                <button
                  onClick={handleNext}
                  disabled={isAdvancing}
                  id="next-question-btn"
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors border cursor-pointer ${
                    isDark
                      ? "bg-[#1d1d20] border-[#2e2e33] text-zinc-400 hover:text-zinc-200"
                      : "bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  {isAdvancing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                  <span>{isLastQuestion ? "Finish" : "Skip"}</span>
                </button>
              )}

              {/* Run Code Button */}
              <button
                onClick={handleRun}
                disabled={isRunning || isSubmitting}
                id="run-code-btn"
                title="Run code against visible test cases (Ctrl + ')"
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors border disabled:opacity-40 cursor-pointer ${
                  isDark
                    ? "bg-[#25252a] hover:bg-[#303036] text-white border-[#38383e]"
                    : "bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-300"
                }`}
              >
                {isRunning ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current text-zinc-400" />
                )}
                <span>Run</span>
              </button>

              {/* Submit Code Button */}
              <button
                onClick={handleSubmit}
                disabled={isRunning || isSubmitting}
                id="submit-code-btn"
                title="Submit code against all test cases (Ctrl + Enter)"
                className="flex items-center gap-1.5 px-5 py-1.5 rounded-lg text-xs font-mono font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all disabled:opacity-40 shadow-sm cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Submit</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ── OA PROCTORING MODALS & LOCKDOWN OVERLAYS ───────────────────────── */}
      {/* ────────────────────────────────────────────────────────────────────── */}

      {/* 1. Initial Assessment Entry & Fullscreen Agreement Modal */}
      {!hasStartedProctoring && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-[#0e0d14] border border-[#1f1c2b] rounded-2xl p-6 sm:p-8 shadow-2xl text-left space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#1a1726]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-iris/20 border border-iris/40 flex items-center justify-center text-iris">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-iris/20 text-iris-light border border-iris/30 px-2 py-0.5 rounded uppercase">
                      Online Assessment (OA) Mode
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-1">
                    Proctored Assessment Chamber
                  </h2>
                </div>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              This coding assessment enforces automated proctoring guidelines to ensure evaluation integrity, identical to enterprise technical screenings:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#12111a] border border-[#1f1c2b] space-y-1">
                <div className="flex items-center gap-2 text-iris font-bold">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Mandatory Fullscreen</span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  The test runs in full-screen mode. Exiting fullscreen will lock the chamber until restored.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#12111a] border border-[#1f1c2b] space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>No Tab Switching</span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Navigating to other browser tabs, windows, or applications is strictly logged.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#12111a] border border-[#1f1c2b] space-y-1">
                <div className="flex items-center gap-2 text-rose-400 font-bold">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>3-Strikes Violation Policy</span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Reaching 3 focus or tab loss violations immediately auto-terminates and submits the test.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#12111a] border border-[#1f1c2b] space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Single Exit Pathway</span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Navigation is locked. The only way to exit is by completing or clicking &quot;End Test&quot;.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1a1726]">
              <button
                onClick={handleStartProctoring}
                className="w-full py-3 px-6 rounded-xl bg-iris hover:bg-iris/90 text-white font-mono text-sm font-bold shadow-lg shadow-iris/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <span>Enter Fullscreen & Begin Assessment</span>
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Fullscreen Required Blocking Overlay (Triggered if candidate exits fullscreen) */}
      {hasStartedProctoring && !isFullscreen && !isTerminating && (
        <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#0e0d14] border border-amber-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-5">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Maximize2 className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white tracking-tight font-mono">
                Fullscreen Mode Required
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                You have exited fullscreen mode. To maintain test integrity, the assessment chamber is locked until fullscreen is restored.
              </p>
            </div>

            <button
              onClick={handleReturnToFullscreen}
              className="w-full py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Return to Fullscreen
            </button>
          </div>
        </div>
      )}

      {/* 3. Tab Switch Violation Warning Modal */}
      {showTabViolationModal && !showAutoTerminateModal && (
        <div className="fixed inset-0 z-[130] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#0e0d14] border border-red-500/50 rounded-2xl p-6 shadow-2xl text-left space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider">
                  Proctoring Alert
                </span>
                <h3 className="text-base font-bold text-white font-mono">
                  Tab or Window Switch Detected!
                </h3>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-red-950/30 border border-red-800/40 text-xs font-mono text-red-200">
              <p className="font-bold">
                Violation Warning: Strike {tabViolations} of 3
              </p>
              <p className="text-[11px] text-red-300/80 mt-1 leading-relaxed">
                Switching tabs, windows, or minimizing the browser is strictly prohibited. If you reach 3 strikes, your assessment will automatically terminate.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowTabViolationModal(false)}
                className="w-full py-2.5 rounded-xl bg-iris hover:bg-iris/90 text-white font-mono text-xs font-bold transition-all cursor-pointer"
              >
                I Understand — Resume Assessment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Auto-Termination Modal (3 Strikes Exceeded) */}
      {showAutoTerminateModal && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 select-none">
          <div className="max-w-md w-full bg-[#0e0d14] border border-red-600 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-5">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 animate-pulse">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white tracking-tight font-mono">
                Assessment Terminated: Policy Violation
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                You have reached 3 tab switch / focus loss violations (3/3). In accordance with Online Assessment guidelines, all code inputs are locked and your test has been finalized.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-xs font-mono text-red-300">
              Submitting code and opening diagnostic report in{" "}
              <span className="font-bold text-white text-sm">{autoTerminateCountdown ?? 0}s</span>...
            </div>

            <button
              onClick={handleConfirmEndTest}
              className="w-full py-3 px-6 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <span>View Diagnostic Report Now</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 5. End Test Confirmation Modal (Single deliberate exit pathway) */}
      {showEndTestModal && (
        <div className="fixed inset-0 z-[130] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#0e0d14] border border-[#1f1c2b] rounded-2xl p-6 shadow-2xl text-left space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-mono">
                  End Assessment & Submit?
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Confirm test conclusion and score generation
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Are you sure you want to end your assessment? All code and submissions written so far will be finalized and evaluated with Tree-sitter AST and test case metrics. You will not be able to resume this session.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowEndTestModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-zinc-300 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700 transition-colors cursor-pointer"
              >
                Cancel & Continue Coding
              </button>
              <button
                onClick={handleConfirmEndTest}
                className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-white bg-red-600 hover:bg-red-500 transition-colors cursor-pointer shadow-sm shadow-red-600/30"
              >
                Yes, End Test & View Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
