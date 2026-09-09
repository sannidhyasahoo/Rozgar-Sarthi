"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppAuth } from "@/components/auth/AuthProvider";
import { Cpu, ArrowRight, LogOut, Menu, X, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeProvider";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn, user, profile, signOutMock } = useAppAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Suppress public navbar inside app workspace routes and full-screen environments
  if (
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/coding") ||
    pathname?.startsWith("/report") ||
    pathname?.startsWith("/onboarding") ||
    pathname?.startsWith("/interview")
  ) {
    return null;
  }

  const isLandingPage = pathname === "/";

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#120f24]/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-[#251f42] transition-all duration-200">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Cpu className="w-4 h-4 text-emerald-400 stroke-[1.8]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-zinc-900 text-base tracking-tight leading-none">
                Rozgar Sarthi
              </span>
              <span className="text-[10px] text-zinc-500 font-medium tracking-wide mt-0.5">
                AI Mock Interview Engine
              </span>
            </div>
          </Link>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {isSignedIn ? (
            <>
              <Link
                href="/dashboard"
                className={`px-3.5 py-2 rounded-full text-sm font-medium transition-colors ${
                  pathname === "/dashboard"
                    ? "text-zinc-900 bg-zinc-100 font-semibold"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/interview"
                className={`px-3.5 py-2 rounded-full text-sm font-medium transition-colors ${
                  pathname === "/interview"
                    ? "text-zinc-900 bg-zinc-100 font-semibold"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                }`}
              >
                Voice Interview
              </Link>
              <Link
                href="/coding"
                className={`px-3.5 py-2 rounded-full text-sm font-medium transition-colors ${
                  pathname === "/coding"
                    ? "text-zinc-900 bg-zinc-100 font-semibold"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                }`}
              >
                Coding Round
              </Link>
              <Link
                href="/report"
                className={`px-3.5 py-2 rounded-full text-sm font-medium transition-colors ${
                  pathname === "/report"
                    ? "text-zinc-900 bg-zinc-100 font-semibold"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                }`}
              >
                Reports
              </Link>
            </>
          ) : (
            <>
              <a
                href="/#how-it-works"
                className="px-3.5 py-2 rounded-full text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
              >
                How It Works
              </a>
              <a
                href="/#evidence"
                className="px-3.5 py-2 rounded-full text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
              >
                Evidence & Feedback
              </a>
              <a
                href="/#features"
                className="px-3.5 py-2 rounded-full text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
              >
                Features
              </a>
              <a
                href="/#comparison"
                className="px-3.5 py-2 rounded-full text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
              >
                Why Rozgar Sarthi
              </a>
            </>
          )}
        </nav>

        {/* Right CTA / Auth Buttons */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle at right top */}
          <ThemeToggle />

          {isSignedIn ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-[#1b1633] border border-zinc-200 dark:border-[#2f2654] text-xs font-mono text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{profile?.name || user?.fullName || "Candidate"}</span>
                <span className="text-zinc-400">•</span>
                <span>{profile?.targetRole || "Backend"}</span>
              </Link>

              <Link
                href="/dashboard"
                className="rounded-full bg-zinc-900 dark:bg-violet-600 hover:bg-black dark:hover:bg-violet-500 text-white text-xs font-semibold px-4 py-2 transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>Enter Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={signOutMock}
                title="Sign Out"
                className="p-2 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-[#1b1633] transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              {/* Sign In button */}
              <Link
                href="/sign-in"
                className="rounded-full border border-zinc-300 dark:border-[#2f2654] text-zinc-800 dark:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-500 hover:bg-zinc-100 dark:hover:bg-[#1b1633] text-sm font-medium px-4 py-1.5 transition-all cursor-pointer"
              >
                Sign In
              </Link>

              {/* Get Started pill button */}
              <Link
                href="/sign-in"
                className="rounded-full bg-zinc-900 dark:bg-violet-600 hover:bg-black dark:hover:bg-violet-500 text-white text-sm font-medium px-4 sm:px-5 py-1.5 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <span>Get Started</span>
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#1b1633] transition-colors"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-white px-4 py-4 space-y-3">
          {isSignedIn ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-zinc-800 hover:bg-zinc-100"
              >
                Candidate Dashboard
              </Link>
              <Link
                href="/interview"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-zinc-800 hover:bg-zinc-100"
              >
                AI Voice Interview
              </Link>
              <Link
                href="/coding"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-zinc-800 hover:bg-zinc-100"
              >
                Coding Round
              </Link>
              <Link
                href="/report"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-zinc-800 hover:bg-zinc-100"
              >
                Diagnostic Reports
              </Link>
              <button
                onClick={() => {
                  signOutMock();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <a
                href="/#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-100"
              >
                How It Works
              </a>
              <a
                href="/#evidence"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-100"
              >
                Evidence & Feedback
              </a>
              <a
                href="/#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-100"
              >
                Features
              </a>
              <div className="pt-2 border-t border-zinc-100 flex flex-col gap-2">
                <Link
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-full border border-zinc-300 text-sm font-medium text-zinc-800"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-full bg-zinc-900 text-sm font-medium text-white shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
}
