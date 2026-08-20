"use client";

import React, { useEffect, useState } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";

interface AudioWaveformProps {
  isListening: boolean;
  onToggleListening: () => void;
  isSpeaking?: boolean;
}

export function AudioWaveform({
  isListening,
  onToggleListening,
  isSpeaking = false,
}: AudioWaveformProps) {
  const [bars, setBars] = useState<number[]>([15, 25, 45, 30, 60, 80, 50, 70, 40, 20, 10, 35]);

  useEffect(() => {
    if (!isListening && !isSpeaking) {
      setBars([10, 12, 10, 14, 10, 12, 10, 14, 10, 12, 10, 12]);
      return;
    }

    const interval = setInterval(() => {
      setBars((prev) =>
        prev.map(() => Math.floor(Math.random() * (isSpeaking ? 75 : 55) + 15))
      );
    }, 120);

    return () => clearInterval(interval);
  }, [isListening, isSpeaking]);

  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-900 text-white border border-zinc-800 shadow-sm">
      {/* Mic toggle button */}
      <button
        onClick={onToggleListening}
        className={`p-2.5 rounded-lg flex items-center justify-center transition-all ${
          isListening
            ? "bg-coral text-white animate-pulse"
            : "bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700"
        }`}
        title={isListening ? "Mute Microphone" : "Enable Voice Interview"}
      >
        {isListening ? (
          <Mic className="w-4 h-4 stroke-[2]" />
        ) : (
          <MicOff className="w-4 h-4 stroke-[2]" />
        )}
      </button>

      {/* Waveform visualizer */}
      <div className="flex items-center gap-1 h-8 px-2 flex-1 justify-center overflow-hidden">
        {bars.map((height, i) => (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-100 ease-out ${
              isSpeaking
                ? "bg-iris"
                : isListening
                ? "bg-sprout"
                : "bg-zinc-700"
            }`}
            style={{ height: `${height}%` }}
          />
        ))}
      </div>

      {/* Voice Status Pill */}
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 font-mono text-[10px] text-zinc-400">
        {isSpeaking ? (
          <>
            <Volume2 className="w-3 h-3 text-iris animate-bounce" />
            <span className="text-iris font-semibold">AI SPEAKING</span>
          </>
        ) : isListening ? (
          <>
            <span className="w-2 h-2 rounded-full bg-coral animate-ping" />
            <span className="text-coral font-semibold">LISTENING</span>
          </>
        ) : (
          <span>VOICE READY</span>
        )}
      </div>
    </div>
  );
}
