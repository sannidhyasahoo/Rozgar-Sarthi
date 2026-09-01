import React from "react";

interface MacWindowFrameProps {
  title?: string;
  children: React.ReactNode;
  dark?: boolean;
  className?: string;
}

export function MacWindowFrame({
  title = "rozgar-sarthi-telemetry",
  children,
  dark = false,
  className = "",
}: MacWindowFrameProps) {
  return (
    <div
      className={`rounded-xl overflow-hidden border shadow-xl transition-all ${
        dark
          ? "bg-zinc-900 border-zinc-800 text-zinc-100"
          : "bg-white border-zinc-200 text-zinc-900"
      } ${className}`}
    >
      {/* Window Title Bar */}
      <div
        className={`px-4 py-2.5 flex items-center justify-between border-b select-none ${
          dark ? "bg-zinc-950/80 border-zinc-800/80" : "bg-zinc-100/90 border-zinc-200"
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
        </div>
        <div className="font-mono text-xs text-zinc-500 font-medium tracking-tight">
          {title}
        </div>
        <div className="w-12 text-right">
          <span className="font-mono text-[10px] text-zinc-400">STREAMING</span>
        </div>
      </div>

      {/* Window Body */}
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}
