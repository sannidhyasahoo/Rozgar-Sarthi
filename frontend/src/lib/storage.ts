import { CandidateProfile, SessionInsights, TechnicalRole } from "./types";

const STORAGE_KEYS = {
  PROFILE: "rozgar_candidate_profile",
  RECENT_SESSIONS: "rozgar_recent_sessions",
  CURRENT_INTERVIEW_STATE: "rozgar_active_interview",
  CODING_DRAFT: "rozgar_coding_draft",
  CLERK_MOCK_USER: "rozgar_mock_user",
};

export const DEFAULT_PROFILE: CandidateProfile = {
  name: "Alex Dev",
  email: "alex@developer.io",
  targetRole: "Backend Engineer",
  experienceYears: 4,
  resumeName: "alex_senior_backend_resume.pdf",
  resumeSummary:
    "Experienced backend engineer specializing in distributed systems, high-throughput microservices in Go & Python, and PostgreSQL query optimization. Led latency reduction initiatives and asynchronous pipeline re-architectures.",
  skills: [
    "Go",
    "Python",
    "PostgreSQL",
    "Redis",
    "Kafka",
    "Distributed Systems",
    "Docker",
    "Kubernetes",
    "gRPC",
  ],
  keyClaims: [
    "Reduced API p99 latency by 45% through Redis caching & query restructuring",
    "Migrated monolithic ingestion to Kafka event stream handling 50k events/sec",
    "Designed multi-tenant PostgreSQL schema with zero downtime migrations",
  ],
  competencies: {
    technical_depth: 0.74,
    system_design: 0.68,
    problem_solving: 0.81,
    communication_clarity: 0.70,
    ownership_specificity: 0.65,
  },
  createdAt: new Date().toISOString(),
};

export function getStoredProfile(): CandidateProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!data) return DEFAULT_PROFILE;
    return JSON.parse(data) as CandidateProfile;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveStoredProfile(profile: Partial<CandidateProfile>): CandidateProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const current = getStoredProfile();
    const updated: CandidateProfile = {
      ...current,
      ...profile,
      competencies: {
        ...current.competencies,
        ...(profile.competencies || {}),
      },
    };
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error("Failed to save profile to localStorage", err);
    return DEFAULT_PROFILE;
  }
}

export function getStoredSessions(): SessionInsights[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RECENT_SESSIONS);
    if (!data) return [];
    return JSON.parse(data) as SessionInsights[];
  } catch {
    return [];
  }
}

export function saveSessionToHistory(session: SessionInsights): void {
  if (typeof window === "undefined") return;
  try {
    const sessions = getStoredSessions();
    const existingIndex = sessions.findIndex((s) => s.session_id === session.session_id);
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.unshift(session);
    }
    // Keep max 15 sessions in history
    localStorage.setItem(STORAGE_KEYS.RECENT_SESSIONS, JSON.stringify(sessions.slice(0, 15)));
  } catch (err) {
    console.error("Failed to save session to history", err);
  }
}

export function getSessionById(id: string): SessionInsights | null {
  const sessions = getStoredSessions();
  return sessions.find((s) => s.session_id === id) || null;
}

export function parseResumeMock(fileName: string, fileText?: string): Partial<CandidateProfile> {
  // Extract realistic candidate profile from file name and content
  const lower = (fileName + " " + (fileText || "")).toLowerCase();
  
  let detectedRole: TechnicalRole = "Backend Engineer";
  if (lower.includes("ai") || lower.includes("ml") || lower.includes("llm") || lower.includes("machine learning")) {
    detectedRole = "AI/ML Systems Engineer";
  } else if (lower.includes("sre") || lower.includes("devops") || lower.includes("infrastructure") || lower.includes("distributed")) {
    detectedRole = "Distributed Systems & SRE";
  } else if (lower.includes("frontend") || lower.includes("react") || lower.includes("ui")) {
    detectedRole = "Frontend Architect";
  } else if (lower.includes("data") || lower.includes("spark") || lower.includes("pipeline")) {
    detectedRole = "Data Systems Engineer";
  } else if (lower.includes("fullstack") || lower.includes("node")) {
    detectedRole = "Fullstack Platform Engineer";
  }

  const generatedClaims = [
    `Architected high-throughput services with automated fallback and circuit breaking`,
    `Designed scalable database schema with zero-downtime schema migrations`,
    `Optimized critical path performance and reduced system latency`,
  ];

  return {
    resumeName: fileName,
    targetRole: detectedRole,
    experienceYears: 3,
    resumeSummary: `Parsed candidate dossier from ${fileName}. Highlighted focus on ${detectedRole} workflows, API design, performance telemetry, and resilient cloud architecture.`,
    skills: ["System Architecture", "Performance Tuning", "API Protocols", "Async Pipelines", "Observability"],
    keyClaims: generatedClaims,
    competencies: {
      technical_depth: 0.65,
      system_design: 0.60,
      problem_solving: 0.70,
      communication_clarity: 0.68,
      ownership_specificity: 0.58,
    },
  };
}
