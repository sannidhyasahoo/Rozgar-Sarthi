"""
coding_assessment_engine.py
Deterministic candidate skill profile + adaptive question selector.

Core principle: AI proposes. Evidence constrains. Deterministic systems decide.

The engine:
  1. Updates skill profile based on execution results + AST analysis
  2. Selects the next question using a deterministic scoring formula
  3. Optionally consults the LLM for recommendation (validated + fallback)
"""

import json
import logging
from typing import Optional

from coding_session_store import (
    CandidateSkillProfile,
    CodingAssessment,
    AssessmentQuestion,
    ExecutionResult,
    CodeAnalysis,
)

logger = logging.getLogger(__name__)

# ─── Skill → Topic mapping ────────────────────────────────────────────────────

TOPIC_TO_SKILLS: dict[str, list[str]] = {
    "arrays":            ["arrays"],
    "strings":           ["strings"],
    "hashmap":           ["hashmaps"],
    "sliding-window":    ["slidingWindow"],
    "binary-search":     ["binarySearch"],
    "stack":             ["stacks"],
    "trees":             ["trees", "recursion"],
    "BFS":               ["trees", "graphs"],
    "DFS":               ["graphs", "recursion"],
    "graphs":            ["graphs"],
    "topological-sort":  ["graphs"],
    "greedy":            ["greedy"],
    "recursion":         ["recursion"],
    "dynamic-programming": ["dynamicProgramming"],
    "intervals":         ["arrays"],
    "sorting":           ["arrays"],
    "prefix-suffix":     ["arrays"],
    "heap":              ["hashmaps"],
}

SKILL_FIELDS = [
    "arrays", "strings", "hashmaps", "slidingWindow", "binarySearch",
    "stacks", "trees", "graphs", "greedy", "recursion",
    "dynamicProgramming", "complexityAnalysis",
]

BEHAVIORAL_FIELDS = ["accuracy", "speed", "debugging", "edgeCaseHandling", "efficiency"]


# ─── Skill Profile Update ─────────────────────────────────────────────────────

def update_skill_profile(
    profile: CandidateSkillProfile,
    question: dict,  # problem dict from coding_problems.json
    result: ExecutionResult,
    analysis: CodeAnalysis,
    attempt_number: int = 1,
    time_taken_seconds: float = 0.0,
    total_attempts_on_question: int = 1,
) -> CandidateSkillProfile:
    """
    Update the candidate skill profile deterministically based on:
    - Execution result (correctness, pass rate)
    - Code analysis (complexity, data structures)
    - Attempt number and timing
    """
    pass_rate = result.passedTests / max(result.totalTests, 1)
    expected_complexity = question.get("expectedComplexity", {}).get("time", "O(n)")
    difficulty = question.get("difficulty", 3)  # 1–5

    # ── Correctness delta ──────────────────────────────────────────────────────
    # Map pass_rate → score delta on relevant skills
    # Full pass = +15 * difficulty_weight, zero pass = -10
    difficulty_weight = difficulty / 3.0
    if pass_rate == 1.0:
        correctness_delta = 12.0 * difficulty_weight
    elif pass_rate >= 0.8:
        correctness_delta = 8.0 * difficulty_weight
    elif pass_rate >= 0.5:
        correctness_delta = 3.0 * difficulty_weight
    elif pass_rate > 0:
        correctness_delta = -3.0
    else:
        correctness_delta = -8.0

    # ── Efficiency delta (complexity match) ───────────────────────────────────
    efficiency_delta = 0.0
    estimated = analysis.estimatedTimeComplexity
    if analysis.confidence > 0.6:
        if _complexity_matches(estimated, expected_complexity):
            efficiency_delta = 8.0
        elif _complexity_is_worse(estimated, expected_complexity):
            efficiency_delta = -5.0
        # If better or unknown, no penalty

    # ── Debugging delta (multiple attempts) ───────────────────────────────────
    if attempt_number == 1 and pass_rate == 1.0:
        debugging_delta = 10.0
    elif attempt_number <= 3 and pass_rate == 1.0:
        debugging_delta = 5.0
    elif pass_rate == 1.0:
        debugging_delta = 2.0
    else:
        debugging_delta = 0.0

    # ── Speed delta ────────────────────────────────────────────────────────────
    expected_minutes = question.get("estimatedMinutes", 20)
    expected_seconds = expected_minutes * 60
    speed_delta = 0.0
    if time_taken_seconds > 0:
        ratio = time_taken_seconds / expected_seconds
        if ratio < 0.5:
            speed_delta = 8.0
        elif ratio < 1.0:
            speed_delta = 4.0
        elif ratio < 1.5:
            speed_delta = 0.0
        else:
            speed_delta = -4.0

    # ── Edge case delta ────────────────────────────────────────────────────────
    # Proxy: passing hidden tests indicates good edge case handling
    # We only know this if full submit (all tests run)
    edge_delta = (pass_rate - 0.5) * 10.0  # -5 to +5

    # ── Apply deltas to topic skills ───────────────────────────────────────────
    topics = question.get("topics", [])
    affected_skills: set[str] = set()
    for topic in topics:
        for skill in TOPIC_TO_SKILLS.get(topic, []):
            affected_skills.add(skill)

    profile_dict = profile.model_dump()

    for skill in affected_skills:
        if skill in profile_dict:
            current = profile_dict[skill]
            delta = correctness_delta + (efficiency_delta * 0.3)
            profile_dict[skill] = _clamp(current + delta, 10.0, 100.0)

    # ── Apply behavioral metrics ───────────────────────────────────────────────
    profile_dict["accuracy"] = _clamp(
        profile_dict["accuracy"] + (pass_rate - 0.5) * 20.0, 10.0, 100.0
    )
    profile_dict["debugging"] = _clamp(
        profile_dict["debugging"] + debugging_delta, 10.0, 100.0
    )
    profile_dict["speed"] = _clamp(
        profile_dict["speed"] + speed_delta, 10.0, 100.0
    )
    profile_dict["edgeCaseHandling"] = _clamp(
        profile_dict["edgeCaseHandling"] + edge_delta, 10.0, 100.0
    )
    profile_dict["efficiency"] = _clamp(
        profile_dict["efficiency"] + efficiency_delta, 10.0, 100.0
    )

    # ── Complexity analysis skill ──────────────────────────────────────────────
    if analysis.confidence > 0.5:
        if _complexity_matches(estimated, expected_complexity):
            profile_dict["complexityAnalysis"] = _clamp(
                profile_dict["complexityAnalysis"] + 6.0, 10.0, 100.0
            )
        elif _complexity_is_worse(estimated, expected_complexity):
            profile_dict["complexityAnalysis"] = _clamp(
                profile_dict["complexityAnalysis"] - 4.0, 10.0, 100.0
            )

    return CandidateSkillProfile(**profile_dict)


