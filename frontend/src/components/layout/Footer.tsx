import React from "react";
import Link from "next/link";
import { Cpu, Terminal, Shield, GitFork, Activity } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-zinc-100 border-t border-zinc-200 mt-24">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: System Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-zinc-900 flex items-center justify-center text-white">
                <Cpu className="w-3.5 h-3.5 text-emerald-400 stroke-[1.8]" />
              </div>
              <span className="font-bold text-zinc-900 text-sm tracking-tight">
                Rozgar Sarthi
              </span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Adaptive interview intelligence engine that evaluates candidate reasoning, builds evidence graphs, and pressure-tests technical claims.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono text-zinc-600 bg-white border border-zinc-200">
                <span className="w-1.5 h-1.5 rounded-full bg-sprout" />
                LangGraph State v2.4
              </span>
            </div>
          </div>

          {/* Col 2: Assessment Engine */}
          <div className="space-y-2">
            <h4 className="font-mono text-xs uppercase tracking-wider text-zinc-500 font-semibold">
              Assessment Engine
            </h4>
            <ul className="space-y-1.5 text-xs text-zinc-600">
              <li>
                <Link href="/interview" className="hover:text-zinc-900 transition-colors">
                  Adaptive AI Interview
                </Link>
              </li>
              <li>
                <Link href="/coding" className="hover:text-zinc-900 transition-colors">
                  Reasoning Trajectory Coding
                </Link>
              </li>
              <li>
                <Link href="/report" className="hover:text-zinc-900 transition-colors">
                  Diagnostic Reports & Audit
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">
                  Candidate Competency Matrix
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Intelligence Modules */}
          <div className="space-y-2">
            <h4 className="font-mono text-xs uppercase tracking-wider text-zinc-500 font-semibold">
              Core Architecture
            </h4>
            <ul className="space-y-1.5 text-xs text-zinc-600">
              <li className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cobalt stroke-[1.8]" />
                <span>5-Dimensional State Vector</span>
              </li>
              <li className="flex items-center gap-1.5">
                <GitFork className="w-3.5 h-3.5 text-coral stroke-[1.8]" />
                <span>Turn-by-Turn Evidence Graph</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-sprout stroke-[1.8]" />
                <span>Adaptive Pressure (Levels 1–5)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-zinc-700 stroke-[1.8]" />
                <span>Cross-Answer Consistency Check</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Technical Roles */}
          <div className="space-y-2">
            <h4 className="font-mono text-xs uppercase tracking-wider text-zinc-500 font-semibold">
              Calibration Tracks
            </h4>
            <ul className="space-y-1.5 text-xs text-zinc-600">
              <li>Backend & High-Throughput APIs</li>
              <li>AI/ML Serving & Evaluation Graphs</li>
              <li>Distributed Systems & Infrastructure</li>
              <li>Frontend & Rendering Performance</li>
              <li>Data Lakes & Stream Processing</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <div>
            © {new Date().getFullYear()} Rozgar Sarthi Engine. Designed for engineering pair-interviews.
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>FastAPI + LangGraph Core</span>
            <span>•</span>
            <span>Inter Variable & DM Mono</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
