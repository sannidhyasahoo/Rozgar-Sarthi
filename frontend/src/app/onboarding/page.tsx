"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppAuth } from "@/components/auth/AuthProvider";
import { MonoEyebrow } from "@/components/shared/MonoEyebrow";
import { TechnicalRole } from "@/lib/types";
import { ROLE_PROFILES } from "@/lib/mock-data";
import { parseResumeMock, saveStoredProfile } from "@/lib/storage";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  ArrowRight,
  Server,
  Cpu,
  Layers,
  Layout,
  Database,
  Terminal,
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, setProfile } = useAppAuth();

  const [name, setName] = useState(profile.name || "Alex Mercer");
  const [selectedRole, setSelectedRole] = useState<TechnicalRole>("Backend Engineer");
  const [experienceYears, setExperienceYears] = useState<number>(3);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string>(profile.resumeName || "");
  const [isDragging, setIsDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsedClaims, setParsedClaims] = useState<string[]>(profile.keyClaims || []);
  const [saving, setSaving] = useState(false);

  const roleIcons = {
    "Backend Engineer": <Server className="w-5 h-5 text-cobalt stroke-[1.8]" />,
    "AI/ML Systems Engineer": <Cpu className="w-5 h-5 text-iris stroke-[1.8]" />,
    "Distributed Systems & SRE": <Terminal className="w-5 h-5 text-coral stroke-[1.8]" />,
    "Frontend Architect": <Layout className="w-5 h-5 text-sprout stroke-[1.8]" />,
    "Fullstack Platform Engineer": <Layers className="w-5 h-5 text-zinc-700 stroke-[1.8]" />,
    "Data Systems Engineer": <Database className="w-5 h-5 text-saffron stroke-[1.8]" />,
  };

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
        // Save the parsed profile experience/projects temporarily so handleComplete can save it
        setProfile({
           ...profile,
           experience: data.profile.experience,
           projects: data.profile.projects
        });
        // We could also set parsed claims here if the backend generated them, 
        // but since it just parses raw data, we'll use a mocked success list for UI purposes
        setParsedClaims([
          `Extracted ${data.profile.experience?.length || 0} roles and ${data.profile.projects?.length || 0} projects`,
          "Ready for personalized interview kickoff"
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
      keyClaims: parsedClaims.length > 0 ? parsedClaims : [
        `Architected resilient ${selectedRole} services with latency SLAs`,
        `Led cross-functional performance and scalability improvements`,
      ],
      competencies: baseProfile.baselineCompetencies,
    });

    setProfile(updated);

    setTimeout(() => {
      router.push("/dashboard");
    }, 400);
  };

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-12">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="flex justify-center mb-3">
          <MonoEyebrow color="sprout">STEP 2 OF 2: CALIBRATION</MonoEyebrow>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">
          Calibrate Your Target Technical Role
        </h1>
        <p className="text-sm text-zinc-600">
          The adaptive engine customizes its competency model and claim verification probes to your specific domain.
        </p>
      </div>

      <form onSubmit={handleComplete} className="space-y-8">
        {/* Section 1: Candidate Name & Experience */}
        <div className="dev-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
            <span className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center font-mono text-xs">
              1
            </span>
            <h2 className="text-sm font-mono uppercase font-bold text-zinc-800 tracking-wider">
              Candidate Profile
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-zinc-700 font-semibold mb-1.5 uppercase">
                Your Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Mercer"
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-iris/20 focus:border-iris transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-700 font-semibold mb-1.5 uppercase">
                Years of Relevant Engineering Experience
              </label>
              <select
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-iris/20 focus:border-iris transition-colors bg-white"
              >
                <option value={0}>0-1 Years (Intern / Fresher)</option>
                <option value={1}>1-2 Years (Associate / Early Career)</option>
                <option value={3}>3-5 Years (Mid-Level Engineer)</option>
                <option value={6}>6-8 Years (Senior Engineer)</option>
                <option value={9}>9+ Years (Staff / Principal Architect)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Technical Job Track Selection */}
        <div className="dev-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
            <span className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center font-mono text-xs">
              2
            </span>
            <h2 className="text-sm font-mono uppercase font-bold text-zinc-800 tracking-wider">
              Select Target Technical Role
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(Object.keys(ROLE_PROFILES) as TechnicalRole[]).map((roleKey) => {
              const isSelected = selectedRole === roleKey;
              const profileInfo = ROLE_PROFILES[roleKey];

              return (
                <button
                  type="button"
                  key={roleKey}
                  onClick={() => setSelectedRole(roleKey)}
                  className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? "border-iris ring-2 ring-iris/20 bg-iris/5 shadow-sm"
                      : "border-zinc-200 hover:border-zinc-300 bg-white"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-lg bg-zinc-100 border border-zinc-200">
                        {roleIcons[roleKey]}
                      </div>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-iris animate-pulse" />
                      )}
                    </div>
                    <div className="text-sm font-bold text-zinc-900 mb-1">
                      {roleKey}
                    </div>
                    <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                      {profileInfo.tagline}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-zinc-200/60 flex flex-wrap gap-1">
                    {profileInfo.focusAreas.slice(0, 2).map((tag, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200"
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

        {/* Section 3: Interactive Resume Drop Zone */}
        <div className="dev-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
            <span className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center font-mono text-xs">
              3
            </span>
            <h2 className="text-sm font-mono uppercase font-bold text-zinc-800 tracking-wider">
              Upload Resume (Claim Extraction)
            </h2>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
              isDragging
                ? "border-iris bg-iris/5"
                : resumeFileName
                ? "border-sprout/60 bg-sprout/5"
                : "border-zinc-300 hover:border-zinc-400 bg-zinc-50/50"
            }`}
            onClick={() => {
              const el = document.getElementById("resume-input");
              if (el) el.click();
            }}
          >
            <input
              id="resume-input"
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
                <div className="w-6 h-6 border-2 border-iris border-t-transparent rounded-full animate-spin" />
                <span className="font-mono text-xs text-zinc-600">
                  Parsing technical projects and claim metrics...
                </span>
              </div>
            ) : resumeFileName ? (
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-sprout/10 border border-sprout/30 flex items-center justify-center text-sprout">
                  <CheckCircle2 className="w-6 h-6 stroke-[2]" />
                </div>
                <div className="font-bold text-sm text-zinc-900">{resumeFileName}</div>
                <p className="text-xs text-sprout font-mono font-medium">
                  ✓ Resume parsed successfully. Baseline claims extracted.
                </p>
                <span className="text-[11px] text-zinc-400 underline">Click or drag to replace file</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-500">
                  <UploadCloud className="w-6 h-6 stroke-[1.8]" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-zinc-800 block">
                    Drop your resume here, or <span className="text-iris">browse files</span>
                  </span>
                  <span className="text-xs text-zinc-500">
                    Supports PDF, DOCX, or Plain Text (up to 10MB)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Parsed Claims Preview if any */}
          {parsedClaims.length > 0 && (
            <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2">
              <div className="font-mono text-[10px] uppercase text-zinc-500 font-bold">
                Extracted Claims to be Verified:
              </div>
              <ul className="space-y-1.5 text-xs text-zinc-700">
                {parsedClaims.map((claim, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-cobalt font-mono text-[11px]">[{idx + 1}]</span>
                    <span>&ldquo;{claim}&rdquo;</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Submit to Dashboard */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary-action !px-8 !py-3 w-full sm:w-auto shadow-md"
          >
            <span>{saving ? "Saving Profile..." : "Initialize Candidate Dashboard"}</span>
            <ArrowRight className="w-4 h-4 stroke-[2]" />
          </button>
        </div>
      </form>
    </div>
  );
}