# ─── Adaptive Question Selector ───────────────────────────────────────────────

def select_next_question(
    profile: CandidateSkillProfile,
    attempted_ids: list[str],
    all_problems: list[dict],
    time_remaining_seconds: float = 3600.0,
    prefer_difficulty: Optional[int] = None,
) -> Optional[dict]:
    """
    Deterministic adaptive question selector.

    Scoring formula:
      questionScore =
          weaknessRelevance * 0.35
        + difficultyFit * 0.25
        + informationGain * 0.20
        + topicCoverage * 0.10
        + timeFit * 0.10
    """
    profile_dict = profile.model_dump()

    available = [p for p in all_problems if p["id"] not in attempted_ids]
    if not available:
        return None

    # Filter by time remaining
    feasible = [
        p for p in available
        if p.get("estimatedMinutes", 20) * 60 <= time_remaining_seconds + 120  # 2min buffer
    ]
    if not feasible:
        feasible = available  # last resort

    best_question = None
    best_score = -1.0

    for problem in feasible:
        score = _score_question(problem, profile_dict, attempted_ids, time_remaining_seconds)
        if score > best_score:
            best_score = score
            best_question = problem

    return best_question


def _score_question(
    problem: dict,
    profile: dict,
    attempted_ids: list[str],
    time_remaining: float,
) -> float:
    """
    Score a candidate question using the adaptive formula.
    Returns a float score.
    """

    # ── 1. Weakness Relevance (0–1) ────────────────────────────────────────────
    # Higher score if question targets skills candidate is weak in
    topics = problem.get("topics", [])
    relevant_skills = set()
    for topic in topics:
        for skill in TOPIC_TO_SKILLS.get(topic, []):
            relevant_skills.add(skill)

    if relevant_skills:
        avg_skill = sum(profile.get(s, 50.0) for s in relevant_skills) / len(relevant_skills)
        # Invert: weakness = low skill score → high relevance
        weakness_relevance = (100.0 - avg_skill) / 100.0
    else:
        weakness_relevance = 0.5

    # ── 2. Difficulty Fit (0–1) ────────────────────────────────────────────────
    difficulty = problem.get("difficulty", 3)
    overall_skill = sum(
        profile.get(s, 50.0) for s in SKILL_FIELDS
    ) / len(SKILL_FIELDS)

    # Ideal difficulty = 1 + (skill/100) * 4 (scale 1–5)
    ideal_difficulty = 1 + (overall_skill / 100.0) * 4.0
    diff_distance = abs(difficulty - ideal_difficulty)
    difficulty_fit = max(0.0, 1.0 - diff_distance / 4.0)

    # ── 3. Information Gain (0–1) ──────────────────────────────────────────────
    # Prefer questions that cover under-tested skill areas
    tested_skills = set()
    for aid in attempted_ids:
        pass  # Could track which skills already tested — simplified here

    # Proxy: skills with 50.0 (initial value) = uncertain = high information gain
    uncertain_skills = {s for s in relevant_skills if abs(profile.get(s, 50.0) - 50.0) < 15.0}
    information_gain = len(uncertain_skills) / max(len(relevant_skills), 1)

    # ── 4. Topic Coverage (0–1) ────────────────────────────────────────────────
    # Prefer broader topic coverage (more unique topics tested)
    topic_coverage = min(len(topics) / 4.0, 1.0)

    # ── 5. Time Fit (0–1) ─────────────────────────────────────────────────────
    est_minutes = problem.get("estimatedMinutes", 20)
    est_seconds = est_minutes * 60
    if time_remaining >= est_seconds * 2:
        time_fit = 1.0
    elif time_remaining >= est_seconds:
        time_fit = 0.7
    else:
        time_fit = 0.2

    # ── Final weighted score ───────────────────────────────────────────────────
    final = (
        weakness_relevance * 0.35
        + difficulty_fit * 0.25
        + information_gain * 0.20
        + topic_coverage * 0.10
        + time_fit * 0.10
    )

    return final


