"""
coding_api.py  (REPLACED)
Full adaptive coding assessment API for Rozgar Sarthi.

Endpoints:
  POST /api/coding/assessments              → start assessment
  GET  /api/coding/assessments/:id          → get state
  GET  /api/coding/assessments/:id/question → get current question (no hidden tests)
  POST /api/coding/assessments/:id/run      → run against visible tests
  POST /api/coding/assessments/:id/submit   → run all tests + analyze + update
  POST /api/coding/assessments/:id/next     → advance to next (adaptive) question
  GET  /api/coding/assessments/:id/profile  → get skill profile
  GET  /api/coding/assessments/:id/report   → final candidate report
  GET  /api/coding/assessments/:id/hint     → AI hint for current question
"""

import json
import logging
import os
import time
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel

from coding_session_store import (
    CodingAssessment,
    AssessmentQuestion,
    Submission,
    ExecutionResult,
    create_assessment,
    load_assessment,
    save_assessment,
    add_submission,
    get_current_question,
)
from code_executor import execute_code
from tree_sitter_analyzer import analyze_code
from coding_assessment_engine import (
    update_skill_profile,
    select_next_question,
    ai_recommend_question,
    compute_assessment_scores,
    identify_strong_weak_areas,
)
from llm_factory import get_planner_llm

logger = logging.getLogger(__name__)
router = APIRouter()

# ─── Load Problem Library ─────────────────────────────────────────────────────

PROBLEMS_FILE = os.path.join(os.path.dirname(__file__), "coding_problems.json")

