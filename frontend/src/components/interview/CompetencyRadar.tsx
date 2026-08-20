"use client";

import React from "react";
import { CompetencyVector } from "@/lib/types";

interface CompetencyRadarProps {
  competencies: CompetencyVector;
  size?: number;
  showLabels?: boolean;
  dark?: boolean;
}

const AXES = [
  { key: "technical_depth", label: "Tech Depth", color: "#3f71d4" },
  { key: "system_design", label: "System Design", color: "#6a5ed9" },
  { key: "problem_solving", label: "Problem Solving", color: "#1bb152" },
  { key: "communication_clarity", label: "Communication", color: "#db5434" },
  { key: "ownership_specificity", label: "Ownership", color: "#ffb929" },
] as const;

export function CompetencyRadar({
  competencies,
  size = 280,
  showLabels = true,
  dark = false,
}: CompetencyRadarProps) {
  const center = size / 2;
  const radius = size * 0.38;
  const count = AXES.length;

  const getCoordinates = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
    const r = radius * Math.min(1, Math.max(0.1, value));
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const getLabelCoordinates = (index: number) => {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
    const r = radius + 22;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Polygon points
  const points = AXES.map((axis, i) => {
    const val = competencies[axis.key as keyof CompetencyVector] ?? 0.5;
    const { x, y } = getCoordinates(i, val);
    return `${x},${y}`;
  }).join(" ");

  // Grid rings (25%, 50%, 75%, 100%)
  const rings = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="overflow-visible">
          {/* Background grid rings */}
          {rings.map((ringVal) => {
            const ringPoints = AXES.map((_, i) => {
              const { x, y } = getCoordinates(i, ringVal);
              return `${x},${y}`;
            }).join(" ");

            return (
              <polygon
                key={ringVal}
                points={ringPoints}
                fill="none"
                stroke={dark ? "#3f3f46" : "#e4e4e7"}
                strokeWidth={ringVal === 1.0 ? "1.5" : "1"}
                strokeDasharray={ringVal === 1.0 ? "none" : "2,2"}
              />
            );
          })}

          {/* Radial axis lines */}
          {AXES.map((_, i) => {
            const { x, y } = getCoordinates(i, 1.0);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke={dark ? "#3f3f46" : "#e4e4e7"}
                strokeWidth="1"
              />
            );
          })}

          {/* Active Competency Polygon */}
          <polygon
            points={points}
            fill="rgba(106, 94, 217, 0.22)"
            stroke="#6a5ed9"
            strokeWidth="2.2"
            className="transition-all duration-500 ease-out"
          />

          {/* Data point markers */}
          {AXES.map((axis, i) => {
            const val = competencies[axis.key as keyof CompetencyVector] ?? 0.5;
            const { x, y } = getCoordinates(i, val);
            return (
              <circle
                key={axis.key}
                cx={x}
                cy={y}
                r="4.5"
                fill="#ffffff"
                stroke="#6a5ed9"
                strokeWidth="2.5"
                className="transition-all duration-500 ease-out"
              />
            );
          })}
        </svg>

        {/* Text Labels */}
        {showLabels &&
          AXES.map((axis, i) => {
            const { x, y } = getLabelCoordinates(i);
            const val = Math.round(
              (competencies[axis.key as keyof CompetencyVector] ?? 0.5) * 100
            );

            return (
              <div
                key={axis.key}
                className="absolute flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none text-center"
                style={{ left: x, top: y }}
              >
                <span
                  className={`text-[10px] font-mono font-medium leading-none ${
                    dark ? "text-zinc-400" : "text-zinc-600"
                  }`}
                >
                  {axis.label}
                </span>
                <span className="text-[11px] font-mono font-bold text-iris">
                  {val}%
                </span>
              </div>
            );
          })}
      </div>

      {/* Numerical breakdown bar list */}
      <div className="w-full mt-4 space-y-2">
        {AXES.map((axis) => {
          const val = competencies[axis.key as keyof CompetencyVector] ?? 0.5;
          const percentage = Math.round(val * 100);

          return (
            <div key={axis.key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span
                  className={`font-medium ${
                    dark ? "text-zinc-300" : "text-zinc-700"
                  }`}
                >
                  {axis.label}
                </span>
                <span className="font-mono text-[11px] text-zinc-500 font-semibold">
                  {percentage}%
                </span>
              </div>
              <div
                className={`w-full h-1.5 rounded-full overflow-hidden ${
                  dark ? "bg-zinc-800" : "bg-zinc-100"
                }`}
              >
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: axis.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
