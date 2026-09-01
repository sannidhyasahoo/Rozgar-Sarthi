from typing import TypedDict, Annotated, List, Optional
from langchain_core.messages import BaseMessage, AIMessage, HumanMessage
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from models import CompetencyVector, EvidenceEntry, EvaluatorOutput, UserProfile
from evaluator_planner import run_evaluator_planner

class InterviewState(TypedDict):
    messages: List[BaseMessage]
    candidate_profile: Optional[UserProfile]
    competency_state: CompetencyVector
    evidence_graph: List[EvidenceEntry]
    latest_evaluation: Optional[EvaluatorOutput]
    current_pressure_level: int
    target_role: str
    turn_count: int
    question_history: List[str]
    consecutive_evasions: int

def process_turn_node(state: InterviewState) -> InterviewState:
    messages = state["messages"]
    new_messages = list(messages)
    new_history = list(state.get("question_history", []))
    
    if not messages:
        # Turn 0: No messages at all. Provide generic intro.
        next_question = f"Hi, I'm your interviewer for the {state['target_role']} position. Could you start by telling me about a recent complex project you led?"
        new_messages.append(AIMessage(content=next_question))
        new_history.append(next_question)
        return {
            "messages": new_messages,
            "question_history": new_history,
            "turn_count": state.get("turn_count", 0)
        }
        
    last_message = messages[-1]
    
    # If the last message is NOT a human message (e.g., Turn 0 with dynamic greeting already injected by api.py)
    if not isinstance(last_message, HumanMessage):
        if new_messages and isinstance(new_messages[-1], AIMessage):
            next_question = new_messages[-1].content
            if not new_history:
                new_history.append(next_question)
        return {
            "messages": new_messages,
            "question_history": new_history,
            "turn_count": state.get("turn_count", 0)
        }

    # Extract stripped profile context to save tokens
    profile_context = None
    if state.get("candidate_profile"):
        profile_dict = state["candidate_profile"].model_dump()
        profile_context = {
            "experience": profile_dict.get("experience", [])[:1],
            "projects": profile_dict.get("projects", [])[:2]
        }

    # Single unified LLM call for both evaluating and planning
    eval_plan_output = run_evaluator_planner(
        candidate_response=last_message.content,
        target_role=state["target_role"],
        current_pressure_level=state["current_pressure_level"],
        question_history=state.get("question_history", [])[-2:],
        candidate_profile=profile_context
    )
    
    # --- 1. Update Competency Vector ---
    new_comp = CompetencyVector(**state["competency_state"].model_dump())
    for comp, delta in eval_plan_output.competency_deltas.items():
        if hasattr(new_comp, comp):
            current = getattr(new_comp, comp)
            setattr(new_comp, comp, max(0.0, min(1.0, current + delta)))
            
    # --- 2. Append Evidence Entries ---
    new_evidence = list(state["evidence_graph"])
    for claim in eval_plan_output.extracted_claims:
        entry = EvidenceEntry(
            turn_id=state["turn_count"],
            competency=claim.category,
            quote=claim.claim_text,
            signal="positive" if claim.has_evidence else "unsubstantiated",
            observation=f"Quantified: {claim.is_quantified}. Missing: {', '.join(claim.missing_details)}"
        )
        new_evidence.append(entry)
        
    is_dodging = any(claim.is_dodging_question for claim in eval_plan_output.extracted_claims)
    consecutive_evasions = state.get("consecutive_evasions", 0)
    if is_dodging:
        consecutive_evasions += 1
    else:
        consecutive_evasions = 0
        
    # --- 3. Append Planner output to messages ---
    next_question = eval_plan_output.next_question
    new_messages.append(AIMessage(content=next_question))
    new_history.append(next_question)

    return {
        "messages": new_messages,
        "question_history": new_history,
        "turn_count": state["turn_count"] + 1,
        "competency_state": new_comp,
        "evidence_graph": new_evidence,
        "current_pressure_level": eval_plan_output.pressure_level_recommended,
        "consecutive_evasions": consecutive_evasions,
        # We store the combined output in latest_evaluation for compatibility
        "latest_evaluation": eval_plan_output 
    }

def create_interview_engine():
    workflow = StateGraph(InterviewState)
    workflow.add_node("process_turn", process_turn_node)
    
    workflow.add_edge(START, "process_turn")
    workflow.add_edge("process_turn", END)
    
    memory = MemorySaver()
    return workflow.compile(checkpointer=memory)