# ─── AI-Based Question Recommendation ────────────────────────────────────────

async def ai_recommend_question(
    profile: CandidateSkillProfile,
    available_problems: list[dict],
    recent_results: list[dict],
    remaining_time_seconds: float,
    llm_factory,
) -> Optional[str]:
    """
    Ask the LLM to recommend the next question ID.
    Validates response against schema.
    Falls back to deterministic selector on any failure.
    """
    try:
        from langchain_core.prompts import ChatPromptTemplate
        from pydantic import BaseModel, Field as PField

        class AIRecommendation(BaseModel):
            recommendedQuestionId: str = PField(description="The ID of the recommended question from available_questions list")
            reason: str = PField(description="Why this question was selected")
            targetSkills: list[str] = PField(description="Which skills this question will test")
            confidence: float = PField(ge=0.0, le=1.0, description="Confidence in this recommendation")

        available_ids = [p["id"] for p in available_problems[:8]]  # limit context

        prompt = ChatPromptTemplate.from_template("""
You are an adaptive coding assessment engine recommending the next question for a candidate.

Candidate Skill Profile (0-100, lower = weaker):
{skill_profile}

Recent Performance:
{recent_results}

Available Questions (IDs):
{available_questions}

Time Remaining: {time_remaining} seconds

Recommend the single best next question to maximize assessment quality.
Target weak areas (low scores) and uncertain areas (near 50).
Return ONLY the JSON with fields: recommendedQuestionId, reason, targetSkills, confidence.
""")

        llm = llm_factory()
        structured_llm = llm.with_structured_output(AIRecommendation)
        chain = prompt | structured_llm

        result = await chain.ainvoke({
            "skill_profile": json.dumps(profile.model_dump(), indent=2),
            "recent_results": json.dumps(recent_results[:3], indent=2),
            "available_questions": json.dumps(available_ids),
            "time_remaining": int(remaining_time_seconds),
        })

        # Validate returned question ID is actually available
        if result.recommendedQuestionId in available_ids:
            logger.info(f"AI recommended: {result.recommendedQuestionId} ({result.reason[:80]})")
            return result.recommendedQuestionId
        else:
            logger.warning(f"AI returned invalid question ID: {result.recommendedQuestionId}")
            return None

    except Exception as e:
        logger.warning(f"AI recommendation failed, using deterministic fallback: {e}")
        return None


# ─── Score Computation ────────────────────────────────────────────────────────

