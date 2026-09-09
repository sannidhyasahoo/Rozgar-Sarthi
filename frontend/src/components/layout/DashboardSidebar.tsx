"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppAuth } from "@/components/auth/AuthProvider";
import {
  LayoutDashboard,
  Mic,
  Code2,
  FileText,
  LogOut,
  Cpu,
  Menu,
  X,
  ShieldCheck,
  UserCheck,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOutMock } = useAppAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("rozgar_sidebar_collapsed");
    if (saved === "true") {
      setIsCollapsed(true);
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("rozgar_sidebar_collapsed", String(next));
      return next;
    });
  };

  const navItems = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Candidate Profile & Role",
      href: "/onboarding",
      icon: UserCheck,
    },
    {
      label: "AI Interview",
      href: "/interview",
      icon: Mic,
    },
    {
      label: "Coding Round",
      href: "/coding",
      icon: Code2,
    },
    {
      label: "Diagnostic Reports",
      href: "/report",
      icon: FileText,
    },
  ];

  const handleSignOut = () => {
    signOutMock();
    router.push("/");
  };

  return (
    <>
      {/* ── Mobile Top Bar ────────────────────────────────────────────── */}
      <div className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center text-white shadow-sm">
            <Cpu className="w-4 h-4 text-emerald-400 stroke-[1.8]" />
          </div>
          <span className="font-bold text-sm text-zinc-900 tracking-tight">Rozgar Sarthi</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 rounded-lg text-zinc-600 hover:bg-zinc-100 border border-zinc-200 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* ── Mobile Drawer (Slide-in with smooth backdrop blur) ────────── */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        >
          <div
            className="w-72 h-full bg-white shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center text-white shadow-sm">
                  <Cpu className="w-4 h-4 text-emerald-400 stroke-[1.8]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-zinc-900 text-sm">Rozgar Sarthi</span>
                  <span className="text-[10px] text-zinc-500 font-mono">Workspace</span>
                </div>
              </Link>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav list */}
            <div className="p-4 flex-1 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? "bg-zinc-100 text-zinc-900 font-semibold shadow-2xs"
                        : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? "text-iris" : "text-zinc-500"}`} />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Bottom Profile */}
            <div className="p-4 border-t border-zinc-100 space-y-3 bg-zinc-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-200 text-zinc-800 font-mono text-xs font-bold flex items-center justify-center">
                  {profile.name?.slice(0, 2).toUpperCase() || "CA"}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-zinc-900 truncate">
                    {profile.name || "Candidate"}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 truncate">
                    {profile.targetRole || "Backend Track"}
                  </div>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-medium text-red-600 bg-red-50/60 hover:bg-red-100/80 hover:text-red-700 border border-red-200/80 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-red-500" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop Animated Collapsible Sidebar ──────────────────────── */}
      <aside
        className={`hidden md:flex flex-col shrink-0 h-screen sticky top-0 border-r border-zinc-200 dark:border-[#1f1c2b] bg-white dark:bg-[#0e0d14] text-zinc-800 dark:text-zinc-200 select-none z-30 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isCollapsed ? "w-[72px]" : "w-64"
        }`}
      >
        <div className="flex flex-col h-full justify-between overflow-x-hidden">
          {/* Top Section */}
          <div className="p-4 space-y-5">
            {/* Header: Brand & Collapse/Expand Toggle Button */}
            <div className={`flex ${isCollapsed ? "flex-col items-center gap-3" : "flex-row items-center justify-between"}`}>
              <Link href="/dashboard" className="flex items-center gap-2.5 group min-w-0" title="Rozgar Sarthi Dashboard">
                <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-violet-950 dark:border dark:border-violet-700 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform shrink-0">
                  <Cpu className="w-4 h-4 text-emerald-400 stroke-[1.8]" />
                </div>
                {!isCollapsed && (
                  <div className="flex flex-col min-w-0 transition-opacity duration-200">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm tracking-tight truncate">
                        Rozgar Sarthi
                      </span>
                      <span className="font-mono text-[9px] uppercase px-1 py-0.5 rounded bg-zinc-100 dark:bg-[#181622] text-zinc-600 dark:text-[#9e98b7] border border-zinc-200 dark:border-[#1f1c2b] shrink-0">
                        v2.4
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500 dark:text-[#7c7599] font-mono truncate">
                      Adaptive Assessment
                    </span>
                  </div>
                )}
              </Link>

              {/* Desktop Toggle Button */}
              <button
                onClick={toggleCollapse}
                className="p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-[#181622] transition-all duration-200 cursor-pointer"
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? (
                  <PanelLeftOpen className="w-4 h-4" />
                ) : (
                  <PanelLeftClose className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Sentry System Engine Status Indicator */}
            {!isCollapsed && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50/70 dark:bg-[#12111a] border border-zinc-200/80 dark:border-[#1f1c2b] text-xs transition-colors">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="font-mono text-xs text-zinc-600 dark:text-[#9e98b7] font-medium">Sentry Engine Active</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 font-semibold">L1–L5</span>
              </div>
            )}

            {/* Navigation Links */}
            <div className="space-y-1">
              {!isCollapsed && (
                <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 dark:text-[#7c7599] font-semibold px-3 py-1">
                  Workspace
                </div>
              )}

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={isCollapsed ? item.label : undefined}
                      className={`relative flex items-center rounded-xl text-xs font-medium transition-all duration-150 group ${
                        isCollapsed
                          ? "justify-center w-10 h-10 mx-auto"
                          : "justify-between px-3 py-2.5 w-full"
                      } ${
                        isActive
                          ? "bg-zinc-100 dark:bg-[#1a1726] text-zinc-900 dark:text-zinc-100 font-semibold shadow-2xs"
                          : "text-zinc-600 dark:text-[#9e98b7] hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-[#14121e]"
                      }`}
                    >
                      <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
                        <Icon
                          className={`w-4 h-4 stroke-[1.8] shrink-0 transition-colors ${
                            isActive ? "text-iris dark:text-violet-400" : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200"
                          }`}
                        />
                        {!isCollapsed && (
                          <span className="truncate transition-opacity duration-200">
                            {item.label}
                          </span>
                        )}
                      </div>

                      {/* Tooltip on hover when collapsed */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-3 px-2.5 py-1 bg-zinc-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                          {item.label}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Bottom Candidate Info & Session Reset */}
          <div className="p-3 border-t border-zinc-200 dark:border-[#1f1c2b] space-y-3 bg-zinc-50/60 dark:bg-[#0e0d14] transition-all duration-200">
            {isCollapsed ? (
              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-[#1f1c2b] text-zinc-800 dark:text-zinc-200 font-mono text-xs font-bold flex items-center justify-center cursor-default"
                  title={`${profile.name || "Candidate"} (${profile.targetRole || "Backend Track"})`}
                >
                  {profile.name?.slice(0, 2).toUpperCase() || "CA"}
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-[#1f1c2b] text-zinc-800 dark:text-zinc-200 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    {profile.name?.slice(0, 2).toUpperCase() || "CA"}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {profile.name || "Candidate"}
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500 dark:text-[#9e98b7] truncate">
                      {profile.targetRole || "Backend Track"}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-red-600 dark:text-red-400 bg-red-50/60 dark:bg-red-950/30 hover:bg-red-100/80 dark:hover:bg-red-900/40 hover:text-red-700 dark:hover:text-red-300 border border-red-200/80 dark:border-red-900/50 transition-all shadow-2xs cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-500" />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
