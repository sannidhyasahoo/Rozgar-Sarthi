import os
import sys
import time
from rich.console import Console
from rich.panel import Panel
from dotenv import load_dotenv

from langchain_core.messages import HumanMessage, AIMessage
from models import CompetencyVector
from engine import create_interview_engine
from telemetry_audit import audit_langgraph_turn

load_dotenv()

console = Console()

def main():
    if not os.getenv("GEMINI_API_KEY") and not os.getenv("GROQ_API_KEY") and not os.getenv("GOOGLE_API_KEY"):
        console.print("[bold red]Error: You must set GOOGLE_API_KEY / GEMINI_API_KEY or GROQ_API_KEY in backend/conversational-interview/.env[/bold red]")
        sys.exit(1)

    console.print(Panel.fit("🎙️ Welcome to Rozgar Sarthi Interview CLI Simulation", style="bold green"))
    
    engine = create_interview_engine()
    
    # Initialize State
    state = {
        "messages": [],
        "competency_state": CompetencyVector(),
        "evidence_graph": [],
        "latest_evaluation": None,
        "current_pressure_level": 1,
        "target_role": "Senior Backend Engineer",
        "turn_count": 0,
        "question_history": [],
        "consecutive_evasions": 0
    }
    
    # Trigger first question
    config = {"configurable": {"thread_id": "cli-session"}}
    state = engine.invoke(state, config)
    
    while True:
        # Print AI Question
        last_message = state["messages"][-1]
        console.print(f"\n[bold green]🤖 AI Interviewer:[/bold green] {last_message.content}")
        
        # Get User Input
        try:
            user_input = console.input("\n[bold yellow]👤 Candidate (You):[/bold yellow] ")
            if user_input.lower() in ["exit", "quit"]:
                break
        except (KeyboardInterrupt, EOFError):
            break
            
        state["messages"].append(HumanMessage(content=user_input))
        prev_comp = state.get("competency_state")
        
        start_t = time.time()
        with console.status("[bold cyan]Processing AI Turn & Running LangGraph...[/bold cyan]"):
            state = engine.invoke(state, config)
        duration_ms = (time.time() - start_t) * 1000
            
        audit_langgraph_turn(
            turn_count=state.get("turn_count", len(state.get("question_history", []))),
            call_id="cli-session",
            target_role=state.get("target_role", "Senior Backend Engineer"),
            candidate_response=user_input,
            prev_comp_state=prev_comp,
            result_state=state,
            duration_ms=duration_ms
        )

if __name__ == "__main__":
    main()
