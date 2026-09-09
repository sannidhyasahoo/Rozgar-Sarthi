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

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full h-2 bg-[#1b1926] rounded-full overflow-hidden border border-[#262335]">
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
    <div className="bg-[#12111a] border border-[#1f1c2b] hover:border-[#2a253a] rounded-xl p-4.5 space-y-3 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#181624] border border-[#221e33] flex items-center justify-center">
            <Icon className={`w-3.5 h-3.5 ${color}`} />
          </div>
          <span className="text-xs font-mono text-zinc-300 font-medium">{label}</span>
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
      ? { label: "Incomplete / Unscored", color: "text-zinc-400 border-zinc-600/40 bg-zinc-900/60" }
      : overall >= 85
      ? { label: "Strong Hire", color: "text-emerald-400 border-emerald-500/40 bg-emerald-950/30" }
      : overall >= 70
      ? { label: "Hire", color: "text-teal-400 border-teal-500/40 bg-teal-950/30" }
      : overall >= 50
      ? { label: "Needs Work", color: "text-amber-400 border-amber-500/40 bg-amber-950/30" }
      : { label: "No Hire", color: "text-rose-400 border-rose-500/40 bg-rose-950/30" };

  const algo_skills = [
    "arrays", "strings", "hashmaps", "slidingWindow", "binarySearch",
    "stacks", "trees", "graphs", "greedy", "recursion", "dynamicProgramming",
  ] as (keyof SkillProfile)[];

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-[#08070c] text-zinc-200 pb-20 font-sans selection:bg-iris selection:text-white">
      {/* ── Standard Navigation Bar ───────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#0e0d14]/90 backdrop-blur-md border-b border-[#1f1c2b] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Back to Dashboard Button */}
          <button
            onClick={onReturnDashboard}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-medium text-zinc-300 hover:text-white bg-[#14121e] hover:bg-[#1a1726] border border-[#1f1c2b] hover:border-[#2a253a] transition-all cursor-pointer group shadow-2xs"
            title="Return to Candidate Dashboard"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-zinc-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Dashboard</span>
          </button>

          {/* Back to Coding Chamber Button */}
          <button
            onClick={() => router.push("/coding")}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium text-zinc-400 hover:text-zinc-200 bg-[#12111a] hover:bg-[#181624] border border-[#1f1c2b] transition-all cursor-pointer shadow-2xs"
            title="Return to Coding Assessments List"
          >
            <Code2 className="w-3.5 h-3.5 text-iris" />
            <span>Coding Tracks</span>
          </button>

          <div className="hidden md:block h-4 w-px bg-[#1f1c2b]" />

          {/* Brand Mark */}
          <div className="hidden md:flex items-center gap-2 text-xs font-mono font-bold text-white tracking-tight">
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono text-zinc-400 hover:text-zinc-200 bg-[#12111a] hover:bg-[#181622] border border-[#1f1c2b] transition-colors cursor-pointer"
            title="Print or Save PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print Report</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-400 text-xs font-mono font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Evaluation Sealed</span>
          </div>
        </div>
      </header>

      {/* ── Main Report Content ───────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-mono text-zinc-500">
          <Link href="/dashboard" className="hover:text-zinc-300 transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/coding" className="hover:text-zinc-300 transition-colors">
            Coding Assessment
          </Link>
          <span>/</span>
          <span className="text-zinc-300 font-semibold">Diagnostic Report</span>
        </nav>

        {/* ── Header Title & Badge ──────────────────────────────────────────── */}
        <div className="bg-[#0e0d14] border border-[#1f1c2b] rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-sm relative overflow-hidden">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-iris/10 rounded-full blur-3xl pointer-events-none -z-0" />

          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 text-iris font-mono text-xs font-bold uppercase tracking-wider bg-iris/10 border border-iris/20 px-3 py-1 rounded-full">
              <Award className="w-3.5 h-3.5" />
              <span>Assessment Concluded & Analyzed</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
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

            <p className="text-xs text-zinc-400 font-mono pt-1">
              {stats.totalQuestionsAttempted} questions attempted ·{" "}
              {scores.problemsSolved} solved ·{" "}
              {Math.round(stats.elapsedSeconds / 60)}m {Math.round(stats.elapsedSeconds % 60)}s elapsed duration
            </p>
          </div>
        </div>

        {/* ── Overall Score Card ────────────────────────────────────────────── */}
        <div className="bg-[#0e0d14] border border-[#1f1c2b] rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">
              Overall Benchmark Index
            </span>
            <div className="text-6xl sm:text-7xl font-bold font-mono text-white tracking-tight">
              {overall}
              <span className="text-2xl sm:text-3xl text-zinc-500 font-normal">/100</span>
            </div>
          </div>

          <div className="w-full max-w-md mx-auto h-3 bg-[#181622] border border-[#221e33] rounded-full overflow-hidden p-0.5">
            <div
              className="h-full rounded-full transition-all duration-1000 shadow-sm shadow-iris/40"
              style={{
                width: `${Math.min(100, Math.max(5, overall))}%`,
                background: "linear-gradient(90deg, #7c6df5, #3f71d4, #10b981)",
              }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 font-mono">
            <span>Assessment Confidence: <strong className="text-zinc-200">{confidence}%</strong></span>
            <span>•</span>
            <span>Hidden Test Pass Rate: <strong className="text-emerald-400">{stats.hiddenTestPassRate}%</strong></span>
          </div>

          {aiNarrative && (
            <div className="border-t border-[#1a1726] pt-5 mt-4 max-w-2xl mx-auto">
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed italic bg-[#12111a] border border-[#1f1c2b] rounded-xl p-4 text-left">
                &ldquo;{aiNarrative}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* ── Score Breakdown ──────────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">
              Telemetry Score Breakdown
            </h2>
            <span className="text-[11px] font-mono text-zinc-500">6 Dimension Analysis</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <ScoreCard label="Problem Solving" value={safeScores.problemSolving} icon={Brain} color="text-iris" />
            <ScoreCard label="Correctness" value={safeScores.correctness} icon={CheckCircle2} color="text-emerald-400" />
            <ScoreCard label="Algorithm Knowledge" value={safeScores.algorithmKnowledge} icon={Activity} color="text-sky-400" />
            <ScoreCard label="Efficiency" value={safeScores.efficiency} icon={Zap} color="text-amber-400" />
            <ScoreCard label="Debugging" value={safeScores.debugging} icon={Bug} color="text-teal-400" />
            <ScoreCard label="Code Quality" value={safeScores.codeQuality} icon={Code2} color="text-purple-400" />
          </div>
        </div>

        {/* ── Strong / Weak Areas ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Strong */}
          <div className="bg-[#0e0d14] border border-[#1f1c2b] rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#1a1726] pb-3">
              <h2 className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                <TrendingUp className="w-4 h-4" />
                <span>Demonstrated Strengths</span>
              </h2>
              <span className="text-[10px] font-mono text-emerald-500 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                {areas.strong.length} Domains
              </span>
            </div>

            {areas.strong.length === 0 ? (
              <p className="text-xs text-zinc-500 font-mono py-2">No strongly demonstrated skills logged.</p>
            ) : (
              <div className="space-y-2.5">
                {areas.strong.map((skill) => (
                  <div key={skill} className="flex items-center justify-between p-2.5 rounded-xl bg-[#12111a] border border-[#1f1c2b] text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-zinc-200 font-medium">{SKILL_LABELS[skill] ?? skill}</span>
                    </div>
                    <span className="text-emerald-400 font-bold">
                      {Math.round(skillProfile[skill as keyof SkillProfile] as number)}/100
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weak */}
          <div className="bg-[#0e0d14] border border-[#1f1c2b] rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#1a1726] pb-3">
              <h2 className="flex items-center gap-2 text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">
                <TrendingDown className="w-4 h-4" />
                <span>Growth & Focus Areas</span>
              </h2>
              <span className="text-[10px] font-mono text-rose-500 font-bold bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/40">
                {areas.weak.length} Domains
              </span>
            </div>

            {areas.weak.length === 0 ? (
              <p className="text-xs text-zinc-500 font-mono py-2">No critical weaknesses identified.</p>
            ) : (
              <div className="space-y-2.5">
                {areas.weak.map((skill) => (
                  <div key={skill} className="flex items-center justify-between p-2.5 rounded-xl bg-[#12111a] border border-[#1f1c2b] text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span className="text-zinc-200 font-medium">{SKILL_LABELS[skill] ?? skill}</span>
                    </div>
                    <span className="text-rose-400 font-bold">
                      {Math.round(skillProfile[skill as keyof SkillProfile] as number)}/100
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Skill Profile Bars ───────────────────────────────────────────── */}
        <div className="bg-[#0e0d14] border border-[#1f1c2b] rounded-2xl p-6 sm:p-7 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1a1726] pb-3">
            <h2 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">
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
                    <span className="text-zinc-300 font-medium">{SKILL_LABELS[skill] ?? skill}</span>
                    <span className="text-zinc-200 font-bold">{val}</span>
                  </div>
                  <div className="h-2 bg-[#181624] border border-[#221e33] rounded-full overflow-hidden">
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
        <div className="bg-[#0e0d14] border border-[#1f1c2b] rounded-2xl p-6 sm:p-7 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1a1726] pb-3">
            <h2 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">
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
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12111a] border border-[#1f1c2b] rounded-xl p-4 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{ev.title}</span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                          ev.difficulty === "Easy"
                            ? "text-emerald-400 border-emerald-800/50 bg-emerald-950/40"
                            : ev.difficulty === "Medium"
                            ? "text-amber-400 border-amber-800/50 bg-amber-950/40"
                            : "text-rose-400 border-rose-800/50 bg-rose-950/40"
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
                      <div className="text-zinc-200 font-bold text-sm">{ev.attempts}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-zinc-500 text-[10px] uppercase">Pass Rate</div>
                      <div
                        className={`font-bold text-sm ${
                          ev.finalPassRate === 100
                            ? "text-emerald-400"
                            : ev.finalPassRate >= 50
                            ? "text-amber-400"
                            : "text-rose-400"
                        }`}
                      >
                        {ev.finalPassRate}%
                      </div>
                    </div>
                    {ev.complexity && (
                      <div className="text-center">
                        <div className="text-zinc-500 text-[10px] uppercase">AST Complexity</div>
                        <div className="text-iris-light font-bold text-sm">
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
        <div className="pt-4 border-t border-[#1a1726] flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => router.push("/coding")}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#12111a] hover:bg-[#181624] text-zinc-300 hover:text-white font-mono text-xs border border-[#1f1c2b] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Code2 className="w-3.5 h-3.5 text-iris" />
            <span>Practice Another Coding Track</span>
          </button>

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
