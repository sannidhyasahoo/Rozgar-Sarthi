"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppAuth } from "@/components/auth/AuthProvider";
import {
  Search,
  Command,
  HelpCircle,
  Activity,
  Bell,
  ChevronDown,
  User,
  ShieldCheck,
  Sparkles,
  X,
  BookOpen,
  ArrowRight,
  LogOut,
  Cpu,
  Layers,
  Code2,
  Mic,
  FileText,
  UserCheck,
} from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeProvider";

export function WorkspaceNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOutMock } = useAppAuth();

  const [isRubricOpen, setIsRubricOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasUnreadAlert, setHasUnreadAlert] = useState(true);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut (Cmd+K / Ctrl+K) to toggle search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsSearchOpen(false);
        setIsRubricOpen(false);
        setIsProfileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus search input when modal opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  // Determine current page context
  const getPageInfo = () => {
    if (pathname.startsWith("/dashboard")) {
      return { title: "Overview & Telemetry", category: "Workspace" };
    }
    if (pathname.startsWith("/onboarding")) {
      return { title: "Candidate Profile & Calibration", category: "Station" };
    }
    if (pathname.startsWith("/interview")) {
      return { title: "Conversational Interview", category: "Round 01" };
    }
    if (pathname.startsWith("/coding")) {
      return { title: "Algorithmic Chamber", category: "Round 02" };
    }
    if (pathname.startsWith("/report")) {
      return { title: "Diagnostic Intelligence", category: "Evidence" };
    }
    return { title: "Workspace", category: "Session" };
  };

  const pageInfo = getPageInfo();

  // Search items
  const QUICK_LINKS = [
    {
      title: "Candidate Profile & Role",
      desc: "Calibrate target seniority, role focus, and key claims",
      href: "/onboarding",
      icon: UserCheck,
    },
    {
      title: "Conversational AI Interview",
      desc: "Online interactive technical evaluation with voice agent",
      href: "/interview",
      icon: Mic,
    },
    {
      title: "Algorithmic Coding Chamber",
      desc: "Monaco IDE editor with Tree-sitter AST complexity sentry",
      href: "/coding",
      icon: Code2,
    },
    {
      title: "Diagnostic Performance Reports",
      desc: "Full evidence graph, claim verification, and competency radar",
      href: "/report",
      icon: FileText,
    },
    {
      title: "Candidate Dashboard Overview",
      desc: "Unified assessment progress and system metrics",
      href: "/dashboard",
      icon: Layers,
    },
  ];

  const filteredLinks = QUICK_LINKS.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectLink = (href: string) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    router.push(href);
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-14 bg-white/80 dark:bg-[#0e0d14]/90 backdrop-blur-md border-b border-zinc-200/90 dark:border-[#1f1c2b] select-none transition-colors duration-200">
        <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* ── Left: Dynamic Breadcrumb & Context Indicator ───────────── */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 dark:text-[#9e98b7] font-semibold hidden sm:inline">
              {pageInfo.category}
            </span>
            <span className="text-zinc-300 dark:text-zinc-600 hidden sm:inline">/</span>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {pageInfo.title}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse hidden md:inline-block" />
            </div>
          </div>

          {/* ── Center: Fast Command Palette Search Trigger ────────────── */}
          <div className="flex-1 max-w-md hidden md:block">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-zinc-50 dark:bg-[#12111a] hover:bg-zinc-100 dark:hover:bg-[#181622] border border-zinc-200/80 dark:border-[#1f1c2b] text-xs text-zinc-400 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-colors" />
                <span className="font-sans text-zinc-500 dark:text-zinc-400">Quick jump or search...</span>
              </div>
              <div className="flex items-center gap-1 font-mono text-[10px] bg-white dark:bg-[#181622] px-1.5 py-0.5 rounded border border-zinc-200 dark:border-[#262335] text-zinc-400">
                <span>Ctrl</span>
                <span>K</span>
              </div>
            </button>
          </div>

          {/* ── Right: Live Telemetry, Rubric, Notifications & Profile ──── */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Realtime AST Engine Indicator Pill */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-[#12111a] border border-zinc-200/90 dark:border-[#1f1c2b] text-[11px] font-mono text-zinc-600 dark:text-zinc-300">
              <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
              <span>AST Sentry Live</span>
            </div>

            {/* Assessment Rubric Quick Sheet Trigger */}
            <button
              onClick={() => setIsRubricOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-[#12111a] hover:bg-zinc-100 dark:hover:bg-[#181622] border border-zinc-200 dark:border-[#1f1c2b] text-xs font-medium text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer"
              title="View Bayesian Evaluation Rubrics"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              <span>Evaluation Rubric</span>
            </button>

            {/* Notifications Bell with unread pulse */}
            <button
              onClick={() => setHasUnreadAlert(false)}
              className="relative p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-[#181622] transition-colors cursor-pointer"
              title="Proctoring & System Notifications"
            >
              <Bell className="w-4 h-4" />
              {hasUnreadAlert && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
              )}
            </button>

            {/* Dark / Light Theme Toggle */}
            <ThemeToggle />

            <div className="h-4 w-px bg-zinc-200 dark:bg-[#1f1c2b]" />

            {/* Candidate Profile Quick Dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1 pl-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-[#181622] transition-all cursor-pointer group"
                aria-expanded={isProfileMenuOpen}
              >
                <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-violet-950 dark:border dark:border-violet-700 text-white font-mono text-xs font-bold flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  {profile.name?.slice(0, 2).toUpperCase() || "AL"}
                </div>
                <div className="hidden xl:flex flex-col text-left leading-tight pr-1">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[100px]">
                    {profile.name || "Alex Dev"}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 dark:text-[#9e98b7] truncate max-w-[100px]">
                    {profile.targetRole || "Backend"}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#12111a] border border-zinc-200 dark:border-[#1f1c2b] shadow-2xl p-2 text-xs font-sans z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="p-3 border-b border-zinc-100 dark:border-[#272147] mb-1">
                    <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                      {profile.name || "Alex Dev"}
                    </div>
                    <div className="text-[11px] font-mono text-zinc-500 dark:text-[#9e96c4] mt-0.5">
                      {profile.email || "alex@developer.io"}
                    </div>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-mono font-semibold">
                      <Sparkles className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                      <span>{profile.targetRole || "Backend Track"}</span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <Link
                      href="/onboarding"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-[#201a3d] transition-colors"
                    >
                      <UserCheck className="w-4 h-4 text-zinc-400" />
                      <span>Edit Candidate Calibration</span>
                    </Link>

                    <Link
                      href="/report"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-[#201a3d] transition-colors"
                    >
                      <FileText className="w-4 h-4 text-zinc-400" />
                      <span>View Performance Reports</span>
                    </Link>

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setIsRubricOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-[#201a3d] transition-colors text-left cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4 text-zinc-400" />
                      <span>Scoring Rubric Standards</span>
                    </button>
                  </div>

                  <div className="pt-2 mt-2 border-t border-zinc-100 dark:border-[#272147]">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        signOutMock();
                        router.push("/");
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left font-medium cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Logout from Session</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Command Palette Quick Search Modal (Ctrl + K) ───────────── */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-24 px-4"
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-[#15112a] rounded-2xl border border-zinc-200 dark:border-[#2b234f] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3.5 border-b border-zinc-100 dark:border-[#272147] flex items-center gap-3">
              <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                data-borderless="true"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to navigate tracks, telemetry, or reports..."
                className="w-full text-xs font-mono bg-transparent border-none outline-none focus:outline-none focus:ring-0 ring-0 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-[#7f77a8]"
                style={{ outline: "none", boxShadow: "none" }}
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#201a3d]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto p-2 space-y-1">
              {filteredLinks.length > 0 ? (
                filteredLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.href}
                      onClick={() => handleSelectLink(item.href)}
                      className="w-full p-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-[#1e1838] border border-transparent hover:border-zinc-200/80 dark:hover:border-[#352c61] flex items-center justify-between text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-zinc-500 dark:text-[#9e96c4] mt-0.5">
                            {item.desc}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  );
                })
              ) : (
                <div className="p-6 text-center text-xs font-mono text-zinc-500 dark:text-[#8e86b8]">
                  No matching tracks or stations found for &ldquo;{searchQuery}&rdquo;
                </div>
              )}
            </div>

            <div className="p-3 bg-zinc-50/80 dark:bg-[#100c22] border-t border-zinc-100 dark:border-[#272147] flex items-center justify-between text-[11px] font-mono text-zinc-400 dark:text-[#8e86b8]">
              <span>Navigate with mouse or arrow keys</span>
              <span>ESC to close</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Evaluation Rubric Modal (Candidate Scoring Standards) ──────── */}
      {isRubricOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsRubricOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-white dark:bg-[#15112a] rounded-2xl border border-zinc-200 dark:border-[#2b234f] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-zinc-100 dark:border-[#272147] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase font-mono tracking-wider">
                    Assessment Scoring Rubric
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-[#9e96c4]">
                    Transparent evaluation metrics used by the AI Evaluator & AST Sentry
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRubricOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#201a3d] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Pillar 1 */}
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#1c1638] border border-zinc-200/80 dark:border-[#2f2654] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">[01] AST Complexity</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800/60">25%</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-[#b2a9d6] leading-relaxed">
                    Tree-sitter syntax parser evaluates nested loops, recursion depth, and spatial heap allocations.
                  </p>
                </div>

                {/* Pillar 2 */}
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#1c1638] border border-zinc-200/80 dark:border-[#2f2654] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">[02] Correctness & Tests</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800/60">35%</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-[#b2a9d6] leading-relaxed">
                    Pass rate across public validation cases and private boundary fixtures in the isolated sandbox.
                  </p>
                </div>

                {/* Pillar 3 */}
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#1c1638] border border-zinc-200/80 dark:border-[#2f2654] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">[03] Verbal Reasoning</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800/60">20%</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-[#b2a9d6] leading-relaxed">
                    Clarity of architectural trade-offs, structured problem decomposition, and defense against edge case probes.
                  </p>
                </div>

                {/* Pillar 4 */}
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#1c1638] border border-zinc-200/80 dark:border-[#2f2654] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">[04] Claim Substantiation</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800/60">20%</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-[#b2a9d6] leading-relaxed">
                    Cross-verification of claims listed on your resume under pressure probing in the technical interview.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/50 text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed font-mono">
                💡 <span className="font-bold">Evaluation Principle:</span> Partial credit is awarded for clean algorithmic structure and trade-off analysis even if a single edge case fails.
              </div>
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-[#100c22] border-t border-zinc-100 dark:border-[#272147] flex justify-end">
              <button
                onClick={() => setIsRubricOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-indigo-600 hover:bg-zinc-800 dark:hover:bg-indigo-500 text-white font-mono text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
