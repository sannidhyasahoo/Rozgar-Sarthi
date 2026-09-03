// src/lib/codingApi.ts
// Typed API client for the adaptive coding assessment endpoints.

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export interface CodingProblem {
  id: string;
  title: string;
  difficulty: number;
  difficultyLabel: string;
  topics: string[];
  skills: string[];
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  starterCode: { python: string; javascript: string; cpp: string };
  expectedComplexity: { time: string; space: string };
  estimatedMinutes: number;
  visibleTestCases: { input: Record<string, unknown>; expected: unknown }[];
}

export interface SkillProfile {
  arrays: number;
  strings: number;
  hashmaps: number;
  slidingWindow: number;
  binarySearch: number;
  stacks: number;
  trees: number;
  graphs: number;
  greedy: number;
  recursion: number;
  dynamicProgramming: number;
  complexityAnalysis: number;
  accuracy: number;
  speed: number;
  debugging: number;
  edgeCaseHandling: number;
  efficiency: number;
}

export interface TestDetail {
  index: number;
  passed: boolean;
  got: string;
  expected: string;
  error?: string;
}

export interface ExecutionResult {
  status: "ACCEPTED" | "WRONG_ANSWER" | "TIME_LIMIT" | "MEMORY_LIMIT" | "COMPILE_ERROR" | "RUNTIME_ERROR";
  passedTests: number;
  totalTests: number;
  executionTimeMs: number;
  compileError?: string | null;
  runtimeError?: string | null;
  testDetails: TestDetail[];
  isRunOnly?: boolean;
}

export interface SubmitResult extends ExecutionResult {
  submissionId: string;
  visibleTests: number;
  hiddenTests: number;
  codeAnalysis: {
    estimatedTimeComplexity: string;
    confidence: number;
    signals: string[];
    dataStructures: string[];
    hasRecursion: boolean;
  };
  expectedComplexity: { time: string; space: string };
  skillProfile: SkillProfile;
  attemptNumber: number;
}

export interface AssessmentState {
  assessmentId: string;
  status: "active" | "completed";
  currentQuestionIndex: number;
  totalQuestions: number;
  question: CodingProblem;
  timeLimitMinutes: number;
}

export interface QuestionState {
  question: CodingProblem;
  questionIndex: number;
  totalQuestions: number;
  timeRemainingSeconds: number;
  submissions: {
    attemptNumber: number;
    isRun: boolean;
    submittedAt: string;
    status: string | null;
    passedTests: number;
    totalTests: number;
  }[];
  totalAttempts: number;
}

export interface ReportScores {
  overallScore: number;
  problemSolving: number;
  correctness: number;
  algorithmKnowledge: number;
  efficiency: number;
  debugging: number;
  codeQuality: number;
  problemsSolved: number;
  totalAttempted: number;
}

export interface AssessmentReport {
  assessmentId: string;
  scores: ReportScores;
  skillProfile: SkillProfile;
  areas: { strong: string[]; weak: string[]; uncertain: string[] };
  evidence: {
    questionId: string;
    title: string;
    difficulty: string;
    topics: string[];
    attempts: number;
    finalPassRate: number;
    firstPassRate: number;
    status: string;
    complexity?: { estimated: string; expected: string; confidence: number };
  }[];
  aiNarrative: string | null;
  stats: {
    totalQuestionsAttempted: number;
    hiddenTestPassRate: number;
    timeLimitMinutes: number;
    elapsedSeconds: number;
  };
  confidence: number;
}

// ── API Functions ──────────────────────────────────────────────────────────────

export async function startAssessment(totalQuestions = 7): Promise<AssessmentState> {
  const res = await fetch(`${BACKEND}/api/coding/assessments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ totalQuestions }),
  });
  if (!res.ok) throw new Error(`Failed to start assessment: ${res.status}`);
  return res.json();
}

export async function getQuestion(assessmentId: string): Promise<QuestionState> {
  const res = await fetch(`${BACKEND}/api/coding/assessments/${assessmentId}/question`);
  if (!res.ok) throw new Error(`Failed to get question: ${res.status}`);
  return res.json();
}

export async function runCode(
  assessmentId: string,
  questionId: string,
  language: string,
  code: string
): Promise<ExecutionResult> {
  const res = await fetch(`${BACKEND}/api/coding/assessments/${assessmentId}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ questionId, language, code }),
  });
  if (!res.ok) throw new Error(`Run failed: ${res.status}`);
  return res.json();
}

export async function submitCode(
  assessmentId: string,
  questionId: string,
  language: string,
  code: string
): Promise<SubmitResult> {
  const res = await fetch(`${BACKEND}/api/coding/assessments/${assessmentId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ questionId, language, code }),
  });
  if (!res.ok) throw new Error(`Submit failed: ${res.status}`);
  return res.json();
}

export async function nextQuestion(assessmentId: string): Promise<{
  status: "next" | "completed";
  questionIndex?: number;
  totalQuestions?: number;
  question?: CodingProblem;
  timeRemainingSeconds?: number;
  aiRecommended?: boolean;
  assessmentId?: string;
}> {
  const res = await fetch(`${BACKEND}/api/coding/assessments/${assessmentId}/next`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(`Next question failed: ${res.status}`);
  return res.json();
}

export async function getSkillProfile(assessmentId: string): Promise<SkillProfile> {
  const res = await fetch(`${BACKEND}/api/coding/assessments/${assessmentId}/profile`);
  if (!res.ok) throw new Error(`Profile fetch failed: ${res.status}`);
  return res.json();
}

export async function getReport(assessmentId: string): Promise<AssessmentReport> {
  const res = await fetch(`${BACKEND}/api/coding/assessments/${assessmentId}/report`);
  if (!res.ok) throw new Error(`Report fetch failed: ${res.status}`);
  return res.json();
}

export async function getHint(assessmentId: string, questionId: string): Promise<{ hint: string }> {
  const res = await fetch(
    `${BACKEND}/api/coding/assessments/${assessmentId}/hint?questionId=${questionId}`
  );
  if (!res.ok) throw new Error(`Hint fetch failed: ${res.status}`);
  return res.json();
}

// Format seconds as MM:SS
export function formatTime(seconds: number): string {
  const m = Math.floor(Math.max(0, seconds) / 60)
    .toString()
    .padStart(2, "0");
  const s = (Math.floor(Math.max(0, seconds)) % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export const LANGUAGE_LABELS: Record<string, string> = {
  python: "Python",
  javascript: "JavaScript",
  cpp: "C++",
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "text-emerald-600 bg-emerald-50 border-emerald-200",
  "Easy+": "text-teal-600 bg-teal-50 border-teal-200",
  Medium: "text-amber-600 bg-amber-50 border-amber-200",
  "Medium-Hard": "text-orange-600 bg-orange-50 border-orange-200",
  Hard: "text-red-600 bg-red-50 border-red-200",
};

export const STATUS_META: Record<string, { label: string; color: string }> = {
  ACCEPTED: { label: "Accepted", color: "text-emerald-600" },
  WRONG_ANSWER: { label: "Wrong Answer", color: "text-red-500" },
  TIME_LIMIT: { label: "Time Limit Exceeded", color: "text-amber-600" },
  MEMORY_LIMIT: { label: "Memory Limit Exceeded", color: "text-amber-600" },
  COMPILE_ERROR: { label: "Compile Error", color: "text-red-500" },
  RUNTIME_ERROR: { label: "Runtime Error", color: "text-red-500" },
};
