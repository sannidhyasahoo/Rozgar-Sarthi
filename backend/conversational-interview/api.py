import asyncio
import json
import logging
import os
from fastapi import FastAPI, Request, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.messages import HumanMessage, AIMessage

from models import CompetencyVector, UserProfile
from engine import create_interview_engine
from simulate_interview import print_telemetry
from insight_logger import save_session_insights
from resume_parser import extract_text_from_pdf, parse_resume_to_profile

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

PROFILES_DIR = os.path.join(os.path.dirname(__file__), "profiles")
os.makedirs(PROFILES_DIR, exist_ok=True)

@app.post("/api/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        text = extract_text_from_pdf(contents)
        profile = parse_resume_to_profile(text)
        
        # Save to mock user ID for MVP
        mock_user_id = "default-user"
        profile_path = os.path.join(PROFILES_DIR, f"{mock_user_id}.json")
        with open(profile_path, "w", encoding="utf-8") as f:
            f.write(profile.model_dump_json(indent=2))
            
        return {"status": "success", "profile": profile.model_dump()}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/chat/completions")
@app.post("/chat/completions")
async def chat_completions(request: Request):
    payload = await request.json()
    messages = payload.get("messages", [])
    
    # Extract candidate's latest response
    latest_msg = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")
    
    # Vapi sends the call object in the JSON payload for custom LLM requests
    call_id = payload.get("call", {}).get("id") or request.headers.get("X-Vapi-Call-Id", "default-session")

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
        import random
        fillers = [
            "That's an interesting point. Let me think about that for a second... ",
            "Got it. Let me just process what you just said... ",
            "Alright, I see what you mean. Hmm... ",
            "Okay, that makes sense. Moving on... ",
            "Understood. Give me just a moment here... "
        ]
        filler = random.choice(fillers)
        
        for word in filler.split(" "):
            chunk = {'id': 'chatcmpl-1', 'object': 'chat.completion.chunk', 'choices': [{'index': 0, 'delta': {'content': word + " "}}]}
            yield f"data: {json.dumps(chunk)}\n\n"
            await asyncio.sleep(0.01)
        
        # Check current state in memory
        current_state = engine.get_state(config)
        
        # If the state doesn't exist (new call), initialize the required fields
        if not current_state.values:
            initial_state = {
                "messages": langchain_messages,
                "competency_state": CompetencyVector(),
                "evidence_graph": [],
                "latest_evaluation": None,
                "current_pressure_level": 1,
                "target_role": "Backend Engineer",
                "turn_count": 0,
                "question_history": [],
                "consecutive_evasions": 0,
                "candidate_profile": None
            }
            
            # Try to load the mock candidate profile
            mock_user_id = "default-user"
            profile_path = os.path.join(PROFILES_DIR, f"{mock_user_id}.json")
            if os.path.exists(profile_path):
                try:
                    with open(profile_path, "r", encoding="utf-8") as f:
                        profile_data = json.load(f)
                        initial_state["candidate_profile"] = UserProfile(**profile_data)
                        
                        # Generate the identical dynamic greeting that the frontend used
                        first_name = profile_data.get("name", "").split(" ")[0]
                        target_role = initial_state["target_role"]
                        
                        context = "software engineering"
                        if profile_data.get("experience") and len(profile_data["experience"]) > 0:
                            context = profile_data["experience"][0].get("company", "software engineering")
                        elif profile_data.get("projects") and len(profile_data["projects"]) > 0:
                            context = profile_data["projects"][0]
                            
                        dynamic_greeting = f"Hi {first_name}, I'm your interviewer for the {target_role} position. To start off, could you tell me about your {context} experience?"
                        
                        # Prepend the AI's first message to the history so LangGraph knows what it asked
                        initial_state["messages"].insert(0, AIMessage(content=dynamic_greeting))
                except Exception as e:
                    logging.error(f"Failed to load candidate profile: {e}")
            input_state = initial_state
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
from fastapi import HTTPException

@app.get("/api/report/{call_id}")
async def get_report(call_id: str):
    file_path = os.path.join(os.path.dirname(__file__), "..", "reports", f"{call_id}_insights.json")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Report generating or not found")
    with open(file_path, "r") as f:
        return json.load(f)

@app.post("/api/reset")
async def reset_session():
    # Delete the mock profile so we can start fresh
    mock_user_id = "default-user"
    profile_path = os.path.join(PROFILES_DIR, f"{mock_user_id}.json")
    if os.path.exists(profile_path):
        try:
            os.remove(profile_path)
        except Exception as e:
            logging.error(f"Failed to delete profile: {e}")
            
    # Also delete any cached telemetry/state if needed
    # For now, memory state is per call_id, so refreshing the frontend handles it.
    return {"status": "success", "message": "Session and data cleared"}
