"use client";
// components/coding/AssessmentReport.tsx
// Final candidate report component with standard enterprise navigation and obsidian styling

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Target,
  Zap,
  Code2,
  Bug,
  Brain,
  ArrowLeft,
  Printer,
  ChevronRight,
  ShieldCheck,
  Award,
  Route,
  Gauge,
  ListChecks,
  Sparkles,
} from "lucide-react";
import { AssessmentReport, SkillProfile } from "@/lib/codingApi";

interface AssessmentReportProps {
  report: AssessmentReport;
  onReturnDashboard: () => void;
}

const SKILL_LABELS: Record<string, string> = {
  arrays: "Arrays",
  strings: "Strings",
  hashmaps: "Hash Maps",
  slidingWindow: "Sliding Window",
  binarySearch: "Binary Search",
  stacks: "Stacks",
  trees: "Trees",
  graphs: "Graphs",
  greedy: "Greedy",
  recursion: "Recursion",
  dynamicProgramming: "Dynamic Programming",
  complexityAnalysis: "Complexity Analysis",
};

const formatLabel = (value: string) =>
  value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const performanceColor = (value: number) =>
  value >= 80
    ? "text-emerald-700 dark:text-emerald-400"
    : value >= 50
    ? "text-amber-700 dark:text-amber-400"
    : "text-rose-700 dark:text-rose-400";

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full h-2 bg-zinc-100 dark:bg-[#1b1926] rounded-full overflow-hidden border border-zinc-200 dark:border-[#262335]">
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function ScoreCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-[#12111a] border border-zinc-200 dark:border-[#1f1c2b] hover:border-zinc-300 dark:hover:border-[#2a253a] rounded-xl p-4.5 space-y-3 shadow-sm dark:shadow-none transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-zinc-50 dark:bg-[#181624] border border-zinc-200 dark:border-[#221e33] flex items-center justify-center">
            <Icon className={`w-3.5 h-3.5 ${color}`} />
          </div>
          <span className="text-xs font-mono text-zinc-700 dark:text-zinc-300 font-medium">{label}</span>
        </div>
        <span className={`text-xl font-bold font-mono ${color}`}>{value}</span>
      </div>
      <ScoreBar value={value} color={color.replace("text-", "bg-")} />
    </div>
  );
}

