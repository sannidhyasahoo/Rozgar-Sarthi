"use client";
// components/coding/AssessmentHeader.tsx

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Code2,
  Clock,
  X,
  Sun,
  Moon,
  Play,
  Send,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  ListFilter,
} from "lucide-react";
import { formatTime } from "@/lib/codingApi";

interface AssessmentHeaderProps {
  questionIndex: number;
  totalQuestions: number;
  timeRemainingSeconds: number;
  status: "active" | "completed";
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onExit: () => void;
  onRun?: () => void;
  onSubmit?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  isRunning?: boolean;
  isSubmitting?: boolean;
}

export function AssessmentHeader({
  questionIndex,
  totalQuestions,
  timeRemainingSeconds,
  status,
  theme,
  onToggleTheme,
  onExit,
  onRun,
  onSubmit,
  onNext,
  onPrev,
  isRunning = false,
  isSubmitting = false,
}: AssessmentHeaderProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isLow = timeRemainingSeconds < 300; // < 5 min
  const isCritical = timeRemainingSeconds < 120; // < 2 min
  const isDark = theme === "dark";

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header
      className={`border-b flex items-center justify-between px-3 sm:px-5 py-2 shrink-0 select-none transition-colors duration-200 ${
        isDark
          ? "bg-[#18181b] border-[#2a2a2e] text-zinc-300"
          : "bg-white border-zinc-200 text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
      }`}
      style={{ minHeight: 52 }}
    >
      {/* Left: Brand & Problem List & Nav */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Brand */}
        <Link
          href="/coding"
          className="flex items-center gap-2 text-[#6a5ed9] font-mono text-sm font-bold hover:opacity-80 transition-opacity"
        >
          <Code2 className="w-4 h-4 stroke-[2]" />
          <span className="hidden md:inline">Rozgar Sarthi</span>
        </Link>

        <div className={`hidden sm:block w-px h-4 ${isDark ? "bg-[#2a2a2e]" : "bg-zinc-200"}`} />

        {/* LeetCode style problem list badge */}
        <Link
          href="/coding"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors border ${
            isDark
              ? "bg-[#202024] hover:bg-[#27272a] text-zinc-300 border-[#2f2f35]"
              : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200"
          }`}
          title="Return to Problem List"
        >
          <ListFilter className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden sm:inline">Problem List</span>
        </Link>

        {/* Question Selector Arrows */}
        <div className="flex items-center gap-1 ml-1">
          <button
            onClick={onPrev}
            disabled={!onPrev || questionIndex === 0}
            title="Previous Question"
            className={`p-1 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
              isDark
                ? "text-zinc-400 hover:text-white hover:bg-[#27272a]"
                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span
            className={`font-mono text-xs px-2 py-0.5 rounded border ${
              isDark
                ? "bg-[#202024] text-zinc-300 border-[#2f2f35]"
                : "bg-zinc-50 text-zinc-700 border-zinc-200"
            }`}
          >
            {questionIndex + 1} / {totalQuestions}
          </span>

          <button
            onClick={onNext}
            disabled={!onNext || questionIndex >= totalQuestions - 1}
            title="Next Question"
            className={`p-1 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
              isDark
                ? "text-zinc-400 hover:text-white hover:bg-[#27272a]"
                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center: LeetCode Quick Action Run & Submit Bar */}
      <div className="flex items-center gap-2">
        {onRun && (
          <button
            onClick={onRun}
            disabled={isRunning || isSubmitting}
            title="Run Code against visible tests (Ctrl + ')"
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all border ${
              isDark
                ? "bg-[#222226] hover:bg-[#2a2a30] text-zinc-200 border-[#2e2e33] active:bg-[#1a1a1e]"
                : "bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-200 active:bg-zinc-250"
            } disabled:opacity-50`}
          >
            {isRunning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current text-zinc-400" />
            )}
            <span>Run</span>
          </button>
        )}

        {onSubmit && (
          <button
            onClick={onSubmit}
            disabled={isRunning || isSubmitting}
            title="Submit Solution for Full Evaluation (Ctrl + Enter)"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-mono font-semibold bg-[#00b8a3] hover:bg-[#009e8c] text-white shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Submit</span>
          </button>
        )}
      </div>

      {/* Right: Fullscreen + Theme Toggle + Timer + Exit */}
      <div className="flex items-center gap-2">
        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          className={`p-1.5 rounded-md text-xs transition-colors ${
            isDark
              ? "text-zinc-400 hover:text-zinc-200 hover:bg-[#25252b]"
              : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100"
          }`}
          aria-label="Toggle Fullscreen"
        >
          {isFullscreen ? (
            <Minimize2 className="w-3.5 h-3.5" />
          ) : (
            <Maximize2 className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          type="button"
          title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
          className={`p-1.5 px-2 rounded-md text-xs flex items-center gap-1.5 transition-all duration-200 border ${
            isDark
              ? "bg-[#1f1f23] text-zinc-300 hover:text-amber-300 hover:bg-[#27272c] border-[#2e2e33]"
              : "bg-zinc-50 text-zinc-700 hover:text-indigo-600 hover:bg-zinc-100 border-zinc-200"
          }`}
          aria-label="Toggle dark/light mode"
        >
          {isDark ? (
            <Sun className="w-3.5 h-3.5 text-amber-400 transition-transform duration-300" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-indigo-600 transition-transform duration-300" />
          )}
          <span className="hidden lg:inline font-mono text-[11px] font-medium">
            {isDark ? "Light" : "Dark"}
          </span>
        </button>

        {/* Timer Badge */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-xs sm:text-sm font-bold transition-colors ${
            isCritical
              ? "bg-red-900/30 text-red-400 border border-red-800/40"
              : isLow
              ? "bg-amber-900/30 text-amber-400 border border-amber-800/40"
              : isDark
              ? "bg-[#202024] text-zinc-200 border border-[#2e2e33]"
              : "bg-zinc-50 text-zinc-700 border border-zinc-200"
          }`}
        >
          <Clock className={`w-3.5 h-3.5 ${isCritical ? "animate-pulse" : ""}`} />
          {formatTime(timeRemainingSeconds)}
        </div>

        {/* Exit Button */}
        <button
          onClick={onExit}
          title="Exit assessment"
          className={`p-1.5 rounded-md transition-colors ${
            isDark
              ? "text-zinc-400 hover:text-zinc-200 hover:bg-[#25252b]"
              : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
