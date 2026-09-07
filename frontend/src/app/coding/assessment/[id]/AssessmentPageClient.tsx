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
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);

  const [, setLastSubmitResult] = useState<SubmitResult | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [, setIsComplete] = useState(false);

  const [theme, setTheme] = useState<"dark" | "light">("dark");

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
  const handleRun = useCallback(async () => {
    if (!code.trim()) return;
    setIsRunning(true);
    setIsConsoleOpen(true);
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
  }, [assessmentId, question.id, language, code]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!code.trim()) return;
    setIsSubmitting(true);
    setIsConsoleOpen(true);
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
  }, [assessmentId, question.id, language, code]);

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

  const handleExit = () => {
    if (confirm("Exit assessment? Your progress will be saved.")) {
      router.push("/coding");
    }
  };

  const isLastQuestion = questionIndex + 1 >= totalQuestions;
  const isDark = theme === "dark";

  return (
    <div
      className={`h-screen flex flex-col overflow-hidden transition-colors duration-200 ${
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
        onExit={handleExit}
        onRun={handleRun}
        onSubmit={handleSubmit}
        isRunning={isRunning}
        isSubmitting={isSubmitting}
        onNext={questionIndex < totalQuestions - 1 ? handleNext : undefined}
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
                  className={`px-3 py-1 rounded text-xs font-mono font-medium transition-all ${
                    language === lang
                      ? isDark
                        ? "bg-[#2f2f35] text-white shadow-sm ring-1 ring-white/10"
                        : "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-300"
                      : isDark
                      ? "text-zinc-400 hover:text-zinc-200 hover:bg-[#25252a]"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200"
                  }`}
                >
                  {LANGUAGE_LABELS[lang]}
                </button>
              ))}
            </div>

            {/* Reset Code Button */}
            <button
              onClick={handleResetCode}
              title="Reset code to original template"
              className={`flex items-center gap-1.5 text-xs font-mono transition-colors px-2 py-1 rounded ${
                isDark
                  ? "text-zinc-400 hover:text-zinc-200 hover:bg-[#25252a]"
                  : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/80"
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 relative overflow-hidden">
            <Editor
              height="100%"
              language={MONACO_LANG[language]}
              theme={isDark ? "vs-dark" : "vs"}
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
            <div
              className={`border-t px-5 py-3 flex items-start gap-3 transition-colors duration-200 ${
                isDark
                  ? "bg-[#1d1d26] border-[#6a5ed9]/30 text-zinc-300"
                  : "bg-indigo-50/80 border-indigo-200 text-zinc-800"
              }`}
            >
              <Lightbulb className="w-4 h-4 text-[#ffc01e] shrink-0 mt-0.5" />
              <div className="flex-1">
                <MarkdownView content={hint} isDark={isDark} />
              </div>
              <button
                onClick={() => setHint(null)}
                className={`ml-auto shrink-0 text-xs ${
                  isDark
                    ? "text-zinc-500 hover:text-zinc-300"
                    : "text-zinc-400 hover:text-zinc-700"
                }`}
              >
                ×
              </button>
            </div>
          )}

          {/* Success overlay action */}
          {showSuccess && (
            <div
              className={`border-t px-5 py-3 flex items-center justify-between transition-colors duration-200 ${
                isDark
                  ? "bg-[#00b8a3]/10 border-[#00b8a3]/20"
                  : "bg-emerald-50 border-emerald-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00b8a3]" />
                <span className="text-sm font-bold text-[#00b8a3]">
                  All test cases passed! Ready for next question.
                </span>
              </div>
              <button
                onClick={handleNext}
                disabled={isAdvancing}
                className="flex items-center gap-2 text-xs font-bold text-white bg-[#00b8a3] hover:bg-[#00a895] px-4 py-2 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
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

          {/* LeetCode Bottom Action Bar */}
          <div
            className={`border-t px-4 py-2.5 flex items-center justify-between shrink-0 transition-colors duration-200 select-none ${
              isDark
                ? "bg-[#18181b] border-[#2e2e33]"
                : "bg-white border-zinc-200 shadow-[0_-1px_2px_rgba(0,0,0,0.03)]"
            }`}
          >
            {/* Left: Console toggle button & Hint */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsConsoleOpen(!isConsoleOpen)}
                id="toggle-console-btn"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors border ${
                  isDark
                    ? isConsoleOpen
                      ? "bg-[#25252a] text-white border-[#38383e]"
                      : "bg-[#1d1d20] text-zinc-400 hover:text-zinc-200 border-[#2e2e33]"
                    : isConsoleOpen
                    ? "bg-zinc-200 text-zinc-900 border-zinc-300"
                    : "bg-zinc-100 text-zinc-600 hover:text-zinc-900 border-zinc-200"
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                <span>Console</span>
                {isConsoleOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                ) : (
                  <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
                )}
              </button>

              <button
                onClick={handleHint}
                disabled={hintLoading}
                id="get-hint-btn"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors border ${
                  isDark
                    ? "bg-[#1d1d20] text-amber-300/90 border-[#2e2e33] hover:bg-amber-950/20"
                    : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                }`}
              >
                {hintLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Lightbulb className="w-3.5 h-3.5 text-[#ffc01e]" />
                )}
                <span>Hint</span>
              </button>
            </div>

            {/* Right: Skip, Run, Submit */}
            <div className="flex items-center gap-2.5">
              {!showSuccess && (
                <button
                  onClick={handleNext}
                  disabled={isAdvancing}
                  id="next-question-btn"
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors border ${
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
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors border disabled:opacity-40 ${
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
                className="flex items-center gap-1.5 px-5 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#00b8a3] hover:bg-[#00a895] text-white transition-all disabled:opacity-40 shadow-sm"
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
    </div>
  );
}