def compute_assessment_scores(assessment: CodingAssessment) -> dict:
    """
    Compute the final candidate scores from all assessment evidence.
    Returns dict of named scores (all 0–100).
    """
    questions = assessment.questions
    if not questions:
        return {}

    submit_results = []
    for q in questions:
        for sub in q.submissions:
            if not sub.isRun and sub.executionResult:
                submit_results.append((q, sub))

    if not submit_results:
        return {}

    # Correctness: weighted average pass rates (final submission per question)
    final_pass_rates = []
    for q in questions:
        submit_subs = [s for s in q.submissions if not s.isRun and s.executionResult]
        if submit_subs:
            last = submit_subs[-1]
            final_pass_rates.append(
                last.executionResult.passedTests / max(last.executionResult.totalTests, 1)
            )

    correctness_score = (sum(final_pass_rates) / len(final_pass_rates)) * 100 if final_pass_rates else 0

    # Efficiency: ratio of expected vs estimated complexity
    complexity_scores = []
    for q_rec, sub in submit_results:
        if sub.codeAnalysis and sub.codeAnalysis.confidence > 0.5:
            # Find problem def for expected complexity
            pass  # simplified — use profile efficiency directly
    efficiency_score = assessment.skillProfile.efficiency

    # Debugging: penalize multiple attempts
    debugging_scores = []
    for q in questions:
        attempts = q.totalAttempts
        if attempts == 0:
            continue
        if attempts == 1:
            debugging_scores.append(100.0)
        elif attempts == 2:
            debugging_scores.append(80.0)
        elif attempts == 3:
            debugging_scores.append(65.0)
        else:
            debugging_scores.append(max(50.0, 80.0 - attempts * 8))
    debugging_score = sum(debugging_scores) / len(debugging_scores) if debugging_scores else 50

    # Code quality: composite of signals
    code_quality_score = (
        assessment.skillProfile.complexityAnalysis * 0.4
        + debugging_score * 0.3
        + correctness_score * 0.3
    )

    # Problem solving: blend of correctness + efficiency
    problem_solving_score = (
        correctness_score * 0.6
        + efficiency_score * 0.4
    )

    # Algorithm knowledge: skill profile average over algo skills
    algo_skills = [
        assessment.skillProfile.arrays,
        assessment.skillProfile.strings,
        assessment.skillProfile.hashmaps,
        assessment.skillProfile.binarySearch,
        assessment.skillProfile.stacks,
        assessment.skillProfile.trees,
        assessment.skillProfile.graphs,
        assessment.skillProfile.dynamicProgramming,
        assessment.skillProfile.greedy,
        assessment.skillProfile.recursion,
    ]
    algo_score = sum(algo_skills) / len(algo_skills)

    overall_score = (
        problem_solving_score * 0.30
        + correctness_score * 0.25
        + algo_score * 0.20
        + efficiency_score * 0.15
        + debugging_score * 0.10
    )

    solved = sum(1 for q in questions if q.finalPassRate == 1.0)
    total_attempted = len(questions)

    return {
        "overallScore": round(overall_score),
        "problemSolving": round(problem_solving_score),
        "correctness": round(correctness_score),
        "algorithmKnowledge": round(algo_score),
        "efficiency": round(efficiency_score),
        "debugging": round(debugging_score),
        "codeQuality": round(code_quality_score),
        "problemsSolved": solved,
        "totalAttempted": total_attempted,
    }


# ─── Report Generation ────────────────────────────────────────────────────────

def identify_strong_weak_areas(profile: CandidateSkillProfile) -> dict:
    """Identify strong (>70) and weak (<40) skill areas."""
    profile_dict = profile.model_dump()
    strong = [k for k in SKILL_FIELDS if profile_dict.get(k, 50) >= 70]
    weak = [k for k in SKILL_FIELDS if profile_dict.get(k, 50) <= 40]
    uncertain = [
        k for k in SKILL_FIELDS
        if 40 < profile_dict.get(k, 50) < 70
    ]
    return {"strong": strong, "weak": weak, "uncertain": uncertain}


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _clamp(value: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, value))


def _complexity_matches(estimated: str, expected: str) -> bool:
    """Loose match: are they in the same Big-O class?"""
    def normalize(s: str) -> str:
        return s.lower().replace(" ", "").replace("^", "").replace("*", "")
    return normalize(estimated) == normalize(expected)


def _complexity_is_worse(estimated: str, expected: str) -> bool:
    """Is the estimated complexity asymptotically worse than expected?"""
    ORDER = ["O(1)", "O(logn)", "O(n)", "O(nlogn)", "O(n^2)", "O(n^3)", "O(2^n)"]

    def rank(s: str) -> int:
        s = s.lower().replace(" ", "").replace("^", "").replace("*", "")
        for i, o in enumerate(ORDER):
            norm = o.lower().replace(" ", "").replace("^", "")
            if norm in s or s in norm:
                return i
        return 3  # default to O(n)

    return rank(estimated) > rank(expected)
