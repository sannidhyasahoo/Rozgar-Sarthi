import os
import sys
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from dotenv import load_dotenv

from langchain_core.messages import HumanMessage, AIMessage
from models import CompetencyVector
from engine import create_interview_engine

load_dotenv()

console = Console()

def print_telemetry(state):
    console.print("\n[bold cyan]📊 Telemetry[/bold cyan]")
    console.print(f"[bold red]🏃 Evasion Tracker:[/bold red] {state.get('consecutive_evasions', 0)} consecutive evasions")
    
    q_history = state.get("question_history", [])
    if q_history:
        console.print("[bold green]📜 Recent Questions:[/bold green]")
        for q in q_history[-2:]:
            console.print(f"  - {q}")
    
    # Competency Vector Table
    comp = state["competency_state"]
    comp_table = Table(show_header=True, header_style="bold magenta")
    comp_table.add_column("Competency")
    comp_table.add_column("Score (0-1)")
    comp_table.add_row("Technical Depth", f"{comp.technical_depth:.2f}")
    comp_table.add_row("System Design", f"{comp.system_design:.2f}")
    comp_table.add_row("Problem Solving", f"{comp.problem_solving:.2f}")
    comp_table.add_row("Communication", f"{comp.communication_clarity:.2f}")
    comp_table.add_row("Ownership", f"{comp.ownership_specificity:.2f}")
    console.print(comp_table)
    
    # Evaluation Details
    eval_out = state["latest_evaluation"]
    if eval_out:
        console.print(f"[yellow]🎯 Recommended Pressure Level:[/yellow] {eval_out.pressure_level_recommended}")
        console.print(f"[yellow]🎯 Probe Direction:[/yellow] {eval_out.probe_direction}")
        
        if eval_out.extracted_claims:
            console.print("[bold blue]🔍 Extracted Claims[/bold blue]")
            for c in eval_out.extracted_claims:
                status = "✅ Substantiated" if c.has_evidence else "⚠️ Unsubstantiated"
                console.print(f"- {c.claim_text} ({status})")
                if c.missing_details:
                    console.print(f"  Missing: {', '.join(c.missing_details)}")

def main():
    if not os.getenv("GEMINI_API_KEY") and not os.getenv("GROQ_API_KEY"):
        console.print("[bold red]Error: You must set GEMINI_API_KEY or GROQ_API_KEY in .env[/bold red]")
        sys.exit(1)

    console.print(Panel.fit("Welcome to Rozgar Sarthi Interview Simulation", style="bold green"))
    
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
        console.print(f"\n[bold green]AI Interviewer:[/bold green] {last_message.content}")
        
        # Get User Input
        try:
            user_input = console.input("\n[bold yellow]Candidate (You):[/bold yellow] ")
            if user_input.lower() in ["exit", "quit"]:
                break
        except (KeyboardInterrupt, EOFError):
            break
            
        state["messages"].append(HumanMessage(content=user_input))
        
        with console.status("[bold cyan]Processing AI Turn...[/bold cyan]"):
            state = engine.invoke(state, config)
            
        print_telemetry(state)

if __name__ == "__main__":
    main()