def load_problems() -> list[dict]:
    with open(PROBLEMS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def get_problem(problem_id: str) -> Optional[dict]:
    return next((p for p in load_problems() if p["id"] == problem_id), None)

def sanitize_problem(problem: dict) -> dict:
    """Strip hidden test cases and solution reference before sending to frontend."""
    safe = {k: v for k, v in problem.items() if k not in ("hiddenTestCases", "solutionReference")}
    return safe


# ─── Request Models ───────────────────────────────────────────────────────────

class StartAssessmentRequest(BaseModel):
    totalQuestions: int = 7

class RunCodeRequest(BaseModel):
    questionId: str
    language: str
    code: str

class SubmitCodeRequest(BaseModel):
    questionId: str
    language: str
    code: str


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _get_assessment_or_404(assessment_id: str) -> CodingAssessment:
    assessment = load_assessment(assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment


def _elapsed_seconds(assessment: CodingAssessment) -> float:
    try:
        started = datetime.fromisoformat(assessment.timeStarted)
        return (datetime.utcnow() - started).total_seconds()
    except Exception:
        return 0.0


def _time_remaining(assessment: CodingAssessment) -> float:
    limit = assessment.timeLimitMinutes * 60
    elapsed = _elapsed_seconds(assessment)
    return max(0.0, limit - elapsed)


def _question_start_time(q: AssessmentQuestion) -> float:
    try:
        started = datetime.fromisoformat(q.startedAt)
        return (datetime.utcnow() - started).total_seconds()
    except Exception:
        return 0.0


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/assessments")
def start_assessment(req: StartAssessmentRequest):
    """Start a new coding assessment and select Question 1."""
    problems = load_problems()
    assessment = create_assessment(total_questions=req.totalQuestions)

    # Select first question — always Easy (difficulty 1 or 2)
    easy_problems = [p for p in problems if p["difficulty"] <= 2]
    first = easy_problems[0] if easy_problems else problems[0]

    first_q = AssessmentQuestion(
        questionId=first["id"],
        difficulty=first["difficulty"],
        topics=first["topics"],
        skills=first["skills"],
    )
    assessment.questions.append(first_q)
    save_assessment(assessment)

    return {
        "assessmentId": assessment.id,
        "status": "active",
        "currentQuestionIndex": 0,
        "totalQuestions": assessment.totalQuestions,
        "question": sanitize_problem(first),
        "timeLimitMinutes": assessment.timeLimitMinutes,
    }


@router.get("/assessments/{assessment_id}")
def get_assessment(assessment_id: str):
    """Get assessment state."""
    assessment = _get_assessment_or_404(assessment_id)
    return {
        "id": assessment.id,
        "status": assessment.status,
        "currentQuestionIndex": assessment.currentQuestionIndex,
        "totalQuestions": assessment.totalQuestions,
        "questionsAttempted": len(assessment.questions),
        "timeRemainingSeconds": _time_remaining(assessment),
        "skillProfile": assessment.skillProfile.model_dump(),
    }


@router.get("/assessments/{assessment_id}/question")
def get_current_question_endpoint(assessment_id: str):
    """Get the current question (without hidden tests or solution)."""
    assessment = _get_assessment_or_404(assessment_id)

    if assessment.status == "completed":
        raise HTTPException(status_code=400, detail="Assessment is completed")

    current_q = get_current_question(assessment)
    if current_q is None:
        raise HTTPException(status_code=404, detail="No current question")

    problem = get_problem(current_q.questionId)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    submissions_summary = [
        {
            "attemptNumber": s.attemptNumber,
            "isRun": s.isRun,
            "submittedAt": s.submittedAt,
            "status": s.executionResult.status if s.executionResult else None,
            "passedTests": s.executionResult.passedTests if s.executionResult else 0,
            "totalTests": s.executionResult.totalTests if s.executionResult else 0,
        }
        for s in current_q.submissions
    ]

    return {
        "question": sanitize_problem(problem),
        "questionIndex": assessment.currentQuestionIndex,
        "totalQuestions": assessment.totalQuestions,
        "timeRemainingSeconds": _time_remaining(assessment),
        "submissions": submissions_summary,
        "totalAttempts": current_q.totalAttempts,
    }


@router.post("/assessments/{assessment_id}/run")
def run_code(assessment_id: str, req: RunCodeRequest):
    """
    Run candidate code against VISIBLE test cases only.
    Does NOT update skill profile.
    """
    assessment = _get_assessment_or_404(assessment_id)

    if assessment.status == "completed":
        raise HTTPException(status_code=400, detail="Assessment is completed")

    problem = get_problem(req.questionId)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    # Validate language
    if req.language not in ["python", "javascript", "cpp"]:
        raise HTTPException(status_code=400, detail=f"Language '{req.language}' not supported")

    # Execute against visible tests only
    visible_tests = problem.get("visibleTestCases", [])
    result = execute_code(
        problem=problem,
        candidate_code=req.code,
        language=req.language,
        test_cases=visible_tests,
        time_limit=problem.get("timeLimit", 5.0),
        visible_only=True,
    )

    # Record as a "run" (not a submit)
    current_q = get_current_question(assessment)
    if current_q and current_q.questionId == req.questionId:
        run_count = sum(1 for s in current_q.submissions if s.isRun)
        sub = Submission(
            questionId=req.questionId,
            attemptNumber=run_count + 1,
            language=req.language,
            code=req.code,
            isRun=True,
            executionResult=result,
        )
        assessment = add_submission(assessment, req.questionId, sub)

    return {
        "status": result.status,
        "passedTests": result.passedTests,
        "totalTests": result.totalTests,
        "executionTimeMs": result.executionTimeMs,
        "compileError": result.compileError,
        "runtimeError": result.runtimeError,
        "testDetails": result.testDetails,
        "isRunOnly": True,
    }


@router.post("/assessments/{assessment_id}/submit")
def submit_code(assessment_id: str, req: SubmitCodeRequest):
    """
    Submit candidate code against ALL test cases (visible + hidden).
    Updates candidate skill profile.
    Runs Tree-sitter analysis.
    """
    assessment = _get_assessment_or_404(assessment_id)

    if assessment.status == "completed":
        raise HTTPException(status_code=400, detail="Assessment is completed")

    problem = get_problem(req.questionId)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    if req.language not in ["python", "javascript", "cpp"]:
        raise HTTPException(status_code=400, detail=f"Language '{req.language}' not supported")

    # ── Run against ALL tests ──────────────────────────────────────────────────
    visible = problem.get("visibleTestCases", [])
    hidden = problem.get("hiddenTestCases", [])
    all_tests = visible + hidden

    result = execute_code(
        problem=problem,
        candidate_code=req.code,
        language=req.language,
        test_cases=all_tests,
        time_limit=problem.get("timeLimit", 5.0),
        visible_only=False,
    )

    # ── Tree-sitter analysis ───────────────────────────────────────────────────
    analysis = analyze_code(req.code, req.language)

    # ── Record submission ──────────────────────────────────────────────────────
    current_q = get_current_question(assessment)
    if not current_q or current_q.questionId != req.questionId:
        raise HTTPException(status_code=400, detail="Question mismatch")

    submit_count = sum(1 for s in current_q.submissions if not s.isRun)
    time_taken = _question_start_time(current_q)

    sub = Submission(
        questionId=req.questionId,
        attemptNumber=submit_count + 1,
        language=req.language,
        code=req.code,
        isRun=False,
        executionResult=result,
        codeAnalysis=analysis,
    )
    assessment = add_submission(assessment, req.questionId, sub)

    # ── Update skill profile (deterministically) ───────────────────────────────
    updated_profile = update_skill_profile(
        profile=assessment.skillProfile,
        question=problem,
        result=result,
        analysis=analysis,
        attempt_number=submit_count + 1,
        time_taken_seconds=time_taken,
        total_attempts_on_question=submit_count + 1,
    )
    assessment.skillProfile = updated_profile
    save_assessment(assessment)

    # Strip hidden test details from response
    visible_results = [d for d in result.testDetails if d.get("index", 999) < len(visible)]

    return {
        "submissionId": sub.id,
        "status": result.status,
        "passedTests": result.passedTests,
        "totalTests": result.totalTests,
        "visibleTests": len(visible),
        "hiddenTests": len(hidden),
        "executionTimeMs": result.executionTimeMs,
        "compileError": result.compileError,
        "runtimeError": result.runtimeError,
        "testDetails": visible_results,  # only visible test details
        "codeAnalysis": {
            "estimatedTimeComplexity": analysis.estimatedTimeComplexity,
            "confidence": analysis.confidence,
            "signals": analysis.signals,
            "dataStructures": analysis.dataStructures,
            "hasRecursion": analysis.hasRecursion,
        },
        "expectedComplexity": problem.get("expectedComplexity", {}),
        "skillProfile": updated_profile.model_dump(),
        "attemptNumber": submit_count + 1,
    }


@router.post("/assessments/{assessment_id}/next")
async def advance_to_next_question(assessment_id: str):
    """
    Advance to the next adaptively selected question.
    Tries AI recommendation first, falls back to deterministic selector.
    """
    assessment = _get_assessment_or_404(assessment_id)

    if assessment.status == "completed":
        raise HTTPException(status_code=400, detail="Assessment already completed")

    # Mark current question completed
    current_q = get_current_question(assessment)
    if current_q:
        current_q.completedAt = datetime.utcnow().isoformat()

    # Check if assessment should end
    if assessment.currentQuestionIndex + 1 >= assessment.totalQuestions:
        assessment.status = "completed"
        save_assessment(assessment)
        return {"status": "completed", "assessmentId": assessment_id}

    problems = load_problems()
    attempted_ids = [q.questionId for q in assessment.questions]
    time_remaining = _time_remaining(assessment)

    # ── Try AI recommendation ──────────────────────────────────────────────────
    available = [p for p in problems if p["id"] not in attempted_ids]
    ai_question_id = await ai_recommend_question(
        profile=assessment.skillProfile,
        available_problems=available,
        recent_results=[],
        remaining_time_seconds=time_remaining,
        llm_factory=get_planner_llm,
    )

    # ── Deterministic fallback ─────────────────────────────────────────────────
    if ai_question_id:
        next_problem = get_problem(ai_question_id)
        if not next_problem:
            ai_question_id = None

    if not ai_question_id:
        next_problem = select_next_question(
            profile=assessment.skillProfile,
            attempted_ids=attempted_ids,
            all_problems=problems,
            time_remaining_seconds=time_remaining,
        )

    if not next_problem:
        assessment.status = "completed"
        save_assessment(assessment)
        return {"status": "completed", "assessmentId": assessment_id}

    # ── Add new question ───────────────────────────────────────────────────────
    assessment.currentQuestionIndex += 1
    new_q = AssessmentQuestion(
        questionId=next_problem["id"],
        difficulty=next_problem["difficulty"],
        topics=next_problem["topics"],
        skills=next_problem["skills"],
    )
    assessment.questions.append(new_q)
    save_assessment(assessment)

    return {
        "status": "next",
        "questionIndex": assessment.currentQuestionIndex,
        "totalQuestions": assessment.totalQuestions,
        "question": sanitize_problem(next_problem),
        "timeRemainingSeconds": time_remaining,
        "aiRecommended": ai_question_id is not None,
    }


@router.get("/assessments/{assessment_id}/profile")
def get_skill_profile(assessment_id: str):
    """Get the current candidate skill profile."""
    assessment = _get_assessment_or_404(assessment_id)
    return assessment.skillProfile.model_dump()


@router.get("/assessments/{assessment_id}/report")
async def get_report(assessment_id: str):
    """
    Generate the final candidate report.
    Combines deterministic scores with AI narrative.
    """
    assessment = _get_assessment_or_404(assessment_id)

    scores = compute_assessment_scores(assessment)
    areas = identify_strong_weak_areas(assessment.skillProfile)

    # ── Build evidence items from submissions ──────────────────────────────────
    evidence = []
    problems = load_problems()
    for q in assessment.questions:
        problem = next((p for p in problems if p["id"] == q.questionId), None)
        if not problem:
            continue
        submit_subs = [s for s in q.submissions if not s.isRun and s.executionResult]
        if not submit_subs:
            continue
        last = submit_subs[-1]
        pass_rate = last.executionResult.passedTests / max(last.executionResult.totalTests, 1)
        evidence.append({
            "questionId": q.questionId,
            "title": problem["title"],
            "difficulty": problem["difficultyLabel"],
            "topics": q.topics,
            "attempts": q.totalAttempts,
            "finalPassRate": round(q.finalPassRate * 100),
            "firstPassRate": round(q.firstPassRate * 100),
            "status": last.executionResult.status,
            "complexity": {
                "estimated": last.codeAnalysis.estimatedTimeComplexity if last.codeAnalysis else "Unknown",
                "expected": problem.get("expectedComplexity", {}).get("time", "Unknown"),
                "confidence": last.codeAnalysis.confidence if last.codeAnalysis else 0,
            } if last.codeAnalysis else None,
        })

    # ── AI narrative (optional, best-effort) ──────────────────────────────────
    ai_narrative = None
    try:
        from langchain_core.prompts import ChatPromptTemplate
        llm = get_planner_llm()
        prompt = ChatPromptTemplate.from_template("""
You are a technical recruiter generating an assessment narrative.

Candidate Performance Data:
- Overall Score: {overall_score}/100
- Strong Areas: {strong}
- Weak Areas: {weak}
- Problems Solved: {solved}/{total}
- Evidence: {evidence_summary}

Write a 3-4 sentence professional assessment narrative for a recruiter.
Focus on concrete evidence. Do not make up details not in the data.
Be honest about weaknesses.
""")
        chain = prompt | llm
        evidence_summary = "\n".join([
            f"  • {e['title']}: {e['finalPassRate']}% pass rate, {e['attempts']} attempt(s)"
            for e in evidence
        ])
        response = await chain.ainvoke({
            "overall_score": scores.get("overallScore", 0),
            "strong": ", ".join(areas["strong"]) or "None identified yet",
            "weak": ", ".join(areas["weak"]) or "None identified yet",
            "solved": scores.get("problemsSolved", 0),
            "total": scores.get("totalAttempted", 0),
            "evidence_summary": evidence_summary,
        })
        ai_narrative = response.content
    except Exception as e:
        logger.warning(f"AI narrative generation failed: {e}")
        ai_narrative = None

    # Hidden test stats
    total_hidden_passed = 0
    total_hidden = 0
    for q in assessment.questions:
        problem = next((p for p in problems if p["id"] == q.questionId), None)
        if problem:
            hidden_count = len(problem.get("hiddenTestCases", []))
            visible_count = len(problem.get("visibleTestCases", []))
            total_hidden += hidden_count
            submit_subs = [s for s in q.submissions if not s.isRun and s.executionResult]
            if submit_subs:
                last = submit_subs[-1]
                all_passed = last.executionResult.passedTests
                visible_passed = min(all_passed, visible_count)
                hidden_passed = max(0, all_passed - visible_passed)
                total_hidden_passed += hidden_passed

    hidden_pass_pct = round((total_hidden_passed / max(total_hidden, 1)) * 100)

    return {
        "assessmentId": assessment_id,
        "scores": scores,
        "skillProfile": assessment.skillProfile.model_dump(),
        "areas": areas,
        "evidence": evidence,
        "aiNarrative": ai_narrative,
        "stats": {
            "totalQuestionsAttempted": len(assessment.questions),
            "hiddenTestPassRate": hidden_pass_pct,
            "timeLimitMinutes": assessment.timeLimitMinutes,
            "elapsedSeconds": _elapsed_seconds(assessment),
        },
        "confidence": min(100, len(assessment.questions) * 14),
    }


@router.get("/assessments/{assessment_id}/hint")
async def get_hint(assessment_id: str, questionId: str):
    """Get an AI-generated hint for the current question. Does not reveal solution."""
    assessment = _get_assessment_or_404(assessment_id)
    problem = get_problem(questionId)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    current_q = get_current_question(assessment)
    attempt_count = 0
    if current_q:
        attempt_count = current_q.totalAttempts

    try:
        from langchain_core.prompts import ChatPromptTemplate
        llm = get_planner_llm()
        prompt = ChatPromptTemplate.from_template("""
You are a coding interview mentor. A candidate is stuck on this problem after {attempts} attempt(s).

Problem: {title}
Description: {description}
Expected Complexity: {complexity}
Topics: {topics}

Give a helpful hint that:
1. Points them toward the right algorithm/data structure approach
2. Does NOT reveal the solution or code
3. Is 2-3 sentences maximum
4. Mentions the key insight without giving it away
""")
        chain = prompt | llm
        response = await chain.ainvoke({
            "attempts": attempt_count,
            "title": problem["title"],
            "description": problem["description"][:300],
            "complexity": problem.get("expectedComplexity", {}).get("time", "O(n)"),
            "topics": ", ".join(problem.get("topics", [])),
        })
        return {"hint": response.content, "questionId": questionId}
    except Exception as e:
        logger.error(f"Hint generation failed: {e}")
        # Deterministic fallback hint
        topics = problem.get("topics", [])
        exp_time = problem.get("expectedComplexity", {}).get("time", "O(n)")
        return {
            "hint": f"Consider using a {topics[0] if topics else 'efficient'} approach. "
                    f"The expected time complexity is {exp_time}. "
                    f"Think about what data structure would let you avoid repeated work.",
            "questionId": questionId,
        }
