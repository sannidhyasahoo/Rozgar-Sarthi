"use client";

import React from "react";
import { PressureLevel, PRESSURE_LEVELS } from "@/lib/types";
import { ShieldAlert, Zap, Compass, Search, Flame } from "lucide-react";

interface PressureDialProps {
  currentLevel: PressureLevel;
  dark?: boolean;
}

export function PressureDial({ currentLevel, dark = false }: PressureDialProps) {
  const current = PRESSURE_LEVELS[currentLevel];

  const icons = {
    1: <Compass className="w-4 h-4 text-zinc-500 stroke-[1.8]" />,
    2: <Search className="w-4 h-4 text-cobalt stroke-[1.8]" />,
    3: <Zap className="w-4 h-4 text-sprout stroke-[1.8]" />,
    4: <Flame className="w-4 h-4 text-coral stroke-[1.8]" />,
    5: <ShieldAlert className="w-4 h-4 text-crimson stroke-[1.8]" />,
  };

  return (
    <div
      className={`p-4 rounded-xl border transition-colors ${
        dark ? "bg-zinc-900/90 border-zinc-800" : "bg-white border-zinc-200"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-zinc-500 font-semibold">
            Adaptive Pressure
          </span>
        </div>
        <span
          className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded border ${current.badgeColor}`}
        >
          {current.tag}
        </span>
      </div>

      {/* 5-Step Segmented Gauge */}
      <div className="grid grid-cols-5 gap-1.5 mb-3">
        {([1, 2, 3, 4, 5] as PressureLevel[]).map((lvl) => {
          const isActive = lvl === currentLevel;
          const isPassed = lvl < currentLevel;

          let colorClass = "bg-zinc-200";
          if (dark) colorClass = "bg-zinc-800";

          if (isPassed || isActive) {
            if (lvl === 1) colorClass = "bg-zinc-400";
            if (lvl === 2) colorClass = "bg-cobalt";
            if (lvl === 3) colorClass = "bg-sprout";
            if (lvl === 4) colorClass = "bg-coral";
            if (lvl === 5) colorClass = "bg-crimson";
          }

          return (
            <div key={lvl} className="flex flex-col gap-1">
              <div
                className={`h-2 rounded-sm transition-all duration-300 ${colorClass} ${
                  isActive ? "ring-2 ring-offset-1 ring-iris scale-y-110" : "opacity-80"
                }`}
              />
              <span
                className={`text-[9px] font-mono text-center ${
                  isActive
                    ? "font-bold text-iris"
                    : dark
                    ? "text-zinc-600"
                    : "text-zinc-400"
                }`}
              >
                L{lvl}
              </span>
            </div>
          );
        })}
      </div>

      {/* Level Info Summary */}
      <div
        className={`p-2.5 rounded-lg flex items-start gap-2.5 ${
          dark ? "bg-zinc-800/60" : "bg-zinc-50"
        }`}
      >
        <div className="mt-0.5 flex-shrink-0">{icons[currentLevel]}</div>
        <div className="space-y-0.5">
          <div
            className={`text-xs font-semibold ${
              dark ? "text-zinc-200" : "text-zinc-900"
            }`}
          >
            {current.name}
          </div>
          <p className="text-[11px] text-zinc-500 leading-snug">
            {current.description}
          </p>
        </div>
      </div>
    </div>
  );
}
