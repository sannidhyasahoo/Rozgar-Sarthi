"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppAuth } from "@/components/auth/AuthProvider";
import {
  LayoutDashboard,
  Mic,
  Code2,
  FileText,
  Sliders,
  LogOut,
  Cpu,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOutMock } = useAppAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      label: "AI Interview",
      href: "/interview",
      icon: Mic,
      badge: "Round 01",
    },
    {
      label: "Coding Round",
      href: "/coding",
      icon: Code2,
      badge: "Round 02",
    },
    {
      label: "Diagnostic Reports",
      href: "/report",
      icon: FileText,
      badge: null,
    },
    {
      label: "Role Calibration",
      href: "/onboarding",
      icon: Sliders,
      badge: null,
    },
  ];

  const handleSignOut = async () => {
    if (confirm("Reset current interview session and start fresh?")) {
      await signOutMock();
      router.push("/");
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between bg-white text-zinc-800 select-none">
      {/* Top section */}
      <div className="space-y-6 p-5">
        {/* Brand header */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white shadow-sm group-hover:bg-zinc-800 transition-colors">
              <Cpu className="w-4 h-4 text-emerald-400 stroke-[1.8]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-zinc-900 text-sm tracking-tight">
                  Rozgar Sarthi
                </span>
                <span className="font-mono text-[9px] uppercase px-1 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                  v2.4
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">
                Adaptive Assessment
              </span>
            </div>
          </Link>

          {/* Close mobile drawer button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 rounded-md text-zinc-500 hover:bg-zinc-100"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status tag */}
        <div className="px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1bb152] animate-pulse" />
            <span className="text-[11px] font-mono text-zinc-600 font-medium">
              Sentry Engine Active
            </span>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">L1–L5</span>
        </div>

        {/* Navigation list */}
        <div className="space-y-1">
          <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 font-semibold px-3 py-1">
            Workspace
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-zinc-100 text-zinc-900 font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 stroke-[1.8] ${
                        isActive ? "text-[#6a5ed9]" : "text-zinc-500"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                        isActive
                          ? "bg-white text-zinc-800 border-zinc-200"
                          : "bg-zinc-50 text-zinc-500 border-zinc-200"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom candidate info & session reset */}
      <div className="p-4 border-t border-zinc-200 space-y-3 bg-zinc-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-zinc-200 text-zinc-700 font-mono text-xs font-bold flex items-center justify-center shrink-0">
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
        </div>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono text-zinc-600 bg-white hover:bg-zinc-100 hover:text-zinc-900 border border-zinc-200 transition-colors"
          title="Reset session and start over"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Reset Session</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar toggle */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b border-zinc-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center text-white">
            <Cpu className="w-3.5 h-3.5 text-emerald-400 stroke-[1.8]" />
          </div>
          <span className="font-bold text-sm text-zinc-900">Rozgar Sarthi</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-1.5 rounded-md text-zinc-600 hover:bg-zinc-100 border border-zinc-200"
          aria-label="Open sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile drawer backdrop */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        >
          <div
            className="w-64 h-full bg-white shadow-xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop fixed sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-zinc-200">
        {sidebarContent}
      </aside>
    </>
  );
}
