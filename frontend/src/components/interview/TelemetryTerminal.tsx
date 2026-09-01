"use client";

import React, { useEffect, useRef } from "react";
import { TurnTelemetry } from "@/lib/types";
import { Terminal, Activity, Check, AlertCircle } from "lucide-react";

interface TelemetryTerminalProps {
  logs: TurnTelemetry[];
  turnCount: number;
}

export function TelemetryTerminal({ logs, turnCount }: TelemetryTerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono text-xs overflow-hidden shadow-xl">
      {/* Header Bar */}
      <div className="px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-sprout" />
          <span className="text-zinc-300 font-semibold text-[11px] tracking-wide">
            ENGINE_TELEMETRY.LOG
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-zinc-500">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-sprout animate-pulse" />
            LIVE PIPELINE
          </span>
          <span>TURN: {turnCount}</span>
        </div>
      </div>

      {/* Terminal Body */}
      <div
        ref={scrollRef}
        className="p-4 h-64 overflow-y-auto space-y-2.5 text-[11px] leading-relaxed scrollbar-thin"
      >
        <div className="text-zinc-600">
          [00:00:00] <span className="text-zinc-400">INIT:</span> LangGraph adaptive state graph loaded. Thread session initialized.
        </div>

        {logs.map((log, idx) => (
          <div key={idx} className="space-y-1 pt-1 border-t border-zinc-900">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">[{new Date().toLocaleTimeString()}]</span>
              <span className="text-cobalt font-bold">TURN_{log.turn_id}:</span>
              <span className="text-zinc-300">{log.probed_competency}</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] ${
                  log.evaluation_signal === "substantiated"
                    ? "bg-sprout/20 text-sprout border border-sprout/30"
                    : log.evaluation_signal === "unsubstantiated"
                    ? "bg-coral/20 text-coral border border-coral/30"
                    : "bg-cobalt/20 text-cobalt border border-cobalt/30"
                }`}
              >
                {log.evaluation_signal.toUpperCase()}
              </span>
            </div>

            <div className="pl-4 text-zinc-400 flex flex-col gap-0.5">
              <div>
                <span className="text-zinc-600">→ Pressure Level:</span>{" "}
                <span className="text-iris font-semibold">L{log.pressure_level}</span> | Latency:{" "}
                <span className="text-emerald-400">{log.latency_ms}ms</span>
              </div>
              {log.extracted_claims && log.extracted_claims.length > 0 && (
                <div className="text-zinc-400">
                  <span className="text-zinc-600">→ Claim Extracted:</span> {log.extracted_claims[0]}
                </div>
              )}
              {log.missing_concepts && log.missing_concepts.length > 0 && (
                <div className="text-coral">
                  <span className="text-zinc-600">→ Missing Context:</span> {log.missing_concepts.join(", ")}
                </div>
              )}
            </div>
          </div>
        ))}

        {logs.length === 0 && (
          <div className="text-zinc-600 italic">
            Waiting for candidate first response to trigger state evaluation cycle...
          </div>
        )}
      </div>
    </div>
  );
}
