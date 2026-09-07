"""
coding_session_store.py
File-based session persistence for coding assessments.
Consistent with the existing profiles/ pattern in this codebase.
"""

import json
import os
import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

# ─── Storage Root ─────────────────────────────────────────────────────────────
SESSIONS_DIR = os.path.join(os.path.dirname(__file__), "coding_sessions")
os.makedirs(SESSIONS_DIR, exist_ok=True)


# ─── Data Models ──────────────────────────────────────────────────────────────

class ExecutionResult(BaseModel):
    status: str  # ACCEPTED | WRONG_ANSWER | TIME_LIMIT | MEMORY_LIMIT | COMPILE_ERROR | RUNTIME_ERROR
    passedTests: int = 0
    totalTests: int = 0
    executionTimeMs: float = 0.0
    memoryKb: float = 0.0
    compileError: Optional[str] = None
    runtimeError: Optional[str] = None
    failedTestIndexes: list[int] = Field(default_factory=list)
    testDetails: list[dict] = Field(default_factory=list)  # visible test detail only


class CodeAnalysis(BaseModel):
    estimatedTimeComplexity: str = "Unknown"
    estimatedSpaceComplexity: str = "Unknown"
    confidence: float = 0.0
    signals: list[str] = Field(default_factory=list)
    dataStructures: list[str] = Field(default_factory=list)
    hasRecursion: bool = False
    functionCount: int = 0
    loopDepth: int = 0


class Submission(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    questionId: str = ""
    attemptNumber: int = 1
    language: str = "python"
    code: str = ""
    submittedAt: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    isRun: bool = False   # True = "Run Code", False = "Submit"
    executionResult: Optional[ExecutionResult] = None
    codeAnalysis: Optional[CodeAnalysis] = None


class AssessmentQuestion(BaseModel):
    questionId: str
    difficulty: int
    topics: list[str]
    skills: list[str]
    startedAt: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    completedAt: Optional[str] = None
    submissions: list[Submission] = Field(default_factory=list)
    finalPassRate: float = 0.0
    firstPassRate: float = 0.0
    bestPassRate: float = 0.0
    totalAttempts: int = 0


class CandidateSkillProfile(BaseModel):
    # Algorithm skills (0–100)
    arrays: float = 50.0
    strings: float = 50.0
    hashmaps: float = 50.0
    slidingWindow: float = 50.0
    binarySearch: float = 50.0
    stacks: float = 50.0
    trees: float = 50.0
    graphs: float = 50.0
    greedy: float = 50.0
    recursion: float = 50.0
    dynamicProgramming: float = 50.0
    complexityAnalysis: float = 50.0

    # Behavioral metrics (0–100)
    accuracy: float = 50.0
    speed: float = 50.0
    debugging: float = 50.0
    edgeCaseHandling: float = 50.0
    efficiency: float = 50.0


class CodingAssessment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    createdAt: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updatedAt: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    status: str = "active"  # active | completed
    totalQuestions: int = 7
    currentQuestionIndex: int = 0
    timeStarted: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    timeLimitMinutes: int = 60
    questions: list[AssessmentQuestion] = Field(default_factory=list)
    skillProfile: CandidateSkillProfile = Field(default_factory=CandidateSkillProfile)
    reportGenerated: bool = False


# ─── Storage Functions ────────────────────────────────────────────────────────

def _assessment_path(assessment_id: str) -> str:
    return os.path.join(SESSIONS_DIR, f"{assessment_id}.json")


def save_assessment(assessment: CodingAssessment) -> None:
    assessment.updatedAt = datetime.utcnow().isoformat()
    path = _assessment_path(assessment.id)
    with open(path, "w", encoding="utf-8") as f:
        f.write(assessment.model_dump_json(indent=2))


def load_assessment(assessment_id: str) -> Optional[CodingAssessment]:
    path = _assessment_path(assessment_id)
    if not os.path.exists(path):
        return None
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return CodingAssessment(**data)


def create_assessment(total_questions: int = 7) -> CodingAssessment:
    assessment = CodingAssessment(totalQuestions=total_questions)
    save_assessment(assessment)
    return assessment


def get_current_question(assessment: CodingAssessment) -> Optional[AssessmentQuestion]:
    idx = assessment.currentQuestionIndex
    if idx < len(assessment.questions):
        return assessment.questions[idx]
    return None


def add_submission(
    assessment: CodingAssessment,
    question_id: str,
    submission: Submission,
) -> CodingAssessment:
    # Find the current question record
    current_q = get_current_question(assessment)
    if current_q is None or current_q.questionId != question_id:
        return assessment

    current_q.submissions.append(submission)
    current_q.totalAttempts = len([s for s in current_q.submissions if not s.isRun])

    # Update pass rates from submit-type submissions
    submit_subs = [s for s in current_q.submissions if not s.isRun and s.executionResult]
    if submit_subs:
        pass_rates = [
            s.executionResult.passedTests / max(s.executionResult.totalTests, 1)
            for s in submit_subs
        ]
        current_q.firstPassRate = pass_rates[0]
        current_q.finalPassRate = pass_rates[-1]
        current_q.bestPassRate = max(pass_rates)

    save_assessment(assessment)
    return assessment
