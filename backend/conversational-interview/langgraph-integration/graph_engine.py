import os
from typing import TypedDict, List, Dict, Any
from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from langgraph.graph import StateGraph, START, END

# ==========================================
# 1. Pydantic Structured Output Model
# ==========================================
class ClaimEvaluation(BaseModel):
    extracted_claim: str = Field(
        description="The primary claim made by the candidate. Return 'None' if no technical claim."
    )
    is_supported: bool = Field(
        description="True if supported by numbers, metrics, or detailed logic; False if vague."
    )
    evidence_missing: str = Field(
        description="Specific baseline metrics, architecture choices, or measurements missing."
    )
    competency_tested: str = Field(
        description="Observed skill area (e.g., 'Database', 'System Design', 'Ownership', 'DSA')."
    )
    score_adjustment: float = Field(
        description="Score adjustment between -0.2 and +0.2 based on clarity and evidence."
    )

# ==========================================
# 2. State Schema
# ==========================================
class InterviewState(TypedDict):
    latest_response: str
    candidate_vector: Dict[str, float]
    pressure_level: int
    evidence_log: List[Dict[str, Any]]
    planner_directive: str
    next_question: str
    turn_count: int      
    final_report: str
# ==========================================
# 3. Initialize Gemini Models
# ==========================================
# Make sure to set GOOGLE_API_KEY in your terminal before running
llm_evaluator = ChatGoogleGenerativeAI(model="gemini-3.6-flash", temperature=0)
llm_speaker = ChatGoogleGenerativeAI(model="gemini-3.6-flash", temperature=0.7)

# ==========================================
# 4. Graph Nodes
# ==========================================
def evaluator_node(state: InterviewState) -> Dict[str, Any]:
    text = state.get("latest_response", "").strip()

    if len(text.split()) < 4:
        return {
            "evidence_log": state.get("evidence_log", []),
            "candidate_vector": state.get("candidate_vector", {}),
            "pressure_level": 1
        }

    eval_prompt = f"""
    You are an expert technical interviewer.
    Analyze this candidate's response:
    Extract their claim, check if it contains solid proof/metrics, and note what is missing.

    Candidate Response: "{text}"
    """

    structured_evaluator = llm_evaluator.with_structured_output(ClaimEvaluation)
    evaluation: ClaimEvaluation = structured_evaluator.invoke(eval_prompt)

    vector = state.get("candidate_vector", {}).copy()
    comp = evaluation.competency_tested or "General Technical"
    current_score = vector.get(comp, 0.5)
    vector[comp] = round(min(1.0, max(0.0, current_score + evaluation.score_adjustment)), 2)

    pressure = state.get("pressure_level", 1)
    if not evaluation.is_supported and evaluation.extracted_claim != "None":
        pressure = min(5, pressure + 1)
    elif evaluation.is_supported:
        pressure = max(1, pressure - 1)

    evidence_entry = {
        "claim": evaluation.extracted_claim,
        "supported": evaluation.is_supported,
        "missing": evaluation.evidence_missing,
        "competency": comp
    }
    updated_evidence_log = state.get("evidence_log", []) + [evidence_entry]

    return {
        "candidate_vector": vector,
        "pressure_level": pressure,
        "evidence_log": updated_evidence_log
    }

def planner_node(state: InterviewState) -> Dict[str, Any]:
    log = state.get("evidence_log", [])
    pressure = state.get("pressure_level", 1)

    if not log or log[-1]["claim"] == "None":
        directive = "Ask an open-ended technical question about their backend architecture experience."
    else:
        latest = log[-1]
        if pressure >= 2 and not latest["supported"]:
            directive = (
                f"Apply Evidence Pressure. Challenge claim: '{latest['claim']}'. "
                f"Demand this missing detail: {latest['missing']}."
            )
        elif pressure >= 4:
            directive = (
                f"Apply Edge-Case Pressure. Ask how their solution '{latest['claim']}' "
                f"handles high-load failures or bottlenecks."
            )
        else:
            directive = (
                f"Acknowledge their answer and ask a more advanced conceptual question "
                f"regarding {latest['competency']}."
            )

    return {"planner_directive": directive}

def speaker_node(state: InterviewState) -> Dict[str, Any]:
    directive = state.get("planner_directive", "")

    speaker_prompt = [
        SystemMessage(content=(
            "You are a senior technical interviewer speaking over voice. "
            "Generate a crisp 1-2 sentence response based on the directive. "
            "Be conversational, direct, and do not use bullet points or formatting."
        )),
        HumanMessage(content=f"Directive: {directive}")
    ]

    response = llm_speaker.invoke(speaker_prompt)
    # Extract only the plain text, ignoring metadata/signatures
    content = response.content
    if isinstance(content, list):
        final_question = " ".join([block.get("text", "") for block in content if "text" in block])
    else:
        final_question = str(content)

    return {"next_question": final_question}

def should_continue(state: InterviewState) -> str:
    """Decides whether to ask another question or end the interview."""
    if state.get("turn_count", 0) >= 3:
        return "grader"
    return "speaker"

def grader_node(state: InterviewState) -> Dict[str, Any]:
    """Generates the final evaluation report."""
    log = state.get("evidence_log", [])
    vector = state.get("candidate_vector", {})
    
    report_prompt = f"""
    You are an AI Hiring Manager. Review this interview data and write a short, 
    3-sentence final verdict (Hire/No Hire) based on their verified claims.
    
    Competency Scores: {vector}
    Evidence Log: {log}
    """
    
    response = llm_evaluator.invoke(report_prompt)
    
    content = response.content
    if isinstance(content, list):
        report = " ".join([block.get("text", "") for block in content if "text" in block])
    else:
        report = str(content)
        
    return {"final_report": report}
# ==========================================
# 5. Assemble and Compile the Graph
# ==========================================

workflow = StateGraph(InterviewState)

workflow.add_node("evaluator", evaluator_node)
workflow.add_node("planner", planner_node)
workflow.add_node("speaker", speaker_node)
workflow.add_node("grader", grader_node)

workflow.add_edge(START, "evaluator")
workflow.add_edge("evaluator", "planner")

workflow.add_conditional_edges(
    "planner",
    should_continue,
    {
        "speaker": "speaker",
        "grader": "grader"
    }
)

workflow.add_edge("speaker", END)
workflow.add_edge("grader", END)

interview_graph = workflow.compile()