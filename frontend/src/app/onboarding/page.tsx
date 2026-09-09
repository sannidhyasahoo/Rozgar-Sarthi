"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppAuth } from "@/components/auth/AuthProvider";
import { TechnicalRole } from "@/lib/types";
import { ROLE_PROFILES } from "@/lib/mock-data";
import { saveStoredProfile } from "@/lib/storage";
import { CompetencyRadar } from "@/components/interview/CompetencyRadar";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Server,
  Cpu,
  Layers,
  Layout,
  Database,
  Terminal,
  User,
  Sparkles,
  ShieldCheck,
  Zap,
  Target,
  FileCheck2,
  RefreshCw,
  Loader2,
} from "lucide-react";

const SENIORITY_TIERS = [
  { years: 0, label: "0-1y", title: "Fresher / Intern", desc: "Core algorithms, CS fundamentals & syntactical hygiene" },
  { years: 2, label: "1-2y", title: "Associate", desc: "Feature delivery, clean code patterns & API contracts" },
  { years: 4, label: "3-5y", title: "Mid-Level", desc: "Concurrency, DB indexing, microservices & latency bounds" },
  { years: 7, label: "6-8y", title: "Senior", desc: "Architecture trade-offs, fault tolerance & distributed scalability" },
  { years: 10, label: "9+y", title: "Staff / Principal", desc: "High-scale consensus, organizational impact & system resiliency" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, setProfile } = useAppAuth();

  const [name, setName] = useState(profile.name || "Alex Dev");
  const [selectedRole, setSelectedRole] = useState<TechnicalRole>(
    (profile.targetRole as TechnicalRole) || "Backend Engineer"
  );
  const [experienceYears, setExperienceYears] = useState<number>(profile.experienceYears ?? 4);
  const [, setResumeFile] = useState<File | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string>(
    profile.resumeName || "alex_senior_backend_resume.pdf"
  );
  const [isDragging, setIsDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsedClaims, setParsedClaims] = useState<string[]>(
    profile.keyClaims && profile.keyClaims.length > 0
      ? profile.keyClaims
      : [
          "Reduced API p99 latency by 45% through Redis caching & query restructuring",
          "Migrated monolithic ingestion to Kafka event stream handling 50k events/sec",
          "Designed multi-tenant PostgreSQL schema with zero downtime migrations",
        ]
  );
  const [saving, setSaving] = useState(false);

  const roleIcons: Record<TechnicalRole, React.ReactNode> = {
    "Backend Engineer": <Server className="w-5 h-5 text-indigo-600 stroke-[1.8]" />,
    "AI/ML Systems Engineer": <Cpu className="w-5 h-5 text-violet-600 stroke-[1.8]" />,
    "Distributed Systems & SRE": <Terminal className="w-5 h-5 text-amber-600 stroke-[1.8]" />,
    "Frontend Architect": <Layout className="w-5 h-5 text-emerald-600 stroke-[1.8]" />,
    "Fullstack Platform Engineer": <Layers className="w-5 h-5 text-blue-600 stroke-[1.8]" />,
    "Data Systems Engineer": <Database className="w-5 h-5 text-rose-600 stroke-[1.8]" />,
  };

  const currentRoleData = ROLE_PROFILES[selectedRole] || ROLE_PROFILES["Backend Engineer"];

  const handleFileUpload = async (file: File) => {
    setResumeFile(file);
    setResumeFileName(file.name);
    setParsing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:8000/api/upload-resume", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.status === "success" && data.profile) {
        setProfile({
          ...profile,
          experience: data.profile.experience,
          projects: data.profile.projects,
        });
        setParsedClaims([
          `Extracted ${data.profile.experience?.length || 0} roles and ${data.profile.projects?.length || 0} projects`,
          "Ready for personalized interview kickoff",
        ]);
      } else {
        console.error("Failed to parse resume", data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const baseProfile = ROLE_PROFILES[selectedRole];

    const updated = saveStoredProfile({
      name,
      targetRole: selectedRole,
      experienceYears,
      resumeName: resumeFileName || `${name.toLowerCase().replace(" ", "_")}_resume.pdf`,
      skills: baseProfile.focusAreas,
      experience: profile.experience,
      projects: profile.projects,
      keyClaims:
        parsedClaims.length > 0
          ? parsedClaims
          : [
              `Architected resilient ${selectedRole} services with latency SLAs`,
              `Led cross-functional performance and scalability improvements`,
            ],
      competencies: baseProfile.baselineCompetencies,
    });

    setProfile(updated);

    setTimeout(() => {
      router.push("/dashboard");
    }, 500);
  };

  const activeSeniority =
    SENIORITY_TIERS.find((t) => experienceYears <= t.years) ||
    SENIORITY_TIERS[SENIORITY_TIERS.length - 1];

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#08070c] text-zinc-900 dark:text-zinc-100 pb-24 transition-colors duration-200">
      {/* ── Sub Navigation Bar ────────────────────────────────────────── */}
      <div className="border-b border-zinc-200 dark:border-[#1f1c2b] bg-white/80 dark:bg-[#0e0d14]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-50 dark:bg-[#12111a] hover:bg-zinc-100 dark:hover:bg-[#181622] border border-zinc-200 dark:border-[#1f1c2b] transition-colors shadow-2xs group"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-zinc-500 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Dashboard</span>
            </Link>

            <div className="h-4 w-px bg-zinc-200 dark:bg-[#1f1c2b] hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-mono font-medium text-zinc-600 dark:text-zinc-400">
                Live Calibrator Active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleComplete}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-zinc-900 dark:bg-indigo-600 hover:bg-zinc-800 dark:hover:bg-indigo-500 text-white text-xs font-mono font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synchronizing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Save & Apply Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* ── Page Title & Hero Header ──────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-[#1f1c2b]">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/40 text-indigo-700 dark:text-indigo-300 text-[11px] font-mono font-semibold mb-2">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>CANDIDATE INTELLIGENCE & ROLE SETUP</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Candidate Profile & Role Calibration
            </h1>
            <p className="text-sm text-zinc-500 dark:text-[#9e98b7] mt-1 max-w-2xl leading-relaxed">
              Fine-tune your technical role identity, seniority tier, and verified resume credentials. 
              The Bayesian evaluation engine dynamically adapts question depth and AST analysis in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 bg-white dark:bg-[#12111a] p-2.5 rounded-2xl border border-zinc-200 dark:border-[#1f1c2b] shadow-2xs self-start md:self-auto">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-violet-950 dark:border dark:border-violet-700 text-white font-mono font-bold text-sm flex items-center justify-center shadow-xs">
              {name.slice(0, 2).toUpperCase() || "CA"}
            </div>
            <div className="pr-2">
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{name || "Candidate"}</div>
              <div className="text-[11px] font-mono text-zinc-500 dark:text-[#9e98b7] flex items-center gap-1.5">
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{selectedRole}</span>
                <span>•</span>
                <span>{experienceYears} YOE</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2-Column Responsive Bento Grid ───────────────────────────────── */}
        <form onSubmit={handleComplete} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── Left Column (7 cols): Identity & Role Track ───────────────── */}
          <div className="lg:col-span-7 space-y-6">
            {/* Card 1: Identity & Seniority */}
            <div className="bg-white dark:bg-[#12111a] rounded-2xl border border-zinc-200/90 dark:border-[#1f1c2b] shadow-2xs p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-[#1f1c2b] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-mono text-xs font-bold">
                    01
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase font-mono tracking-wider">
                      Candidate Identity & Seniority
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-[#9e98b7]">Your profile handle and interview calibration level</p>
                  </div>
                </div>
                <User className="w-4 h-4 text-zinc-400" />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-700 dark:text-zinc-300 font-semibold mb-1.5 uppercase tracking-wider">
                    Full Legal Name / Pseudonym
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Dev"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-[#262335] bg-zinc-50/50 dark:bg-[#181622] hover:bg-white dark:hover:bg-[#1e1b2c] focus:bg-white dark:focus:bg-[#1e1b2c] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-mono text-zinc-700 dark:text-zinc-300 font-semibold uppercase tracking-wider">
                      Engineering Experience Tier
                    </label>
                    <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-800/60">
                      {experienceYears} Years ({activeSeniority.title})
                    </span>
                  </div>

                  {/* Visual Seniority Tier Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {SENIORITY_TIERS.map((tier) => {
                      const isSelected = experienceYears === tier.years;
                      return (
                        <button
                          type="button"
                          key={tier.label}
                          onClick={() => setExperienceYears(tier.years)}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                            isSelected
                              ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/70 ring-2 ring-indigo-500/20 shadow-xs"
                              : "border-zinc-200 dark:border-[#1f1c2b] hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-[#12111a] hover:bg-white dark:hover:bg-[#181622]"
                          }`}
                        >
                          <div
                            className={`text-xs font-mono font-bold ${
                              isSelected
                                ? "text-indigo-700 dark:text-indigo-300"
                                : "text-zinc-800 dark:text-zinc-200"
                            }`}
                          >
                            {tier.label}
                          </div>
                          <div
                            className={`text-[10px] truncate mt-0.5 ${
                              isSelected
                                ? "text-indigo-600/90 dark:text-indigo-400"
                                : "text-zinc-500 dark:text-zinc-400"
                            }`}
                          >
                            {tier.title}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3 p-3 rounded-xl bg-zinc-50 dark:bg-[#12111a] border border-zinc-200/80 dark:border-[#1f1c2b] flex items-start gap-2.5">
                    <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-zinc-600 dark:text-[#9e98b7] leading-relaxed font-mono">
                      <strong className="text-zinc-900 dark:text-white">Sentry Calibration:</strong> {activeSeniority.desc}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Technical Job Track Selection */}
            <div className="bg-white dark:bg-[#12111a] rounded-2xl border border-zinc-200/90 dark:border-[#1f1c2b] shadow-2xs p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-[#1f1c2b] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-mono text-xs font-bold">
                    02
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase font-mono tracking-wider">
                      Target Engineering Track
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-[#9e98b7]">Select the domain for live AI interview probes & coding tasks</p>
                  </div>
                </div>
                <Target className="w-4 h-4 text-zinc-400" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {(Object.keys(ROLE_PROFILES) as TechnicalRole[]).map((roleKey) => {
                  const isSelected = selectedRole === roleKey;
                  const profileInfo = ROLE_PROFILES[roleKey];

                  return (
                    <button
                      type="button"
                      key={roleKey}
                      onClick={() => setSelectedRole(roleKey)}
                      className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer relative group ${
                        isSelected
                          ? "border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/40 shadow-xs"
                          : "border-zinc-200 dark:border-[#1f1c2b] hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50/60 dark:hover:bg-[#181622] bg-white dark:bg-[#151320]"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <div
                            className={`p-2 rounded-xl border transition-colors ${
                              isSelected
                                ? "bg-white dark:bg-[#1c192d] border-indigo-200 dark:border-indigo-700/60 shadow-xs"
                                : "bg-zinc-50 dark:bg-[#1a1726] border-zinc-200 dark:border-[#221e33] group-hover:bg-white dark:group-hover:bg-[#201d30]"
                            }`}
                          >
                            {roleIcons[roleKey]}
                          </div>
                          {isSelected ? (
                            <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-[#1c192d] px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-700/60 shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                              Active
                            </span>
                          ) : (
                            <span className="text-[11px] font-mono text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              Select
                            </span>
                          )}
                        </div>

                        <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                          {roleKey}
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-[#9e98b7] line-clamp-2 leading-relaxed">
                          {profileInfo.tagline}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-zinc-200/70 dark:border-[#1f1c2b] flex flex-wrap gap-1">
                        {profileInfo.focusAreas.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded transition-colors ${
                              isSelected
                                ? "bg-indigo-100/70 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60"
                                : "bg-zinc-100 dark:bg-[#181622] text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-[#1f1c2b]"
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Card 3: Sample Live Probes Preview */}
            <div className="bg-[#14121c] text-zinc-300 rounded-2xl p-5 border border-zinc-800 dark:border-[#1f1c2b] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono font-semibold text-zinc-200 uppercase tracking-wider">
                    Sentry Engine Diagnostic Questions ({selectedRole})
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">Live Preview</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                During your real-time dialogue round, the conversational sentry will probe deep into scenarios such as:
              </p>
              <div className="space-y-2 pt-1">
                {currentRoleData.sampleQuestions.map((q, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 text-xs text-zinc-200 font-mono">
                    <span className="text-emerald-400 font-bold shrink-0">[{idx + 1}]</span>
                    <span className="leading-relaxed">&ldquo;{q}&rdquo;</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right Column (5 cols): Live Radar & Resume Intelligence ───── */}
          <div className="lg:col-span-5 space-y-6">
            {/* Card 4: Dynamic Competency Radar */}
            <div className="bg-white dark:bg-[#12111a] rounded-2xl border border-zinc-200/90 dark:border-[#1f1c2b] shadow-2xs p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-[#1f1c2b] pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase font-mono tracking-wider">
                    Bayesian Competency Target
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-zinc-500 dark:text-[#9e98b7] font-medium">5-Axis Baseline</span>
              </div>

              <p className="text-xs text-zinc-500 dark:text-[#9e98b7] leading-relaxed">
                Target competency baseline for <strong className="text-zinc-800 dark:text-zinc-200">{selectedRole}</strong>. 
                Your actual responses during voice dialogue and Monaco coding will dynamically reshape this radar.
              </p>

              {/* Radar Component */}
              <div className="py-2 flex justify-center">
                <CompetencyRadar
                  competencies={currentRoleData.baselineCompetencies}
                  size={240}
                  showLabels={true}
                />
              </div>

              {/* Metric Breakdown Table */}
              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-[#1f1c2b] font-mono text-xs">
                {Object.entries(currentRoleData.baselineCompetencies).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400 capitalize">
                      {key.replace(/_/g, " ")}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-zinc-100 dark:bg-[#1e1b2c] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${Math.round(val * 100)}%` }}
                        />
                      </div>
                      <span className="text-zinc-900 dark:text-zinc-100 font-bold w-9 text-right">
                        {Math.round(val * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 5: Resume & Claim Verification */}
            <div className="bg-white dark:bg-[#12111a] rounded-2xl border border-zinc-200/90 dark:border-[#1f1c2b] shadow-2xs p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-[#1f1c2b] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-mono text-xs font-bold">
                    03
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase font-mono tracking-wider">
                      Resume & Claim Verification
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-[#9e98b7]">Sentry cross-examination source</p>
                  </div>
                </div>
                <FileText className="w-4 h-4 text-zinc-400" />
              </div>

              {/* Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                  isDragging
                    ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40"
                    : resumeFileName
                    ? "border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/20 hover:bg-emerald-50/50"
                    : "border-zinc-300 dark:border-[#262335] hover:border-zinc-400 dark:hover:border-zinc-600 bg-zinc-50/50 dark:bg-[#161422]"
                }`}
                onClick={() => {
                  const el = document.getElementById("resume-upload-input");
                  if (el) el.click();
                }}
              >
                <input
                  id="resume-upload-input"
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />

                {parsing ? (
                  <div className="flex flex-col items-center justify-center py-4 space-y-2">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span className="font-mono text-xs text-zinc-600 font-medium">
                      Parsing technical claims with AST extractor...
                    </span>
                  </div>
                ) : resumeFileName ? (
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                      <FileCheck2 className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div className="font-bold text-xs text-zinc-900 font-mono truncate max-w-[240px]">
                      {resumeFileName}
                    </div>
                    <p className="text-[11px] text-emerald-700 font-mono font-semibold">
                      ✓ Verified & Synchronized
                    </p>
                    <span className="text-[10px] text-zinc-400 underline hover:text-zinc-700 transition-colors">
                      Click or drop file to replace
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2.5">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-500">
                      <UploadCloud className="w-5 h-5 stroke-[1.8]" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-zinc-800 block">
                        Drop resume here, or <span className="text-indigo-600">browse files</span>
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        PDF, DOCX, or TXT (Max 10MB)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Extracted Claims Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider">
                  <span>Extracted Verifiable Claims ({parsedClaims.length})</span>
                  <span className="text-indigo-600 font-semibold">Sentry Armed</span>
                </div>

                <div className="space-y-1.5">
                  {parsedClaims.map((claim, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-zinc-50 dark:bg-[#161422] border border-zinc-200/80 dark:border-[#1f1c2b] text-xs text-zinc-700 dark:text-zinc-200 flex items-start gap-2 leading-relaxed"
                    >
                      <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold text-[11px] shrink-0">
                        [{String(idx + 1).padStart(2, "0")}]
                      </span>
                      <span>&ldquo;{claim}&rdquo;</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Save Button CTA */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-800 text-white shadow-md space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Ready to Launch Assessment?</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Saving updates your candidate profile across the AI Interview Chamber, Coding IDE, and Diagnostic Reports.
              </p>
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Applying Profile Calibration...</span>
                  </>
                ) : (
                  <>
                    <span>Save & Return to Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
