"use client";
// components/coding/AssessmentReport.tsx
// Final candidate report component

import {
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Target,
  Zap,
  Code2,
  Bug,
  Brain,
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
    <div className="w-full h-1.5 bg-[#2a2a2e] rounded-full overflow-hidden">
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
    <div className="bg-[#1a1a1e] border border-[#2a2a2e] rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${color}`} />
          <span className="text-xs font-mono text-zinc-400">{label}</span>
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
  const { scores, skillProfile, areas, evidence, aiNarrative, stats, confidence } = report;

  // Determine hiring badge
  const overall = scores.overallScore;
  const badge =
    overall >= 85
      ? { label: "Strong Hire", color: "text-emerald-400 border-emerald-700/50 bg-emerald-900/20" }
      : overall >= 70
      ? { label: "Hire", color: "text-teal-400 border-teal-700/50 bg-teal-900/20" }
      : overall >= 50
      ? { label: "Needs Work", color: "text-amber-400 border-amber-700/50 bg-amber-900/20" }
      : { label: "No Hire", color: "text-red-400 border-red-700/50 bg-red-900/20" };

  const algo_skills = [
    "arrays", "strings", "hashmaps", "slidingWindow", "binarySearch",
    "stacks", "trees", "graphs", "greedy", "recursion", "dynamicProgramming",
  ] as (keyof SkillProfile)[];

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-200 pb-16">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">

        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-[#6a5ed9] font-mono text-sm">
            <Code2 className="w-4 h-4" />
            <span>Rozgar Sarthi · Coding Assessment</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Candidate Report</h1>
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-bold ${badge.color}`}
          >
            <Target className="w-4 h-4" />
            {badge.label}
          </div>
          <p className="text-sm text-zinc-500 font-mono">
            {stats.totalQuestionsAttempted} questions attempted ·{" "}
            {scores.problemsSolved} solved ·{" "}
            {Math.round(stats.elapsedSeconds / 60)}m {Math.round(stats.elapsedSeconds % 60)}s
          </p>
        </div>

        {/* ── Overall Score ────────────────────────────────────────────────────── */}
        <div className="bg-[#111113] border border-[#2a2a2e] rounded-2xl p-8 text-center space-y-4">
          <div className="text-7xl font-bold font-mono text-white">
            {overall}
            <span className="text-3xl text-zinc-600">/100</span>
          </div>
          <div className="w-full max-w-sm mx-auto h-2 bg-[#2a2a2e] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${overall}%`,
                background: "linear-gradient(90deg, #6a5ed9, #3f71d4)",
              }}
            />
          </div>
          <p className="text-xs text-zinc-500 font-mono">
            Assessment confidence: {confidence}% · Hidden test pass rate: {stats.hiddenTestPassRate}%
          </p>
          {aiNarrative && (
            <p className="text-sm text-zinc-400 max-w-2xl mx-auto leading-relaxed italic border-t border-[#2a2a2e] pt-4 mt-2">
              "{aiNarrative}"
            </p>
          )}
        </div>

        {/* ── Score Breakdown ──────────────────────────────────────────────────── */}
        <div>
          <h2 className="text-sm font-mono font-bold text-zinc-500 uppercase tracking-widest mb-4">
            Score Breakdown
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <ScoreCard label="Problem Solving" value={scores.problemSolving} icon={Brain} color="text-[#6a5ed9]" />
            <ScoreCard label="Correctness" value={scores.correctness} icon={CheckCircle2} color="text-emerald-400" />
            <ScoreCard label="Algorithm Knowledge" value={scores.algorithmKnowledge} icon={Activity} color="text-[#3f71d4]" />
            <ScoreCard label="Efficiency" value={scores.efficiency} icon={Zap} color="text-amber-400" />
            <ScoreCard label="Debugging" value={scores.debugging} icon={Bug} color="text-teal-400" />
            <ScoreCard label="Code Quality" value={scores.codeQuality} icon={Code2} color="text-purple-400" />
          </div>
        </div>

        {/* ── Strong / Weak Areas ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Strong */}
          <div className="bg-[#111113] border border-[#2a2a2e] rounded-xl p-5 space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-mono font-bold text-emerald-400">
              <TrendingUp className="w-4 h-4" />
              Strong Areas
            </h2>
            {areas.strong.length === 0 ? (
              <p className="text-xs text-zinc-600">No strongly demonstrated skills yet.</p>
            ) : (
              <div className="space-y-2">
                {areas.strong.map((skill) => (
                  <div key={skill} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-zinc-300">{SKILL_LABELS[skill] ?? skill}</span>
                    <span className="ml-auto text-xs font-mono text-emerald-400">
                      {Math.round(skillProfile[skill as keyof SkillProfile] as number)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weak */}
          <div className="bg-[#111113] border border-[#2a2a2e] rounded-xl p-5 space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-mono font-bold text-red-400">
              <TrendingDown className="w-4 h-4" />
              Weak Areas
            </h2>
            {areas.weak.length === 0 ? (
              <p className="text-xs text-zinc-600">No critical weaknesses identified.</p>
            ) : (
              <div className="space-y-2">
                {areas.weak.map((skill) => (
                  <div key={skill} className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span className="text-zinc-300">{SKILL_LABELS[skill] ?? skill}</span>
                    <span className="ml-auto text-xs font-mono text-red-400">
                      {Math.round(skillProfile[skill as keyof SkillProfile] as number)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Skill Profile ─────────────────────────────────────────────────────── */}
        <div className="bg-[#111113] border border-[#2a2a2e] rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-mono font-bold text-zinc-500 uppercase tracking-widest">
            Skill Profile
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3">
            {algo_skills.map((skill) => {
              const val = Math.round(skillProfile[skill] as number);
              const color =
                val >= 70 ? "bg-emerald-500" : val >= 45 ? "bg-[#6a5ed9]" : "bg-red-500";
              return (
                <div key={skill} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">{SKILL_LABELS[skill] ?? skill}</span>
                    <span className="font-mono text-zinc-300">{val}</span>
                  </div>
                  <div className="h-1.5 bg-[#2a2a2e] rounded-full overflow-hidden">
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

        {/* ── Evidence Table ────────────────────────────────────────────────────── */}
        <div className="bg-[#111113] border border-[#2a2a2e] rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-mono font-bold text-zinc-500 uppercase tracking-widest">
            Evidence
          </h2>
          <div className="space-y-3">
            {evidence.map((ev) => {
              const improved = ev.finalPassRate > ev.firstPassRate;
              return (
                <div
                  key={ev.questionId}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 bg-[#1a1a1e] border border-[#2a2a2e] rounded-lg px-4 py-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-zinc-200">{ev.title}</span>
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase border ${
                          ev.difficulty === "Easy"
                            ? "text-emerald-400 border-emerald-800/50 bg-emerald-900/10"
                            : ev.difficulty === "Medium"
                            ? "text-amber-400 border-amber-800/50 bg-amber-900/10"
                            : "text-red-400 border-red-800/50 bg-red-900/10"
                        }`}
                      >
                        {ev.difficulty}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-500 font-mono mt-0.5">
                      {ev.topics.join(", ")}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                    <div className="text-center">
                      <div className="text-zinc-500">Attempts</div>
                      <div className="text-zinc-200 font-bold">{ev.attempts}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-zinc-500">Pass Rate</div>
                      <div
                        className={`font-bold ${
                          ev.finalPassRate === 100
                            ? "text-emerald-400"
                            : ev.finalPassRate >= 50
                            ? "text-amber-400"
                            : "text-red-400"
                        }`}
                      >
                        {ev.finalPassRate}%
                      </div>
                    </div>
                    {ev.complexity && (
                      <div className="text-center">
                        <div className="text-zinc-500">Complexity</div>
                        <div className="text-[#6a5ed9] font-bold">
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

        {/* ── CTA ─────────────────────────────────────────────────────────────── */}
        <div className="text-center">
          <button
            onClick={onReturnDashboard}
            className="btn-primary-action px-8 py-3 text-sm"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
