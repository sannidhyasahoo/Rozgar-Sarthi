"use client";

import React from "react";
import { useAppAuth } from "@/components/auth/AuthProvider";
import { useInterview } from "@/hooks/useInterview";
import { Mic, MicOff, PhoneOff, Activity, AlertTriangle } from "lucide-react";

export default function VoiceInterviewPage() {
  const { profile } = useAppAuth();
  const { isCallActive, aiStatus, transcript, errorMessage, startInterview, endInterview } = useInterview();

  // Determine current AI subtitles
  const latestAiTranscript = transcript
    .filter((msg) => msg.role === "assistant")
    .slice(-1)[0]?.text || "";

  const latestUserTranscript = transcript
    .filter((msg) => msg.role === "user")
    .slice(-1)[0]?.text || "";

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col relative overflow-hidden">
      {/* Background Decorators for Depth */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-iris/5 to-transparent pointer-events-none" />
      
      {/* Top Navbar / Controls */}
      <div className="relative z-10 w-full max-w-5xl mx-auto p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-iris/10 border border-iris/20 flex items-center justify-center text-iris">
                <Activity className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
                <h1 className="font-bold text-sm text-zinc-900">Rozgar Sarthi Evaluator</h1>
                <p className="text-xs text-zinc-500 font-mono">Live Session • {profile.targetRole || "Candidate"}</p>
            </div>
        </div>
        {isCallActive && (
          <button
              onClick={endInterview}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-full text-sm font-semibold hover:bg-zinc-800 transition-colors shadow-sm"
          >
              <PhoneOff className="w-4 h-4" />
              End Session
          </button>
        )}
      </div>

      {/* Center Blob Visualization */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-4xl mx-auto px-4">
        
        {/* The Blob */}
        <div className="relative flex items-center justify-center w-64 h-64">
            {/* Outer rings pulsating when AI is speaking or listening */}
            <div className={`absolute inset-0 rounded-full border-2 transition-all duration-700 ease-in-out ${
              aiStatus === 'error' ? 'border-red-400/30 scale-100 opacity-30' :
              aiStatus === 'speaking' ? 'border-iris/30 scale-150 opacity-0 animate-ping' : 
              aiStatus === 'listening' ? 'border-iris/30 scale-125 opacity-20' : 'border-iris/30 scale-100 opacity-10'
            }`} />
            <div className={`absolute inset-4 rounded-full border transition-all duration-500 ease-in-out ${
              aiStatus === 'error' ? 'border-red-400/40 scale-100 opacity-30' :
              aiStatus === 'speaking' ? 'border-iris/40 scale-125 opacity-0 animate-ping delay-150' : 
              aiStatus === 'listening' ? 'border-iris/40 scale-110 opacity-30' : 'border-iris/40 scale-100 opacity-20'
            }`} />
            
            {/* Inner glowing blob */}
            <div className={`relative w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ease-in-out cursor-pointer ${
                aiStatus === 'error'
                    ? 'bg-red-500 shadow-red-500/50 scale-100'
                    : aiStatus === 'speaking' 
                        ? 'bg-iris shadow-iris/50 scale-110' 
                        : aiStatus === 'listening' 
                            ? 'bg-emerald-500 shadow-emerald-500/50 scale-105'
                            : 'bg-zinc-800 shadow-zinc-800/20 scale-100 hover:bg-zinc-700'
            }`}
            onClick={isCallActive ? endInterview : () => startInterview(profile)}
            >
                {aiStatus === 'error' ? (
                    <AlertTriangle className="w-8 h-8 text-white" />
                ) : aiStatus === 'listening' ? (
                    <Mic className="w-8 h-8 text-white animate-pulse" />
                ) : aiStatus === 'speaking' ? (
                    <Activity className="w-8 h-8 text-white animate-pulse" />
                ) : (
                    <MicOff className="w-8 h-8 text-zinc-400" />
                )}
            </div>
        </div>

        {/* Subtitles Area */}
        <div className="mt-16 w-full max-w-2xl min-h-[120px] text-center space-y-4">
            {/* Error Message */}
            {errorMessage && (
                <div className="animate-fade-in">
                    <p className="text-xs font-mono text-red-500 uppercase tracking-widest mb-2 font-semibold">Error</p>
                    <p className="text-sm text-red-600 font-medium leading-relaxed bg-red-50 border border-red-200 rounded-xl px-4 py-3">{errorMessage}</p>
                    <button 
                      onClick={() => startInterview(profile)}
                      className="mt-4 px-4 py-2 bg-iris text-white rounded-xl text-sm font-semibold hover:bg-iris/90 transition-colors"
                    >
                      Try Again
                    </button>
                </div>
            )}

            {aiStatus === 'listening' && latestUserTranscript && (
                <div className="animate-fade-in">
                    <p className="text-xs font-mono text-emerald-600 uppercase tracking-widest mb-2 font-semibold">You</p>
                    <p className="text-lg text-zinc-800 font-medium leading-relaxed">&quot;{latestUserTranscript}&quot;</p>
                </div>
            )}

            {aiStatus === 'speaking' && latestAiTranscript && (
                <div className="animate-fade-in">
                    <p className="text-xs font-mono text-iris uppercase tracking-widest mb-2 font-semibold">Rozgar Sarthi</p>
                    <p className="text-xl md:text-2xl text-zinc-900 font-medium leading-relaxed text-balance">
                        {latestAiTranscript}
                    </p>
                </div>
            )}

            {!isCallActive && !errorMessage && (
                <div className="animate-fade-in opacity-50">
                    <p className="text-sm font-mono text-zinc-500 mb-2">Tap the mic to start the interview</p>
                </div>
            )}
            
            {isCallActive && aiStatus === 'idle' && (
                <div className="animate-fade-in opacity-50">
                    <p className="text-sm font-mono text-zinc-500 mb-2">Connecting...</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

