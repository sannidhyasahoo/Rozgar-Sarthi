"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppAuth } from "@/components/auth/AuthProvider";
import { Cpu, Terminal, ShieldCheck, BarChart3, UserCheck, ArrowRight } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { isSignedIn, profile } = useAppAuth();

  const isInterviewActive = pathname === "/interview";

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-zinc-200">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo & Telemetry Indicator */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white shadow-sm group-hover:bg-zinc-800 transition-colors">
              <Cpu className="w-4 h-4 text-emerald-400 stroke-[1.8]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-900 text-base tracking-tight">
                  Rozgar Sarthi
                </span>
                <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                  v2.4
                </span>
              </div>
              <span className="text-[11px] text-zinc-500 font-normal">
                Adaptive Interview Intelligence
              </span>
            </div>
          </Link>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/dashboard"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/dashboard"
                ? "text-zinc-900 bg-zinc-100 font-semibold"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/interview"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/interview"
                ? "text-zinc-900 bg-zinc-100 font-semibold"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
            }`}
          >
            AI Interview
          </Link>
          <Link
            href="/coding"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/coding"
                ? "text-zinc-900 bg-zinc-100 font-semibold"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
            }`}
          >
            Coding Round
          </Link>
          <Link
            href="/report"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/report"
                ? "text-zinc-900 bg-zinc-100 font-semibold"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
            }`}
          >
            Diagnostic Reports
          </Link>
        </nav>

        {/* Right CTA / Auth Status */}
        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-mono text-zinc-600 bg-zinc-100 border border-zinc-200"
              >
                <span className="w-2 h-2 rounded-full bg-sprout animate-pulse" />
                <span>{profile.targetRole || "Backend"}</span>
              </Link>
              <Link
                href={isInterviewActive ? "/dashboard" : "/interview"}
                className="btn-primary-action !py-2 !px-4 !text-sm"
              >
                {isInterviewActive ? "View Dashboard" : "Start Interview"}
                <ArrowRight className="w-4 h-4 stroke-[1.8]" />
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/sign-in"
                className="text-sm font-medium text-zinc-700 hover:text-zinc-900 px-3 py-2 rounded-md hover:bg-zinc-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="btn-primary-action !py-2 !px-4 !text-sm"
              >
                Get Started
                <ArrowRight className="w-4 h-4 stroke-[1.8]" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
