"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppAuth } from "@/components/auth/AuthProvider";
import { useInterview } from "@/hooks/useInterview";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  PhoneCall,
  Activity,
  ArrowLeft,
  MessageSquare,
  FileText,
  ShieldCheck,
  Subtitles,
  Sparkles,
  Maximize2,
  Minimize2,
  X,
  Volume2,
  AlertTriangle,
  Wifi,
  Users,
  CheckCircle2,
  Bot,
  Loader2,
} from "lucide-react";

export default function OnlineVideoInterviewPage() {
  const router = useRouter();
  const { profile } = useAppAuth();
  const {
    isCallActive,
    isConnecting,
    aiStatus,
    transcript,
    errorMessage,
    startInterview,
    endInterview,
  } = useInterview();

  // ── Meeting State & Controls ────────────────────────────────────────────────
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [activeSidePanel, setActiveSidePanel] = useState<"transcript" | "scope" | null>(null);
  const [meetingSeconds, setMeetingSeconds] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  // ── Meeting Elapsed Timer ──────────────────────────────────────────────────
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isCallActive) {
      interval = setInterval(() => {
        setMeetingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setMeetingSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCallActive]);

  // ── Auto-scroll transcript drawer ──────────────────────────────────────────
  useEffect(() => {
    if (activeSidePanel === "transcript") {
      transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [transcript, activeSidePanel]);

  // ── Format Meeting Time (mm:ss) ─────────────────────────────────────────────
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // ── Camera Toggle (Webcam stream with safe fallback) ────────────────────────
  const toggleCamera = async () => {
    if (isCameraOn) {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
        setCameraStream(null);
      }
      setIsCameraOn(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        setCameraStream(stream);
        setIsCameraOn(true);
      } catch (err) {
        console.warn("[Camera] Permission denied or unavailable:", err);
        setIsCameraOn(false);
      }
    }
  };

  // Attach stream to video element when stream is updated
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  // Cleanup media stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  // ── Fullscreen Toggle ───────────────────────────────────────────────────────
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // ── Safe Navigation Back to Dashboard ───────────────────────────────────────
  const handleBackToDashboard = () => {
    if (isCallActive) {
      endInterview();
    }
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
    }
    router.push("/dashboard");
  };

  const handleEndCall = () => {
    endInterview();
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
    }
  };

  // ── Latest Captions ────────────────────────────────────────────────────────
  const latestAiTranscript =
    transcript.filter((msg) => msg.role === "assistant").slice(-1)[0]?.text || "";

  const latestUserTranscript =
    transcript.filter((msg) => msg.role === "user").slice(-1)[0]?.text || "";

  const currentSpeakerText =
    aiStatus === "speaking"
      ? { speaker: "AI Technical Evaluator", text: latestAiTranscript, isAi: true }
      : aiStatus === "listening" && latestUserTranscript
      ? { speaker: `You (${profile.name || "Candidate"})`, text: latestUserTranscript, isAi: false }
      : null;

  return (
    <div className="h-screen w-screen bg-[#08070c] text-zinc-100 flex flex-col select-none overflow-hidden font-sans">
      {/* ── Top Meeting Header (Google Meet style) ─────────────────────────── */}
      <header className="h-14 border-b border-[#1f1c2b] bg-[#0c0b12]/95 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-30">
        {/* Left: Back button & Room details */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-zinc-200 hover:text-white bg-[#14121e] hover:bg-[#1c192b] border border-[#1f1c2b] transition-colors shadow-2xs group cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-zinc-300 group-hover:-translate-x-0.5 transition-transform" />
            <span>Dashboard</span>
          </button>

          <div className="h-4 w-px bg-[#1f1c2b] hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-tight flex items-center gap-2">
                <span>Rozgar Sarthi Evaluator Room</span>
                <span className="hidden md:inline px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#14121e] text-zinc-300 border border-[#1f1c2b]">
                  Round 01
                </span>
              </div>
              <div className="text-[10px] font-mono text-zinc-400 truncate max-w-[200px] sm:max-w-xs">
                {profile.targetRole || "Backend Engineer"} • Live Assessment
              </div>
            </div>
          </div>
        </div>

        {/* Center: Live Meeting Status & Timer */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isCallActive ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/50 border border-red-800/50 text-red-400 text-xs font-mono font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>REC</span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-300 font-mono tracking-wider">{formatTime(meetingSeconds)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#14121e] border border-[#1f1c2b] text-zinc-300 text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Pre-Call Waiting Room</span>
            </div>
          )}
        </div>

        {/* Right: Network Quality & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 px-2 py-0.5 rounded">
            <Wifi className="w-3 h-3" />
            <span>HD 60fps</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-zinc-400 bg-[#14121e] px-2.5 py-1 rounded-lg border border-[#1f1c2b]">
            <Users className="w-3.5 h-3.5 text-zinc-400" />
            <span>2</span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ── Main Interview Body: Video Grid + Side Drawer ───────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left/Center: Video Participants Grid */}
        <main className="flex-1 flex flex-col p-3 sm:p-4 gap-3 sm:gap-4 overflow-hidden relative">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 min-h-0">
            {/* ── Participant Tile 1: AI Technical Evaluator ─────────────────── */}
            <div
              className={`rounded-2xl bg-[#0e0d14] border transition-all duration-300 relative overflow-hidden flex flex-col justify-between p-4 shadow-2xl ${
                aiStatus === "speaking"
                  ? "border-indigo-500/80 ring-2 ring-indigo-500/20 shadow-indigo-950/30"
                  : aiStatus === "listening"
                  ? "border-emerald-500/50 ring-1 ring-emerald-500/20"
                  : "border-[#1f1c2b]"
              }`}
            >
              {/* Studio lighting backdrop effect */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  background:
                    aiStatus === "speaking"
                      ? "radial-gradient(circle at 50% 40%, #6366f1 0%, transparent 65%)"
                      : "radial-gradient(circle at 50% 40%, #3f71d4 0%, transparent 65%)",
                }}
              />

              {/* Tile Top Bar: State & Identifier */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-xs font-mono">
                  <Bot className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-semibold text-white">AI Lead Evaluator</span>
                </div>

                {/* Live Status Pill */}
                <div>
                  {aiStatus === "speaking" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-mono font-bold animate-pulse">
                      <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Speaking</span>
                    </span>
                  ) : aiStatus === "listening" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-mono font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>Listening to You</span>
                    </span>
                  ) : isCallActive ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#14121e] border border-[#1f1c2b] text-zinc-400 text-xs font-mono">
                      <span>Analyzing</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#14121e] border border-[#1f1c2b] text-zinc-400 text-xs font-mono">
                      <span>Ready</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Tile Center: AI Avatar & Audio Visualizer Equalizer */}
              <div className="relative z-10 flex flex-col items-center justify-center my-auto py-6">
                <div className="relative flex items-center justify-center">
                  {/* Expanding audio waves when AI is speaking */}
                  {aiStatus === "speaking" && (
                    <>
                      <div className="absolute inset-0 rounded-full border border-indigo-400/30 scale-150 animate-ping opacity-25" />
                      <div className="absolute inset-0 rounded-full border border-indigo-500/40 scale-125 animate-pulse opacity-40" />
                    </>
                  )}

                  {/* AI Persona Circular Frame (Refined border) */}
                  <div
                    className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 font-mono font-bold text-3xl select-none ${
                      aiStatus === "speaking"
                        ? "border-2 border-indigo-400 bg-gradient-to-tr from-indigo-950 via-[#1f2029] to-indigo-900 text-indigo-300 shadow-indigo-500/30 scale-105"
                        : aiStatus === "listening"
                        ? "border-2 border-emerald-400/60 bg-gradient-to-tr from-[#161c18] to-[#121815] text-emerald-300 shadow-emerald-500/20"
                        : "border border-white/10 bg-[#14121e] text-zinc-100 shadow-black/40"
                    }`}
                  >
                    AI
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <div className="text-sm font-bold text-zinc-200">AI Evaluator</div>
                  <div className="text-xs font-mono text-zinc-400 dark:text-zinc-300 mt-0.5">
                    {aiStatus === "speaking"
                      ? "Speaking..."
                      : aiStatus === "listening"
                      ? "Listening to your response..."
                      : "Rozgar Sarthi Sentry"}
                  </div>
                </div>

                {/* Animated Soundwave Equalizer Bars */}
                <div className="flex items-center gap-1 mt-6 h-6">
                  {[4, 8, 14, 20, 16, 10, 18, 12, 6, 15, 8, 4].map((height, i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-full transition-all duration-150 ${
                        aiStatus === "speaking"
                          ? "bg-indigo-400 animate-pulse"
                          : aiStatus === "listening"
                          ? "bg-emerald-500/40"
                          : "bg-zinc-800"
                      }`}
                      style={{
                        height:
                          aiStatus === "speaking"
                            ? `${Math.max(4, (height * ((i % 3) + 1.2)) % 24)}px`
                            : "4px",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Tile Bottom Bar: Name Tag & Mic Status */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white">AI Technical Evaluator</span>
                </div>

                <div className="p-1.5 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 text-emerald-400">
                  <Volume2 className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* ── Participant Tile 2: Candidate Stream (You) ────────────────── */}
            <div className="rounded-2xl bg-[#0e0d14] border border-[#1f1c2b] relative overflow-hidden flex flex-col justify-between p-4 shadow-2xl">
              {/* If Camera is ON, render real webcam video stream */}
              {isCameraOn ? (
                <div className="absolute inset-0 z-0 bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                </div>
              ) : (
                /* Fallback Candidate Avatar Tile when Camera is OFF */
                <div className="relative z-10 flex flex-col items-center justify-center my-auto py-6">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#14121e] border border-white/10 flex items-center justify-center text-zinc-100 font-mono font-bold text-3xl shadow-xl">
                    {profile.name?.slice(0, 2).toUpperCase() || "CA"}
                  </div>
                  <div className="mt-4 text-center">
                    <div className="text-sm font-bold text-white">{profile.name || "Candidate"}</div>
                    <div className="text-xs font-mono text-zinc-400 mt-0.5">
                      Camera is muted • Click Camera button to enable
                    </div>
                  </div>
                </div>
              )}

              {/* Tile Top Bar: Self Indicator & Camera Status */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-xs font-mono text-white">
                  <Users className="w-3.5 h-3.5 text-zinc-300" />
                  <span>You ({profile.name || "Candidate"})</span>
                </div>

                <button
                  onClick={toggleCamera}
                  className={`p-1.5 rounded-lg backdrop-blur-md border transition-colors cursor-pointer ${
                    isCameraOn
                      ? "bg-black/40 border-white/10 text-zinc-300 hover:text-white"
                      : "bg-red-950/50 border-red-800/40 text-red-400"
                  }`}
                  title={isCameraOn ? "Turn camera off" : "Turn camera on"}
                >
                  {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </button>
              </div>

              {/* Tile Bottom Bar: Candidate Name Tag & Live Audio Indicator */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isMicMuted
                        ? "bg-red-500"
                        : aiStatus === "listening"
                        ? "bg-emerald-400 animate-pulse"
                        : "bg-zinc-500"
                    }`}
                  />
                  <span className="text-xs font-bold text-white">
                    {profile.name || "Alex Dev"} (You)
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 hidden sm:inline">
                    • {profile.targetRole || "Backend Track"}
                  </span>
                </div>

                <div
                  className={`p-1.5 rounded-lg backdrop-blur-md border ${
                    isMicMuted
                      ? "bg-red-950/60 border-red-800/50 text-red-400"
                      : "bg-black/40 border-white/10 text-emerald-400"
                  }`}
                >
                  {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </div>
              </div>
            </div>
          </div>

          {/* ── Google Meet Closed Captions Banner (Subtitles) ────────────────── */}
          {showCaptions && (
            <div className="shrink-0 flex justify-center px-4">
              <div className="max-w-2xl w-full bg-[#0e0d14]/90 backdrop-blur-xl border border-[#1f1c2b] rounded-2xl p-3.5 shadow-2xl text-center transition-all">
                {currentSpeakerText ? (
                  <div className="space-y-1 animate-fade-in">
                    <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold">
                      <span className={currentSpeakerText.isAi ? "text-indigo-400" : "text-emerald-400"}>
                        {currentSpeakerText.speaker}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-zinc-100 font-medium leading-relaxed">
                      &ldquo;{currentSpeakerText.text}&rdquo;
                    </p>
                  </div>
                ) : (
                  <div className="text-xs font-mono text-zinc-400 flex items-center justify-center gap-2 py-1">
                    <Subtitles className="w-3.5 h-3.5 text-zinc-500" />
                    <span>
                      {isCallActive
                        ? "Live dialogue captions active • Speak naturally into your microphone"
                        : "Ready to interview • Click 'Join AI Interview' below to start the conversational session"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Error Banner if any ─────────────────────────────────────────── */}
          {errorMessage && (
            <div className="shrink-0 flex justify-center px-4">
              <div className="max-w-xl w-full bg-red-950/80 border border-red-800/80 rounded-xl p-3 flex items-center justify-between text-xs text-red-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
                <button
                  onClick={() => startInterview(profile)}
                  className="px-3 py-1 bg-red-800 hover:bg-red-700 rounded-lg font-mono font-bold text-white transition-colors cursor-pointer"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
        </main>

        {/* ── Google Meet Side Panel Drawer (Transcript & Scope) ──────────────── */}
        {activeSidePanel && (
          <aside className="w-80 sm:w-96 bg-[#0c0b12] border-l border-[#1f1c2b] flex flex-col shrink-0 z-20 transition-all duration-300">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#1f1c2b] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveSidePanel("transcript")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                    activeSidePanel === "transcript"
                      ? "bg-[#181624] text-white border border-[#262335]"
                      : "text-zinc-400 hover:text-zinc-200 border border-transparent"
                  }`}
                >
                  Live Transcript ({transcript.length})
                </button>
                <button
                  onClick={() => setActiveSidePanel("scope")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                    activeSidePanel === "scope"
                      ? "bg-[#181624] text-white border border-[#262335]"
                      : "text-zinc-400 hover:text-zinc-200 border border-transparent"
                  }`}
                >
                  Evaluation Scope
                </button>
              </div>

              <button
                onClick={() => setActiveSidePanel(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                title="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans">
              {activeSidePanel === "transcript" ? (
                transcript.length === 0 ? (
                  <div className="text-center py-12 text-zinc-500 text-xs font-mono">
                    No transcript entries yet. Begin speaking to see the live conversation log.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transcript.map((msg, i) => {
                      const isAi = msg.role === "assistant";
                      return (
                        <div
                          key={i}
                          className={`p-3 rounded-xl text-xs space-y-1 border ${
                            isAi
                              ? "bg-indigo-950/30 border-indigo-900/40 text-zinc-200"
                              : "bg-[#14121e] border-[#1f1c2b] text-zinc-300"
                          }`}
                        >
                          <div className="flex items-center justify-between font-mono text-[10px]">
                            <span className={isAi ? "text-indigo-400 font-bold" : "text-emerald-400 font-bold"}>
                              {isAi ? "AI Technical Evaluator" : profile.name || "You"}
                            </span>
                            <span className="text-zinc-500">Live</span>
                          </div>
                          <p className="leading-relaxed">{msg.text}</p>
                        </div>
                      );
                    })}
                    <div ref={transcriptEndRef} />
                  </div>
                )
              ) : (
                /* Scope Tab: Candidate Claims and Sentry Details */
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-[#14121e] border border-[#1f1c2b] space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-200 uppercase">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Calibrated Role Track</span>
                    </div>
                    <div className="text-sm font-bold text-white">{profile.targetRole || "Backend Engineer"}</div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Sentry cross-examination configured for {profile.experienceYears || 4} Years Experience.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[11px] font-mono text-zinc-400 uppercase font-bold tracking-wider">
                      Verified Resume Claims under Test:
                    </div>
                    {(profile.keyClaims || [
                      "Reduced API p99 latency by 45% through Redis caching",
                      "Migrated monolithic ingestion to Kafka event streaming",
                      "Designed multi-tenant PostgreSQL schema with zero downtime",
                    ]).map((claim, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-[#14121e] border border-[#1f1c2b] text-xs text-zinc-300 flex items-start gap-2"
                      >
                        <span className="font-mono text-indigo-400 font-bold text-[11px]">
                          [{idx + 1}]
                        </span>
                        <span className="leading-relaxed">&ldquo;{claim}&rdquo;</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* ── Bottom Meeting Action Controls Toolbar (Google Meet Style) ─────── */}
      <footer className="h-20 bg-[#0c0b12] border-t border-[#1f1c2b] px-4 flex items-center justify-between shrink-0 z-30">
        {/* Left info: Time & Room Code */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="font-mono text-xs text-zinc-400">
            {formatTime(meetingSeconds)} • meet-rs-eval
          </div>
        </div>

        {/* Center: Google Meet Circular Action Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 mx-auto">
          {/* Main Join / Call Toggle Button if not started */}
          {!isCallActive ? (
            <button
              onClick={() => startInterview(profile)}
              disabled={isConnecting}
              className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-mono text-sm font-bold shadow-lg shadow-emerald-950/40 border border-emerald-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Connecting to Audio Chamber...</span>
                </>
              ) : (
                <>
                  <PhoneCall className="w-4 h-4" />
                  <span>Join AI Interview</span>
                </>
              )}
            </button>
          ) : (
            <>
              {/* Mic Toggle Button */}
              <button
                onClick={() => setIsMicMuted(!isMicMuted)}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
                  isMicMuted
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-[#181624] hover:bg-[#221e33] text-zinc-200 border border-[#262335]"
                }`}
                title={isMicMuted ? "Unmute microphone" : "Mute microphone"}
              >
                {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Camera Toggle Button */}
              <button
                onClick={toggleCamera}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
                  !isCameraOn
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-[#181624] hover:bg-[#221e33] text-zinc-200 border border-[#262335]"
                }`}
                title={isCameraOn ? "Turn off camera" : "Turn on camera"}
              >
                {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              {/* Subtitles (CC) Toggle Button */}
              <button
                onClick={() => setShowCaptions(!showCaptions)}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
                  showCaptions
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-950/40"
                    : "bg-[#181624] hover:bg-[#221e33] text-zinc-400 border border-[#262335]"
                }`}
                title={showCaptions ? "Hide captions" : "Show captions"}
              >
                <Subtitles className="w-5 h-5" />
              </button>

              {/* Red End Call Button */}
              <button
                onClick={handleEndCall}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold shadow-lg shadow-red-950/50 transition-all hover:scale-105 active:scale-95 cursor-pointer ml-2"
                title="End interview session"
              >
                <PhoneOff className="w-4 h-4" />
                <span className="hidden sm:inline">End Call</span>
              </button>
            </>
          )}
        </div>

        {/* Right: Drawer toggles for Transcript & Scope */}
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setActiveSidePanel(activeSidePanel === "transcript" ? null : "transcript")
            }
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer relative ${
              activeSidePanel === "transcript"
                ? "bg-[#181624] border-[#2e2842] text-white"
                : "bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-white/[0.06]"
            }`}
            title="Toggle Live Transcript Chat"
          >
            <MessageSquare className="w-4 h-4" />
            {transcript.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-500 text-white font-mono text-[9px] font-bold flex items-center justify-center">
                {transcript.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSidePanel(activeSidePanel === "scope" ? null : "scope")}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
              activeSidePanel === "scope"
                ? "bg-[#181624] border-[#2e2842] text-white"
                : "bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-white/[0.06]"
            }`}
            title="Toggle Evaluation Scope & Claims"
          >
            <FileText className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
