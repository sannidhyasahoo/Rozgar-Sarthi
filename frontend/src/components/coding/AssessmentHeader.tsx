"use client";
// components/coding/AssessmentHeader.tsx

import { Code2, Clock, ChevronRight, X } from "lucide-react";
import { formatTime } from "@/lib/codingApi";

interface AssessmentHeaderProps {
  questionIndex: number;
  totalQuestions: number;
  timeRemainingSeconds: number;
  status: "active" | "completed";
  onExit: () => void;
}

export function AssessmentHeader({
  questionIndex,
  totalQuestions,
  timeRemainingSeconds,
  status,
  onExit,
}: AssessmentHeaderProps) {
  const isLow = timeRemainingSeconds < 300; // < 5 min
  const isCritical = timeRemainingSeconds < 120; // < 2 min

  return (
    <header
      className="bg-[#0f0f10] border-b border-[#2a2a2e] flex items-center justify-between px-5 py-3 shrink-0 select-none"
      style={{ minHeight: 52 }}
    >
      {/* Left: brand */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-[#6a5ed9] font-mono text-sm font-bold">
          <Code2 className="w-4 h-4" />
          <span className="hidden sm:inline">Rozgar Sarthi</span>
        </div>
        <div className="w-px h-4 bg-[#2a2a2e]" />
        <span className="text-[#a1a1aa] font-mono text-xs">
          Coding Assessment
        </span>
      </div>

      {/* Center: progress */}
      <div className="flex items-center gap-2">
        <span className="text-zinc-500 text-xs font-mono">Q</span>
        {Array.from({ length: totalQuestions }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i < questionIndex
                ? "bg-[#1bb152]"
                : i === questionIndex
                ? "bg-[#6a5ed9] ring-2 ring-[#6a5ed9]/30"
                : "bg-[#2a2a2e]"
            }`}
          />
        ))}
        <span className="text-zinc-400 text-xs font-mono ml-1">
          {questionIndex + 1}/{totalQuestions}
        </span>
      </div>

      {/* Right: timer + exit */}
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-mono text-sm font-bold transition-colors ${
            isCritical
              ? "bg-red-900/30 text-red-400 border border-red-800/40"
              : isLow
              ? "bg-amber-900/30 text-amber-400 border border-amber-800/40"
              : "bg-[#1a1a1e] text-zinc-300 border border-[#2a2a2e]"
          }`}
        >
          <Clock className={`w-3.5 h-3.5 ${isCritical ? "animate-pulse" : ""}`} />
          {formatTime(timeRemainingSeconds)}
        </div>

        <button
          onClick={onExit}
          title="Exit assessment"
          className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-[#2a2a2e] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
