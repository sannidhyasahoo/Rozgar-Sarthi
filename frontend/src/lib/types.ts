export interface CompetencyVector {
  technical_depth: number;
  system_design: number;
  problem_solving: number;
  communication_clarity: number;
  ownership_specificity: number;
}

export type EvidenceSignal = "substantiated" | "unsubstantiated" | "contradictory" | "probing";

export interface EvidenceItem {
  turn_id: number;
  competency: string;
  quote: string;
  signal: EvidenceSignal;
  observation: string;
  timestamp?: string;
  pressure_level?: number;
}

export interface CandidateProfile {
  name: string;
  email?: string;
  targetRole: TechnicalRole;
  experienceYears: number;
  resumeName?: string;
  resumeSummary?: string;
  skills: string[];
  keyClaims: string[];
  competencies: CompetencyVector;
  createdAt: string;
}

export type TechnicalRole =
  | "Backend Engineer"
  | "AI/ML Systems Engineer"
  | "Distributed Systems & SRE"
  | "Frontend Architect"
  | "Fullstack Platform Engineer"
  | "Data Systems Engineer";

export type PressureLevel = 1 | 2 | 3 | 4 | 5;

export interface PressureDescriptor {
  level: PressureLevel;
  name: string;
  tag: string;
  description: string;
  badgeColor: string;
}

export const PRESSURE_LEVELS: Record<PressureLevel, PressureDescriptor> = {
  1: {
    level: 1,
    name: "Normal Exploration",
    tag: "LEVEL 1",
    description: "Open exploration of background, architecture, and baseline problem approach.",
    badgeColor: "text-zinc-600 border-zinc-200 bg-zinc-100",
  },
  2: {
    level: 2,
    name: "Clarification Probe",
    tag: "LEVEL 2",
    description: "Probing for technical ambiguity, component boundaries, and specific tools used.",
    badgeColor: "text-cobalt border-cobalt/30 bg-cobalt/10",
  },
  3: {
    level: 3,
    name: "Evidence & Metric Request",
    tag: "LEVEL 3",
    description: "Demand for concrete before/after benchmarks, measurement methodology, and baselines.",
    badgeColor: "text-sprout border-sprout/30 bg-sprout/10",
  },
  4: {
    level: 4,
    name: "Challenge Assumption",
    tag: "LEVEL 4",
    description: "Stress-testing architectural decisions, single points of failure, and bottleneck trade-offs.",
    badgeColor: "text-coral border-coral/30 bg-coral/10",
  },
  5: {
    level: 5,
    name: "Counterexample & Edge Case",
    tag: "LEVEL 5",
    description: "Injecting high concurrency, network partitions, or pathological edge cases to observe reasoning.",
    badgeColor: "text-crimson border-crimson/30 bg-crimson/10",
  },
};

export interface TurnTelemetry {
  turn_id: number;
  pressure_level: PressureLevel;
  probed_competency: string;
  evaluation_signal: EvidenceSignal;
  extracted_claims: string[];
  latency_ms: number;
  missing_concepts?: string[];
  observed_strengths?: string[];
  reasoning_probe?: string;
}

export interface InterviewMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  telemetry?: TurnTelemetry;
}

export interface CodingChallenge {
  id: string;
  title: string;
  difficulty: "Medium" | "Hard" | "Staff-Level";
  track: TechnicalRole;
  timeLimitMinutes: number;
  description: string;
  constraints: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  starterCode: {
    python: string;
    typescript: string;
    go: string;
  };
  testCases: {
    input: string;
    expected: string;
    hidden?: boolean;
  }[];
  counterExamples: {
    title: string;
    scenario: string;
    probeQuestion: string;
  }[];
}

export interface ReasoningTrajectoryStep {
  id: string;
  phase: "approach" | "complexity" | "implementation" | "test_execution" | "debugging" | "counter_example_probe";
  title: string;
  content: string;
  timestamp: string;
  status: "success" | "warning" | "error" | "info";
  evidenceNote?: string;
}

export interface SessionInsights {
  session_id: string;
  candidate_name?: string;
  target_role?: string;
  last_updated: string;
  duration_minutes?: number;
  overall_score?: number;
  competencies: CompetencyVector;
  evidence_log: EvidenceItem[];
  identified_strengths: string[];
  areas_for_improvement: string[];
  actionable_tips: string[];
  reasoning_trajectory?: ReasoningTrajectoryStep[];
}

export interface BackendQuestion {
  id: string;
  title: string;
  topic: string;
  difficulty: string;
  prompt: string;
  starter_code: {
    python?: string;
    typescript?: string;
    go?: string;
    [key: string]: string | undefined;
  };
  test_cases: {
    input: string;
    expected: string;
  }[];
}

export interface BackendTestCaseResult {
  test_case_id: number | string;
  passed: boolean;
  runtime_ms: number;
  memory_kb?: number;
  input?: string;
  expected?: string;
  actual?: string;
  error?: string | null;
}

export interface BackendSubmitResponse {
  question_id: string;
  passed: boolean;
  test_results: BackendTestCaseResult[];
  complexity: {
    estimated_time_complexity: string;
    estimated_space_complexity: string;
    confidence: number;
    reasoning: string;
  };
  decision: {
    decision: "next_question" | "add_complexity" | "retry_with_hints";
    reasoning: string;
    next_action_detail?: string | null;
  };
  ast_summary?: {
    loop_count: number;
    max_nesting_depth: number;
    has_recursion: boolean;
    recursive_calls: string[];
    data_structures: {
      list: boolean;
      dict: boolean;
      set: boolean;
    };
    parser_used: string;
  };
  candidate_state?: {
    topic_competency?: Record<string, number>;
    solved_count?: number;
    strengths?: string[];
    weaknesses?: string[];
  };
  stdout?: string | null;
  stderr?: string | null;
}

