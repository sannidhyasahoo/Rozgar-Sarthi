"use client";
// components/coding/AssessmentHeader.tsx

import React, { useState, useEffect } from "react";
import {
  Code2,
  Clock,
  Sun,
  Moon,
  Play,
  Send,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Shield,
  LogOut,
} from "lucide-react";
import { formatTime } from "@/lib/codingApi";

interface AssessmentHeaderProps {
  questionIndex: number;
  totalQuestions: number;
  timeRemainingSeconds: number;
  status: "active" | "completed";
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onEndTest: () => void;
  onRun?: () => void;
  onSubmit?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  isRunning?: boolean;
  isSubmitting?: boolean;
  tabViolations?: number;
  maxViolations?: number;
}

export function AssessmentHeader({
  questionIndex,
  totalQuestions,
  timeRemainingSeconds,
  theme,
  onToggleTheme,
  onEndTest,
  onRun,
  onSubmit,
  onNext,
  onPrev,
  isRunning = false,
  isSubmitting = false,
  tabViolations = 0,
  maxViolations = 3,
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
          ? "bg-[#0e0d14] border-[#1f1c2b] text-zinc-300"
          : "bg-white border-zinc-200 text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
      }`}
      style={{ minHeight: 52 }}
    >
      {/* Left: Brand & Live Proctoring Status & Question Stepper */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Formal Brand Mark (Non-navigable to prevent mid-test leaks) */}
        <div className="flex items-center gap-2 text-iris font-mono text-xs font-bold tracking-tight">
          <div className="w-6 h-6 rounded bg-iris/15 border border-iris/30 flex items-center justify-center">
            <Code2 className="w-3.5 h-3.5 text-iris" />
          </div>
          <span className="hidden sm:inline text-zinc-900 dark:text-white">Rozgar Sarthi</span>
          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-iris/15 text-iris dark:text-iris-light border border-iris/25 uppercase">
            OA Chamber
          </span>
        </div>

        <div className={`hidden sm:block w-px h-4 ${isDark ? "bg-[#1f1c2b]" : "bg-zinc-200"}`} />

        {/* Live Proctoring Sentry Status */}
        <div
          className={`hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg border font-mono text-[11px] transition-colors ${
            tabViolations > 0
              ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
              : isDark
              ? "bg-[#12111a] border-[#1f1c2b] text-zinc-300"
              : "bg-zinc-50 border-zinc-200 text-zinc-700"
          }`}
        >
          <span className="flex h-2 w-2 relative">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                tabViolations > 0 ? "bg-amber-400" : "bg-emerald-400"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                tabViolations > 0 ? "bg-amber-500" : "bg-emerald-500"
              }`}
            />
          </span>
          <span className="font-medium flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span>Proctoring Sentry Active</span>
          </span>

          {tabViolations > 0 && (
            <span className="ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/25 text-amber-300 border border-amber-500/40">
              Strikes: {tabViolations}/{maxViolations}
            </span>
          )}
        </div>

        <div className={`hidden sm:block w-px h-4 ${isDark ? "bg-[#1f1c2b]" : "bg-zinc-200"}`} />

        {/* Question Selector Arrows */}
        <div className="flex items-center gap-1">
          <button
            onClick={onPrev}
            disabled={!onPrev || questionIndex === 0}
            title="Previous Question"
            className={`p-1 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${
              isDark
                ? "text-zinc-400 hover:text-white hover:bg-[#1a1726]"
                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span
            className={`font-mono text-xs px-2.5 py-1 rounded-md border font-semibold ${
              isDark
                ? "bg-[#12111a] text-zinc-200 border-[#1f1c2b]"
                : "bg-zinc-50 text-zinc-700 border-zinc-200"
            }`}
          >
            Question {questionIndex + 1} / {totalQuestions}
          </span>

          <button
            onClick={onNext}
            disabled={!onNext || questionIndex >= totalQuestions - 1}
            title="Next Question"
            className={`p-1 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${
              isDark
                ? "text-zinc-400 hover:text-white hover:bg-[#1a1726]"
                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center: Quick Action Run & Submit Bar */}
      <div className="flex items-center gap-2">
        {onRun && (
          <button
            onClick={onRun}
            disabled={isRunning || isSubmitting}
            title="Run Code against visible tests (Ctrl + ')"
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all border cursor-pointer ${
              isDark
                ? "bg-[#12111a] hover:bg-[#181622] text-zinc-200 border-[#1f1c2b] active:bg-[#100e18]"
                : "bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-200"
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
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-mono font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Submit Solution</span>
          </button>
        )}
      </div>

      {/* Right: Fullscreen + Theme Toggle + Timer + Formal End Test */}
      <div className="flex items-center gap-2">
        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
            isDark
              ? "text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1726]"
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
          className={`p-1.5 px-2 rounded-lg text-xs flex items-center gap-1.5 transition-all duration-200 border cursor-pointer ${
            isDark
              ? "bg-[#12111a] text-zinc-300 hover:text-amber-300 hover:bg-[#181622] border-[#1f1c2b]"
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
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-xs sm:text-sm font-bold transition-colors ${
            isCritical
              ? "bg-red-900/30 text-red-400 border border-red-800/40"
              : isLow
              ? "bg-amber-900/30 text-amber-400 border border-amber-800/40"
              : isDark
              ? "bg-[#12111a] text-zinc-200 border border-[#1f1c2b]"
              : "bg-zinc-50 text-zinc-700 border border-zinc-200"
          }`}
        >
          <Clock className={`w-3.5 h-3.5 ${isCritical ? "animate-pulse" : ""}`} />
          {formatTime(timeRemainingSeconds)}
        </div>

        {/* Formal End Test Button (The ONLY permitted exit pathway) */}
        <button
          onClick={onEndTest}
          title="End assessment and submit test"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 cursor-pointer shadow-xs active:scale-[0.98]"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>End Test</span>
        </button>
      </div>
    </header>
  );
}
