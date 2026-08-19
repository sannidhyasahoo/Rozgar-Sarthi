from typing import TypedDict, Annotated, List, Optional
from langchain_core.messages import BaseMessage, AIMessage, HumanMessage
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from models import CompetencyVector, EvidenceEntry, EvaluatorOutput
from evaluator import run_evaluator
from planner import run_planner

class InterviewState(TypedDict):
    messages: List[BaseMessage]
    competency_state: CompetencyVector
    evidence_graph: List[EvidenceEntry]
    latest_evaluation: Optional[EvaluatorOutput]
    current_pressure_level: int
    target_role: str
    turn_count: int
    question_history: List[str]
    consecutive_evasions: int

def evaluate_node(state: InterviewState) -> InterviewState:
    messages = state["messages"]
    if not messages:
        return state
        
    last_message = messages[-1]
    if not isinstance(last_message, HumanMessage):
        # We only evaluate human responses
        return state

    eval_output = run_evaluator(
        candidate_response=last_message.content,
        target_role=state["target_role"],
        current_pressure_level=state["current_pressure_level"]
    )
    
    # Update competency vector
    new_comp = CompetencyVector(**state["competency_state"].model_dump())
    for comp, delta in eval_output.competency_deltas.items():
        if hasattr(new_comp, comp):
            current = getattr(new_comp, comp)
            setattr(new_comp, comp, max(0.0, min(1.0, current + delta)))
            
    # Append evidence entries
    new_evidence = list(state["evidence_graph"])
    for claim in eval_output.extracted_claims:
        entry = EvidenceEntry(
            turn_id=state["turn_count"],
            competency=claim.category,
            quote=claim.claim_text,
            signal="positive" if claim.has_evidence else "unsubstantiated",
            observation=f"Quantified: {claim.is_quantified}. Missing: {', '.join(claim.missing_details)}"
        )
        new_evidence.append(entry)
        
    is_dodging = any(claim.is_dodging_question for claim in eval_output.extracted_claims)
    consecutive_evasions = state.get("consecutive_evasions", 0)
    if is_dodging:
        consecutive_evasions += 1
    else:
        consecutive_evasions = 0
        
    return {
        "latest_evaluation": eval_output,
        "competency_state": new_comp,
        "evidence_graph": new_evidence,
        "current_pressure_level": eval_output.pressure_level_recommended,
        "consecutive_evasions": consecutive_evasions
    }

def plan_node(state: InterviewState) -> InterviewState:
    eval_output = state["latest_evaluation"]
    
    if eval_output:
        planner_output = run_planner(
            target_role=state["target_role"],
            pressure_level=state["current_pressure_level"],
            probe_direction=eval_output.probe_direction,
            concepts_demonstrated=eval_output.concepts_demonstrated,
            concepts_missing=eval_output.concepts_missing,
            claims=[c.model_dump() for c in eval_output.extracted_claims],
            question_history=state.get("question_history", []),
            consecutive_evasions=state.get("consecutive_evasions", 0)
        )
        next_question = planner_output.next_question
    else:
        # First turn, generic intro
        next_question = f"Hi, I'm your interviewer for the {state['target_role']} position. Could you start by telling me about a recent complex project you led?"
    
    new_messages = list(state["messages"])
    new_messages.append(AIMessage(content=next_question))
    
    new_history = list(state.get("question_history", []))
    new_history.append(next_question)
    
    return {
        "messages": new_messages,
        "turn_count": state["turn_count"] + 1,
        "latest_evaluation": state["latest_evaluation"], # Keep existing if any
        "question_history": new_history
    }

def create_interview_engine():
    workflow = StateGraph(InterviewState)
    
    workflow.add_node("evaluate", evaluate_node)
    workflow.add_node("plan", plan_node)
    
    workflow.add_edge(START, "plan")
    workflow.add_edge("plan", END)
    # The evaluation happens when user replies, so realistically the loop is:
    # User -> evaluate -> plan -> wait for User
    
    # Wait, the prompt says START -> evaluate_node -> plan_node -> END.
    # We will build it so that when invoked with a new human message, it runs evaluate -> plan -> END.
    workflow = StateGraph(InterviewState)
    workflow.add_node("evaluate", evaluate_node)
    workflow.add_node("plan", plan_node)
    
    workflow.add_edge(START, "evaluate")
    workflow.add_edge("evaluate", "plan")
    workflow.add_edge("plan", END)
    
    memory = MemorySaver()
    return workflow.compile(checkpointer=memory)
