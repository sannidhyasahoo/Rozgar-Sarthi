"use client";

import React from "react";
import { EvidenceItem } from "@/lib/types";
import { CheckCircle2, AlertTriangle, HelpCircle, GitCommit } from "lucide-react";

interface EvidenceGraphProps {
  evidenceList: EvidenceItem[];
  dark?: boolean;
}

export function EvidenceGraph({ evidenceList, dark = false }: EvidenceGraphProps) {
  if (!evidenceList || evidenceList.length === 0) {
    return (
      <div
        className={`p-6 rounded-xl border text-center ${
          dark
            ? "bg-zinc-900 border-zinc-800 text-zinc-500"
            : "bg-white border-zinc-200 text-zinc-400"
        }`}
      >
        <GitCommit className="w-8 h-8 mx-auto mb-2 opacity-40 stroke-[1.5]" />
        <p className="text-xs font-mono">No evidence nodes recorded yet.</p>
        <p className="text-[11px] text-zinc-500 mt-1">
          Candidate claims and technical quotes will populate here turn-by-turn.
        </p>
      </div>
    );
  }

  const signalBadges = {
    substantiated: {
      label: "Substantiated",
      badge: "bg-sprout/10 text-sprout border-sprout/20",
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-sprout stroke-[1.8]" />,
    },
    unsubstantiated: {
      label: "Unsubstantiated",
      badge: "bg-coral/10 text-coral border-coral/20",
      icon: <AlertTriangle className="w-3.5 h-3.5 text-coral stroke-[1.8]" />,
    },
    probing: {
      label: "Probing",
      badge: "bg-cobalt/10 text-cobalt border-cobalt/20",
      icon: <HelpCircle className="w-3.5 h-3.5 text-cobalt stroke-[1.8]" />,
    },
    contradictory: {
      label: "Contradiction Flag",
      badge: "bg-crimson/10 text-crimson border-crimson/20",
      icon: <AlertTriangle className="w-3.5 h-3.5 text-crimson stroke-[1.8]" />,
    },
  };

  return (
    <div className="space-y-3">
      {evidenceList.map((item, idx) => {
        const badgeConfig = signalBadges[item.signal] || signalBadges.probing;

        return (
          <div
            key={idx}
            className={`p-3.5 rounded-xl border transition-all ${
              dark
                ? "bg-zinc-900/90 border-zinc-800 hover:border-zinc-700"
                : "bg-white border-zinc-200 hover:border-zinc-300"
            }`}
          >
            {/* Header: Turn # & Signal */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                  TURN {item.turn_id}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    dark ? "text-zinc-200" : "text-zinc-800"
                  }`}
                >
                  {item.competency}
                </span>
              </div>
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded border ${badgeConfig.badge}`}
              >
                {badgeConfig.icon}
                {badgeConfig.label}
              </span>
            </div>

            {/* Quote Block */}
            <div
              className={`p-2.5 rounded-md text-xs italic mb-2 border-l-2 ${
                item.signal === "substantiated"
                  ? "border-sprout bg-sprout/5"
                  : item.signal === "unsubstantiated"
                  ? "border-coral bg-coral/5"
                  : "border-cobalt bg-cobalt/5"
              } ${dark ? "text-zinc-300" : "text-zinc-700"}`}
            >
              &ldquo;{item.quote}&rdquo;
            </div>

            {/* Evaluator Observation */}
            <div className="text-[11px] text-zinc-500 leading-relaxed">
              <span className="font-mono text-zinc-400 font-medium">Observation: </span>
              {item.observation}
            </div>
          </div>
        );
      })}
    </div>
  );
}