export function AssessmentReportComponent({
  report,
  onReturnDashboard,
}: AssessmentReportProps) {
  const router = useRouter();
  const { scores, skillProfile, areas, evidence, aiNarrative, stats, confidence } = report;
  const analysis = report.analysis ?? {
    topicPerformance: {},
    difficultyProgression: [],
    errorCategories: {},
    adaptationHistory: [],
  };

  const safeScores = {
    overallScore: scores?.overallScore ?? 0,
    problemSolving: scores?.problemSolving ?? 0,
    correctness: scores?.correctness ?? 0,
    algorithmKnowledge: scores?.algorithmKnowledge ?? 0,
    efficiency: scores?.efficiency ?? 0,
    debugging: scores?.debugging ?? 0,
    codeQuality: scores?.codeQuality ?? 0,
    problemsSolved: scores?.problemsSolved ?? 0,
    totalAttempted: scores?.totalAttempted ?? 0,
  };

  // Determine hiring badge
  const overall = safeScores.overallScore;
  const badge =
    evidence.length === 0 && overall === 0
      ? { label: "Incomplete / Unscored", color: "text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-600/40 bg-zinc-100 dark:bg-zinc-900/60" }
      : overall >= 85
      ? { label: "Strong Hire", color: "text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/30" }
      : overall >= 70
      ? { label: "Hire", color: "text-teal-700 dark:text-teal-400 border-teal-300 dark:border-teal-500/40 bg-teal-50 dark:bg-teal-950/30" }
      : overall >= 50
      ? { label: "Needs Work", color: "text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-950/30" }
      : { label: "No Hire", color: "text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-950/30" };

  const algo_skills = [
    "arrays", "strings", "hashmaps", "slidingWindow", "binarySearch",
    "stacks", "trees", "graphs", "greedy", "recursion", "dynamicProgramming",
  ] as (keyof SkillProfile)[];

  const topicEntries = Object.entries(analysis.topicPerformance).sort((a, b) => b[1] - a[1]);
  const strongestTopic = topicEntries[0];
  const focusTopic = [...topicEntries].sort((a, b) => a[1] - b[1])[0];
  const hasFocusTopic = Boolean(focusTopic && focusTopic[1] < 70);
  const totalAttempts = evidence.reduce((sum, item) => sum + item.attempts, 0);
  const averageAttempts = evidence.length ? totalAttempts / evidence.length : 0;
  const errorEntries = Object.entries(analysis.errorCategories).sort((a, b) => b[1] - a[1]);
  const analyzedSolutions = evidence.filter(
    (item) => item.complexity && item.complexity.estimated !== "Unknown"
  ).length;
  const averageMinutes = stats.totalQuestionsAttempted
    ? stats.elapsedSeconds / 60 / stats.totalQuestionsAttempted
    : 0;

  const deterministicSummary = evidence.length
    ? [
        `The adaptive assessment evaluated ${stats.totalQuestionsAttempted} question${stats.totalQuestionsAttempted === 1 ? "" : "s"} with an overall correctness score of ${safeScores.correctness}%.`,
        strongestTopic
          ? `${formatLabel(strongestTopic[0])} was the strongest observed topic at ${strongestTopic[1]}%.`
          : "Topic-level evidence is not available yet.",
        focusTopic && hasFocusTopic && focusTopic[0] !== strongestTopic?.[0]
          ? `${formatLabel(focusTopic[0])} has the most room for improvement at ${focusTopic[1]}%.`
          : "",
        analysis.adaptationHistory.length
          ? `The assessment made ${analysis.adaptationHistory.length} recorded adaptation${analysis.adaptationHistory.length === 1 ? "" : "s"} as evidence accumulated.`
          : "No adaptation decision was recorded.",
      ]
        .filter(Boolean)
        .join(" ")
    : "There is not enough submitted coding evidence to produce an adaptive assessment summary.";

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#08070c] text-zinc-800 dark:text-zinc-200 pb-20 font-sans selection:bg-iris selection:text-white transition-colors duration-200 print:bg-white print:text-black">
      {/* ── Standard Navigation Bar ───────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0e0d14]/90 backdrop-blur-md border-b border-zinc-200 dark:border-[#1f1c2b] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Back to Dashboard Button */}
          <button
            onClick={onReturnDashboard}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-medium text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white bg-zinc-50 hover:bg-zinc-100 dark:bg-[#14121e] dark:hover:bg-[#1a1726] border border-zinc-200 dark:border-[#1f1c2b] hover:border-zinc-300 dark:hover:border-[#2a253a] transition-all cursor-pointer group shadow-2xs"
            title="Return to Candidate Dashboard"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Dashboard</span>
          </button>

          {/* Back to Coding Chamber Button */}
          <button
            onClick={() => router.push("/coding")}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 bg-zinc-50 hover:bg-zinc-100 dark:bg-[#12111a] dark:hover:bg-[#181624] border border-zinc-200 dark:border-[#1f1c2b] transition-all cursor-pointer shadow-2xs"
            title="Return to Coding Assessments List"
          >
            <Code2 className="w-3.5 h-3.5 text-iris" />
            <span>Coding Tracks</span>
          </button>

          <div className="hidden md:block h-4 w-px bg-zinc-200 dark:bg-[#1f1c2b]" />

          {/* Brand Mark */}
          <div className="hidden md:flex items-center gap-2 text-xs font-mono font-bold text-zinc-900 dark:text-white tracking-tight">
            <span className="text-iris">Rozgar Sarthi</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-iris/15 text-iris-light border border-iris/25 uppercase">
              Evaluation Report
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 bg-zinc-50 hover:bg-zinc-100 dark:bg-[#12111a] dark:hover:bg-[#181622] border border-zinc-200 dark:border-[#1f1c2b] transition-colors cursor-pointer"
            title="Print or Save PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print Report</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Evaluation Sealed</span>
          </div>
        </div>
      </header>

      {/* ── Main Report Content ───────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-mono text-zinc-500">
          <Link href="/dashboard" className="hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/coding" className="hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors">
            Coding Assessment
          </Link>
          <span>/</span>
          <span className="text-zinc-700 dark:text-zinc-300 font-semibold">Diagnostic Report</span>
        </nav>

        {/* ── Header Title & Badge ──────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#0e0d14] border border-zinc-200 dark:border-[#1f1c2b] rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-sm relative overflow-hidden">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-iris/10 rounded-full blur-3xl pointer-events-none -z-0" />

          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 text-iris font-mono text-xs font-bold uppercase tracking-wider bg-iris/10 border border-iris/20 px-3 py-1 rounded-full">
              <Award className="w-3.5 h-3.5" />
              <span>Assessment Concluded & Analyzed</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-white tracking-tight">
              Algorithmic Competency Report
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <div
                className={`inline-flex items-center gap-2 px-4 py-1 rounded-full border text-xs font-mono font-bold ${badge.color}`}
              >
                <Target className="w-4 h-4" />
                <span>Recommendation: {badge.label}</span>
              </div>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono pt-1">
              {stats.totalQuestionsAttempted} questions attempted ·{" "}
              {scores.problemsSolved} solved ·{" "}
              {Math.round(stats.elapsedSeconds / 60)}m {Math.round(stats.elapsedSeconds % 60)}s elapsed duration
            </p>
          </div>
        </div>

        {/* ── Overall Score Card ────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#0e0d14] border border-zinc-200 dark:border-[#1f1c2b] rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">
              Overall Benchmark Index
            </span>
            <div className="text-6xl sm:text-7xl font-bold font-mono text-zinc-950 dark:text-white tracking-tight">
              {overall}
              <span className="text-2xl sm:text-3xl text-zinc-500 font-normal">/100</span>
            </div>
          </div>

          <div className="w-full max-w-md mx-auto h-3 bg-zinc-100 dark:bg-[#181622] border border-zinc-200 dark:border-[#221e33] rounded-full overflow-hidden p-0.5">
            <div
              className="h-full rounded-full transition-all duration-1000 shadow-sm shadow-iris/40"
              style={{
                width: `${Math.min(100, Math.max(5, overall))}%`,
                background: "linear-gradient(90deg, #7c6df5, #3f71d4, #10b981)",
              }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-600 dark:text-zinc-400 font-mono">
            <span>Assessment Confidence: <strong className="text-zinc-900 dark:text-zinc-200">{confidence}%</strong></span>
            <span>•</span>
            <span>Hidden Test Pass Rate: <strong className="text-emerald-700 dark:text-emerald-400">{stats.hiddenTestPassRate}%</strong></span>
          </div>

          {aiNarrative && (
            <div className="border-t border-zinc-200 dark:border-[#1a1726] pt-5 mt-4 max-w-2xl mx-auto">
              <div className="mb-2 text-left text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                Optional AI-generated recruiter narrative
              </div>
              <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed italic bg-zinc-50 dark:bg-[#12111a] border border-zinc-200 dark:border-[#1f1c2b] rounded-xl p-4 text-left">
                &ldquo;{aiNarrative}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* ── Adaptive Assessment Summary ─────────────────────────────────── */}
        <section className="bg-indigo-50 dark:bg-iris/10 border border-indigo-200 dark:border-iris/25 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#151226] border border-indigo-200 dark:border-iris/25 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-iris" />
            </div>
            <div className="space-y-2">
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-iris">
                  Deterministic assessment summary
                </div>
                <h2 className="text-base font-bold text-zinc-950 dark:text-white">
                  Adaptive Assessment Summary
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                {deterministicSummary}
              </p>
            </div>
          </div>
        </section>

        {/* ── Adaptive Journey & Difficulty Progression ───────────────────── */}
        <section className="bg-white dark:bg-[#0e0d14] border border-zinc-200 dark:border-[#1f1c2b] rounded-2xl p-5 sm:p-7 space-y-5 shadow-sm">
          <div className="flex items-start justify-between gap-4 border-b border-zinc-200 dark:border-[#1a1726] pb-4">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white">
                <Route className="w-4 h-4 text-iris" />
                Adaptive Assessment Journey
              </h2>
              <p className="mt-1 text-xs text-zinc-500">
                Question, difficulty, and outcome progression from recorded assessment evidence.
              </p>
            </div>
            <span className="shrink-0 text-[10px] font-mono font-bold text-iris bg-iris/10 border border-iris/20 rounded-full px-2.5 py-1">
              {analysis.adaptationHistory.length} Adaptations
            </span>
          </div>

          {analysis.difficultyProgression.length === 0 ? (
            <p className="text-xs text-zinc-500 font-mono">No progression evidence is available.</p>
          ) : (
            <div className="space-y-0">
              {analysis.difficultyProgression.map((step, index) => {
                const questionEvidence = evidence.find((item) => item.questionId === step.questionId);
                return (
                  <div key={`${step.questionId}-${index}`} className="relative flex gap-4 pb-5 last:pb-0">
                    {index < analysis.difficultyProgression.length - 1 && (
                      <div className="absolute left-[15px] top-8 bottom-0 w-px bg-zinc-200 dark:bg-[#2a253a]" />
                    )}
                    <div className="relative z-10 w-8 h-8 rounded-full bg-indigo-50 dark:bg-[#18142e] border border-indigo-200 dark:border-iris/30 flex items-center justify-center text-[11px] font-mono font-bold text-iris shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 rounded-xl bg-zinc-50 dark:bg-[#12111a] border border-zinc-200 dark:border-[#1f1c2b] p-3.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-bold text-zinc-900 dark:text-white">
                            {questionEvidence?.title ?? formatLabel(step.questionId)}
                          </div>
                          <div className="mt-1 text-xs text-zinc-500">
                            {questionEvidence?.topics.map(formatLabel).join(" · ") || "Topic evidence unavailable"}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono">
                          <span className="rounded-full bg-white dark:bg-[#181624] border border-zinc-200 dark:border-[#2a253a] px-2 py-1 text-zinc-700 dark:text-zinc-300">
                            {questionEvidence?.difficulty ?? `Level ${step.difficulty}`}
                          </span>
                          <span className={`font-bold ${performanceColor(step.finalPassRate)}`}>
                            {step.finalPassRate}% pass rate
                          </span>
                          <span className="text-zinc-500">
                            {step.attempts} attempt{step.attempts === 1 ? "" : "s"}
                          </span>
                        </div>
                      </div>
                      {step.adaptiveReason && (
                        <p className="mt-3 border-t border-zinc-200 dark:border-[#24202f] pt-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200">Why this challenge: </span>
                          {step.adaptiveReason}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Topic Performance ───────────────────────────────────────────── */}
        <section className="bg-white dark:bg-[#0e0d14] border border-zinc-200 dark:border-[#1f1c2b] rounded-2xl p-5 sm:p-7 space-y-5 shadow-sm">
          <div className="flex items-start justify-between gap-4 border-b border-zinc-200 dark:border-[#1a1726] pb-4">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white">
                <Gauge className="w-4 h-4 text-iris" />
                Topic-wise Performance
              </h2>
              <p className="mt-1 text-xs text-zinc-500">
                Average final pass rate for submitted questions in each topic.
              </p>
            </div>
          </div>

          {topicEntries.length === 0 ? (
            <p className="text-xs text-zinc-500 font-mono">No topic-level evidence is available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {topicEntries.map(([topic, value], index) => {
                const isFocus = hasFocusTopic && focusTopic?.[0] === topic;
                return (
                  <div key={topic} className="rounded-xl bg-zinc-50 dark:bg-[#12111a] border border-zinc-200 dark:border-[#1f1c2b] p-4 space-y-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        {formatLabel(topic)}
                      </span>
                      <div className="flex items-center gap-2">
                        {index === 0 && (
                          <span className="text-[9px] font-mono font-bold uppercase text-emerald-700 dark:text-emerald-400">
                            Strongest
                          </span>
                        )}
                        {isFocus && (
                          <span className="text-[9px] font-mono font-bold uppercase text-amber-700 dark:text-amber-400">
                            Focus area
                          </span>
                        )}
                        <span className={`text-sm font-mono font-bold ${performanceColor(value)}`}>
                          {value}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden bg-zinc-200 dark:bg-[#211d2d]">
                      <div
                        className={`h-full rounded-full ${value >= 80 ? "bg-emerald-500" : value >= 50 ? "bg-amber-500" : "bg-rose-500"}`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Deterministic Performance Insights ──────────────────────────── */}
        <section className="space-y-3">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white">
              <ListChecks className="w-4 h-4 text-iris" />
              Performance Insights
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              Computed from recorded submissions and static code analysis.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-[#12111a] border border-zinc-200 dark:border-[#1f1c2b] rounded-xl p-4">
              <div className="text-[10px] font-mono uppercase text-zinc-500">Correctness</div>
              <div className={`mt-1 text-2xl font-mono font-bold ${performanceColor(safeScores.correctness)}`}>
                {safeScores.correctness}%
              </div>
              <p className="mt-1 text-xs text-zinc-500">Final submission outcomes</p>
            </div>
            <div className="bg-white dark:bg-[#12111a] border border-zinc-200 dark:border-[#1f1c2b] rounded-xl p-4">
              <div className="text-[10px] font-mono uppercase text-zinc-500">Attempt pattern</div>
              <div className="mt-1 text-2xl font-mono font-bold text-zinc-900 dark:text-white">
                {averageAttempts.toFixed(1)}
              </div>
              <p className="mt-1 text-xs text-zinc-500">Average submissions per problem</p>
            </div>
            <div className="bg-white dark:bg-[#12111a] border border-zinc-200 dark:border-[#1f1c2b] rounded-xl p-4">
              <div className="text-[10px] font-mono uppercase text-zinc-500">Time evidence</div>
              <div className="mt-1 text-2xl font-mono font-bold text-zinc-900 dark:text-white">
                {averageMinutes.toFixed(1)}m
              </div>
              <p className="mt-1 text-xs text-zinc-500">Elapsed time per presented question</p>
            </div>
            <div className="bg-white dark:bg-[#12111a] border border-zinc-200 dark:border-[#1f1c2b] rounded-xl p-4">
              <div className="text-[10px] font-mono uppercase text-zinc-500">Code structure</div>
              <div className="mt-1 text-2xl font-mono font-bold text-iris">
                {analyzedSolutions}/{evidence.length}
              </div>
              <p className="mt-1 text-xs text-zinc-500">Solutions with estimated AST complexity</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#12111a] border border-zinc-200 dark:border-[#1f1c2b] rounded-xl p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-zinc-500 mr-1">
                Recorded error categories
              </span>
              {errorEntries.length ? (
                errorEntries.map(([category, count]) => (
                  <span key={category} className="text-[10px] font-mono font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 rounded-full px-2.5 py-1">
                    {formatLabel(category)} · {count}
                  </span>
                ))
              ) : (
                <span className="text-xs text-zinc-500">No categorized errors in final submissions.</span>
              )}
            </div>
          </div>
        </section>

        {/* ── Score Breakdown ──────────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">
              Telemetry Score Breakdown
            </h2>
            <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-500">6 Dimension Analysis</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <ScoreCard label="Problem Solving" value={safeScores.problemSolving} icon={Brain} color="text-iris" />
            <ScoreCard label="Correctness" value={safeScores.correctness} icon={CheckCircle2} color="text-emerald-600 dark:text-emerald-400" />
            <ScoreCard label="Algorithm Knowledge" value={safeScores.algorithmKnowledge} icon={Activity} color="text-sky-600 dark:text-sky-400" />
            <ScoreCard label="Efficiency" value={safeScores.efficiency} icon={Zap} color="text-amber-600 dark:text-amber-400" />
            <ScoreCard label="Debugging" value={safeScores.debugging} icon={Bug} color="text-teal-600 dark:text-teal-400" />
            <ScoreCard label="Code Quality" value={safeScores.codeQuality} icon={Code2} color="text-purple-600 dark:text-purple-400" />
          </div>
        </div>

        {/* ── Strong / Weak Areas ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Strong */}
          <div className="bg-white dark:bg-[#0e0d14] border border-zinc-200 dark:border-[#1f1c2b] rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-[#1a1726] pb-3">
              <h2 className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                <TrendingUp className="w-4 h-4" />
                <span>Demonstrated Strengths</span>
              </h2>
              <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">
                {areas.strong.length} Domains
              </span>
            </div>

            {areas.strong.length === 0 ? (
              <p className="text-xs text-zinc-500 dark:text-zinc-500 font-mono py-2">No strongly demonstrated skills logged.</p>
            ) : (
              <div className="space-y-2.5">
                {areas.strong.map((skill) => (
                  <div key={skill} className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-[#12111a] border border-zinc-200 dark:border-[#1f1c2b] text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-zinc-800 dark:text-zinc-200 font-medium">{SKILL_LABELS[skill] ?? skill}</span>
                    </div>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                      {Math.round(skillProfile[skill as keyof SkillProfile] as number)}/100
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weak */}
          <div className="bg-white dark:bg-[#0e0d14] border border-zinc-200 dark:border-[#1f1c2b] rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-[#1a1726] pb-3">
              <h2 className="flex items-center gap-2 text-xs font-mono font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                <TrendingDown className="w-4 h-4" />
                <span>Growth & Focus Areas</span>
              </h2>
              <span className="text-[10px] font-mono text-rose-700 dark:text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800/40">
                {areas.weak.length} Domains
              </span>
            </div>

            {areas.weak.length === 0 ? (
              <p className="text-xs text-zinc-500 font-mono py-2">No critical weaknesses identified.</p>
            ) : (
              <div className="space-y-2.5">
                {areas.weak.map((skill) => (
                  <div key={skill} className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-[#12111a] border border-zinc-200 dark:border-[#1f1c2b] text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span className="text-zinc-800 dark:text-zinc-200 font-medium">{SKILL_LABELS[skill] ?? skill}</span>
                    </div>
                    <span className="text-rose-700 dark:text-rose-400 font-bold">
                      {Math.round(skillProfile[skill as keyof SkillProfile] as number)}/100
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Skill Profile Bars ───────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#0e0d14] border border-zinc-200 dark:border-[#1f1c2b] rounded-2xl p-6 sm:p-7 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-[#1a1726] pb-3">
            <h2 className="text-xs font-mono font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">
              Bayesian Skill Distribution
            </h2>
            <span className="text-[11px] font-mono text-zinc-500">11 Algorithmic Verticals</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4">
            {algo_skills.map((skill) => {
              const val = Math.round(skillProfile[skill] as number);
              const color =
                val >= 70 ? "bg-emerald-500" : val >= 45 ? "bg-iris" : "bg-rose-500";
              return (
                <div key={skill} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-700 dark:text-zinc-300 font-medium">{SKILL_LABELS[skill] ?? skill}</span>
                    <span className="text-zinc-900 dark:text-zinc-200 font-bold">{val}</span>
                  </div>
                  <div className="h-2 bg-zinc-100 dark:bg-[#181624] border border-zinc-200 dark:border-[#221e33] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${color}`}
                      style={{ width: `${val}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Evidence Table ──────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#0e0d14] border border-zinc-200 dark:border-[#1f1c2b] rounded-2xl p-6 sm:p-7 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-[#1a1726] pb-3">
            <h2 className="text-xs font-mono font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">
              Session Execution Evidence
            </h2>
            <span className="text-[11px] font-mono text-zinc-500">{evidence.length} Problems Tracked</span>
          </div>

          <div className="space-y-3">
            {evidence.map((ev) => {
              const improved = ev.finalPassRate > ev.firstPassRate;
              return (
                <div
                  key={ev.questionId}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50 dark:bg-[#12111a] border border-zinc-200 dark:border-[#1f1c2b] rounded-xl p-4 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-zinc-900 dark:text-white">{ev.title}</span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                          ev.difficulty === "Easy"
                            ? "text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/40"
                            : ev.difficulty === "Medium"
                            ? "text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/40"
                            : "text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50 bg-rose-50 dark:bg-rose-950/40"
                        }`}
                      >
                        {ev.difficulty}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-500 font-mono">
                      {ev.topics.join(" · ")}
                    </div>
                  </div>

                  <div className="flex items-center gap-5 text-xs font-mono shrink-0">
                    <div className="text-center">
                      <div className="text-zinc-500 text-[10px] uppercase">Attempts</div>
                      <div className="text-zinc-900 dark:text-zinc-200 font-bold text-sm">{ev.attempts}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-zinc-500 text-[10px] uppercase">Pass Rate</div>
                      <div
                        className={`font-bold text-sm ${
                          ev.finalPassRate === 100
                            ? "text-emerald-700 dark:text-emerald-400"
                            : ev.finalPassRate >= 50
                            ? "text-amber-700 dark:text-amber-400"
                            : "text-rose-700 dark:text-rose-400"
                        }`}
                      >
                        {ev.finalPassRate}%
                      </div>
                    </div>
                    {ev.complexity && (
                      <div className="text-center">
                        <div className="text-zinc-500 text-[10px] uppercase">AST Complexity</div>
                        <div className="text-iris dark:text-iris-light font-bold text-sm">
                          {ev.complexity.estimated}
                        </div>
                      </div>
                    )}
                    {improved && ev.attempts > 1 && (
                      <TrendingUp className="w-4 h-4 text-teal-400" aria-label="Improved over attempts" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Bottom Navigation & CTA ─────────────────────────────────────── */}
        <div className="pt-4 border-t border-zinc-200 dark:border-[#1a1726] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push("/coding")}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-100 dark:bg-[#12111a] dark:hover:bg-[#181624] text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white font-mono text-xs border border-zinc-200 dark:border-[#1f1c2b] shadow-sm dark:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Code2 className="w-3.5 h-3.5 text-iris" />
              <span>Practice Another Coding Track</span>
            </button>
            <button
              onClick={() =>
                router.push(
                  `/interview?codingAssessmentId=${encodeURIComponent(report.assessmentId)}`
                )
              }
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-iris/10 dark:hover:bg-iris/20 text-iris font-mono text-xs font-bold border border-indigo-200 dark:border-iris/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explain your solution with AI</span>
            </button>
          </div>

          <button
            onClick={onReturnDashboard}
            className="w-full sm:w-auto px-7 py-2.5 rounded-xl bg-iris hover:bg-iris/90 text-white font-mono text-xs font-bold shadow-md shadow-iris/20 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Return to Candidate Dashboard</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
}
