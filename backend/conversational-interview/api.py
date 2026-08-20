import asyncio
import json
import logging
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.messages import HumanMessage, AIMessage

from models import CompetencyVector
from engine import create_interview_engine
from simulate_interview import print_telemetry
from insight_logger import save_session_insights

# Set up logging for FastAPI to show our telemetry
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Rozgar Sarthi Voice Bridge")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = create_interview_engine()

@app.post("/api/chat/completions")
@app.post("/chat/completions")
async def chat_completions(request: Request):
    payload = await request.json()
    messages = payload.get("messages", [])
    
    # Extract candidate's latest response
    latest_msg = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")
    call_id = request.headers.get("X-Vapi-Call-Id", "default-session")

    # Build the full message history for LangGraph from the Vapi payload
    langchain_messages = []
    for m in messages:
        if m["role"] == "user":
            langchain_messages.append(HumanMessage(content=m["content"]))
        elif m["role"] == "assistant":
            langchain_messages.append(AIMessage(content=m["content"]))
    
    config = {"configurable": {"thread_id": call_id}}

    async def event_generator():
        # 1. Instantly yield filler to mask latency
        filler = "Hmm, okay... "
        yield f"data: {json.dumps({'id': 'chatcmpl-1', 'object': 'chat.completion.chunk', 'choices': [{'index': 0, 'delta': {'content': filler}}]})}\n\n"
        
        # Check current state in memory
        current_state = engine.get_state(config)
        
        # If the state doesn't exist (new call), initialize the required fields
        if not current_state.values:
            input_state = {
                "messages": langchain_messages,
                "competency_state": CompetencyVector(),
                "evidence_graph": [],
                "latest_evaluation": None,
                "current_pressure_level": 1,
                "target_role": "Senior Backend Engineer",
                "turn_count": 0
            }
        else:
            # We only need to provide the messages and let it run
            input_state = {"messages": langchain_messages}
            
        # 2. Run LangGraph Engine (Evaluation + Planning)
        result_state = await engine.ainvoke(input_state, config)
        
        # Print telemetry to terminal
        print_telemetry(result_state)
        
        # Extract the generated question from the latest AI message
        if result_state["messages"] and isinstance(result_state["messages"][-1], AIMessage):
            generated_question = result_state["messages"][-1].content
        else:
            generated_question = "Could you tell me more about that?"
            
        # Stream the actual question word by word
        for word in generated_question.split(" "):
            chunk = {'id': 'chatcmpl-1', 'object': 'chat.completion.chunk', 'choices': [{'index': 0, 'delta': {'content': word + " "}}]}
            yield f"data: {json.dumps(chunk)}\n\n"
            await asyncio.sleep(0.02) # Micro-sleep to ensure proper buffer streaming
            
        # Trigger background task to save insights without blocking the stream closure
        asyncio.create_task(save_session_insights(call_id, result_state))
            
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

import os
from fastapi import HTTPException, Query
from typing import Any, Dict, List, Optional

from coding_engine.candidate_state import get_candidate_profile
from coding_engine.curator import curate_questions, load_questions, parse_topics
from coding_engine.evaluator import evaluate_solution
from coding_engine.schemas import Question, SubmitRequest, SubmitResponse


@app.get("/api/report/{call_id}")
async def get_report(call_id: str):
    file_path = os.path.join(os.path.dirname(__file__), "..", "reports", f"{call_id}_insights.json")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Report generating or not found")
    with open(file_path, "r") as f:
        return json.load(f)


@app.get("/api/questions", response_model=List[Question])
def get_questions(
    topics: Optional[List[str]] = Query(
        default=None,
        description="Topics to filter by (e.g. ?topics=DP&topics=Strings)",
    )
):
    """Returns curated DSA coding questions filterable by topic."""
    try:
        all_questions = load_questions()
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))

    parsed_topics_list = parse_topics(topics)
    curated = curate_questions(
        questions=all_questions,
        requested_topics=parsed_topics_list,
        min_count=1,
        max_count=20,
    )
    return curated


@app.get("/api/questions/{question_id}", response_model=Question)
def get_question_by_id(question_id: str):
    """Returns details and test cases for a single question."""
    try:
        all_questions = load_questions()
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))

    target = next((q for q in all_questions if q.get("id") == question_id), None)
    if not target:
        raise HTTPException(status_code=404, detail=f"Question '{question_id}' not found")
    return target


@app.post("/api/submit", response_model=SubmitResponse)
def submit_solution(payload: SubmitRequest):
    """
    Accepts question_id and user Python code:
    1. Parses AST with Tree-sitter
    2. Runs test cases in safe Sandbox runner
    3. Analyzes algorithmic complexity
    4. Evaluates adaptive decision
    5. Returns evaluation results and updated candidate state
    """
    try:
        all_questions = load_questions()
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))

    target_question = next(
        (q for q in all_questions if q.get("id") == payload.question_id), None
    )
    if not target_question:
        raise HTTPException(
            status_code=404, detail=f"Question with ID '{payload.question_id}' not found"
        )

    result = evaluate_solution(target_question, payload.code)
    return result


@app.get("/api/candidate/state")
def get_state() -> Dict[str, Any]:
    """Returns the candidate's current competency profile and solved questions."""
    profile = get_candidate_profile()
    return {
        "candidate_id": profile.candidate_id,
        "topic_competency": profile.topic_competency,
        "solved_questions": profile.solved_questions,
        "solved_count": len(profile.solved_questions),
        "total_attempts": len(profile.attempt_history),
        "strengths": profile.strengths,
        "weaknesses": profile.weaknesses,
        "attempt_history": [a.model_dump() for a in profile.attempt_history],
    }

