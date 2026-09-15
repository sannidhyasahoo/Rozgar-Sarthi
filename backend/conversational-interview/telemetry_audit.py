"""
telemetry_audit.py
Comprehensive real-time telemetry and audit logging for Rozgar Sarthi.
Renders beautiful terminal audits for LangGraph graph execution, competency shifts,
claim extractions, resume ingestion, coding assessments, and diagnostic reports.
"""

import time
from typing import Optional, List, Dict, Any
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.columns import Columns
from rich.text import Text
from rich import box

console = Console()

def format_score_bar(score: float, width: int = 15) -> str:
    """Returns a visual colored bar for a 0.0 - 1.0 score."""
    clamped = max(0.0, min(1.0, score))
    filled = int(round(clamped * width))
    empty = width - filled
    bar = "█" * filled + "░" * empty
    if clamped >= 0.75:
        return f"[bold green]{bar}[/bold green] [bold white]{clamped:.2f}[/bold white]"
    elif clamped >= 0.45:
        return f"[bold yellow]{bar}[/bold yellow] [bold white]{clamped:.2f}[/bold white]"
    else:
        return f"[bold red]{bar}[/bold red] [bold white]{clamped:.2f}[/bold white]"

def format_delta(delta: float) -> str:
    if delta > 0:
        return f"[bold green]+{delta:.2f} ▲[/bold green]"
    elif delta < 0:
        return f"[bold red]{delta:.2f} ▼[/bold red]"
    return "[dim] 0.00 -[/dim]"

def audit_resume_upload(filename: str, profile_data: Dict[str, Any]):
    """Prints audit for uploaded and parsed resume."""
    console.print("\n")
    table = Table(title="📄 RESUME INGESTION & CANDIDATE PROFILE AUDIT", box=box.ROUNDED, header_style="bold cyan")
    table.add_column("Attribute", style="bold white", width=22)
    table.add_column("Extracted Data", style="white")

    name = profile_data.get("name", "Unknown")
    role = profile_data.get("targetRole", "Software Engineer")
    skills = ", ".join(profile_data.get("skills", [])[:8]) or "None extracted"
    experience = profile_data.get("experience", [])
    projects = profile_data.get("projects", [])

    table.add_row("File Ingested", filename)
    table.add_row("Candidate Name", f"[bold green]{name}[/bold green]")
    table.add_row("Target Role", f"[bold yellow]{role}[/bold yellow]")
    table.add_row("Top Skills", skills)
    table.add_row("Work Experience", f"{len(experience)} position(s) extracted")
    table.add_row("Projects", f"{len(projects)} project(s) extracted")

    console.print(Panel(table, title="[bold green]✅ RESUME AUDIT[/bold green]", border_style="green", box=box.DOUBLE))

def audit_langgraph_turn(
    turn_count: int,
    call_id: str,
    target_role: str,
    candidate_response: str,
    prev_comp_state: Any,
    result_state: Dict[str, Any],
    duration_ms: Optional[float] = None
):
    """Renders comprehensive LangGraph node execution telemetry and audit."""
    console.print("\n" + "=" * 75)
    header_text = Text(f"⚡ LANGGRAPH TELEMETRY & AUDIT — TURN #{turn_count}", style="bold white on blue")
    console.print(Panel(header_text, subtitle=f"Session / Thread: [bold yellow]{call_id}[/bold yellow] | Role: [bold cyan]{target_role}[/bold cyan]", box=box.HEAVY))

    # 1. Candidate Input Audit
    cand_panel = Panel(
        f"[italic white]\"{candidate_response}\"[/italic white]\n\n"
        f"[dim]Word Count: {len(candidate_response.split())} words" + 
        (f" | Latency: {duration_ms:.1f}ms" if duration_ms else "") + "[/dim]",
        title="[bold yellow]📥 Candidate Response Ingested[/bold yellow]",
        border_style="yellow",
        box=box.ROUNDED
    )
    console.print(cand_panel)

    eval_out = result_state.get("latest_evaluation")
    comp_state = result_state.get("competency_state")

    # 2. Competency Shift & Deltas Table
    if comp_state:
        comp_table = Table(title="📊 Real-Time Competency Vector Shift", box=box.ROUNDED, header_style="bold magenta")
        comp_table.add_column("Competency Dimension", style="bold white", width=24)
        comp_table.add_column("Score (0.00 - 1.00)", width=28)
        comp_table.add_column("Delta Shift", justify="center", width=14)

        deltas = eval_out.competency_deltas if eval_out else {}
        dimensions = [
            ("technical_depth", "Technical Depth"),
            ("system_design", "System Design"),
            ("problem_solving", "Problem Solving"),
            ("communication_clarity", "Communication Clarity"),
            ("ownership_specificity", "Ownership & Specificity"),
        ]

        for key, label in dimensions:
            score = getattr(comp_state, key, 0.5)
            delta = deltas.get(key, 0.0) if deltas else 0.0
            comp_table.add_row(label, format_score_bar(score), format_delta(delta))

        console.print(comp_table)

    # 3. Claims & Evidence Audit Table
    if eval_out and eval_out.extracted_claims:
        claims_table = Table(title="🔍 AI Evaluator Claims & Evidence Extraction", box=box.ROUNDED, header_style="bold cyan")
        claims_table.add_column("Claim Text", style="white", width=34)
        claims_table.add_column("Category", style="cyan", width=18)
        claims_table.add_column("Evidence Status", justify="center", width=18)
        claims_table.add_column("Missing Details / Gaps", style="dim", width=28)

        for c in eval_out.extracted_claims:
            status = "[bold green]✅ Substantiated[/bold green]" if c.has_evidence else "[bold red]⚠️ Unsubstantiated[/bold red]"
            quant = " [dim](Quantified)[/dim]" if getattr(c, 'is_quantified', False) else ""
            missing = ", ".join(c.missing_details) if c.missing_details else "[green]None[/green]"
            claims_table.add_row(f"{c.claim_text}{quant}", c.category, status, missing)

        console.print(claims_table)

    # 4. Pressure & Probe Tracker
    pressure = result_state.get("current_pressure_level", 1)
    evasions = result_state.get("consecutive_evasions", 0)
    
    pressure_labels = {
        1: "Level 1 (Light Clarification)",
        2: "Level 2 (Follow-up Probe)",
        3: "Level 3 (Evidence Request)",
        4: "Level 4 (Failure Mode & Scale)",
        5: "Level 5 (Counterexample / Edge Case)"
    }
    pressure_desc = pressure_labels.get(pressure, f"Level {pressure}")
    
    evasion_str = f"[bold red]⚠️ {evasions} consecutive evasions detected![/bold red]" if evasions > 0 else "[green]0 (Direct answers)[/green]"
    probe_dir = eval_out.probe_direction if eval_out else "Maintain trajectory"

    meta_table = Table(box=box.SIMPLE, show_header=False)
    meta_table.add_column("Metric", style="bold white", width=22)
    meta_table.add_column("Value", style="white")
    meta_table.add_row("Current Pressure:", f"[bold magenta]{pressure_desc}[/bold magenta]")
    meta_table.add_row("Evasion Tracker:", evasion_str)
    meta_table.add_row("Probe Direction:", f"[italic cyan]{probe_dir}[/italic cyan]")

    console.print(Panel(meta_table, title="[bold magenta]🎯 Planner Strategy & Pressure Dial[/bold magenta]", border_style="magenta", box=box.ROUNDED))

    # 5. Generated Next Question
    next_q = eval_out.next_question if eval_out else "Could you elaborate on that?"
    ai_q_panel = Panel(
        f"[bold green]\"{next_q}\"[/bold green]",
        title="[bold green]🤖 LangGraph Planner Output (Next Spoken Question)[/bold green]",
        border_style="green",
        box=box.DOUBLE
    )
    console.print(ai_q_panel)
    console.print("=" * 75 + "\n")

def audit_coding_execution(
    problem_id: str,
    language: str,
    passed_count: int,
    total_count: int,
    runtime_ms: float,
    status: str
):
    """Prints audit for coding test run."""
    console.print("\n")
    icon = "✅" if status == "pass" or passed_count == total_count else "❌"
    color = "green" if icon == "✅" else "red"
    
    table = Table(box=box.ROUNDED, header_style="bold cyan")
    table.add_column("Metric", style="bold white", width=20)
    table.add_column("Result", style="white")
    
    table.add_row("Problem ID", problem_id)
    table.add_row("Language", language.upper())
    table.add_row("Test Cases Passed", f"[{color}]{passed_count} / {total_count}[/{color}]")
    table.add_row("Runtime", f"{runtime_ms:.1f} ms")
    table.add_row("Status", f"[{color}]{status.upper()}[/{color}]")

    console.print(Panel(table, title=f"[bold {color}]{icon} CODING ASSESSMENT RUN AUDIT[/bold {color}]", border_style=color, box=box.ROUNDED))

def audit_coding_submission(
    assessment_id: str,
    problem_id: str,
    score: float,
    metrics: Dict[str, Any]
):
    """Prints audit when candidate submits coding problem."""
    console.print("\n")
    table = Table(box=box.ROUNDED, header_style="bold magenta")
    table.add_column("Evaluation Dimension", style="bold white", width=24)
    table.add_column("Score / Status", style="white")

    table.add_row("Assessment ID", assessment_id)
    table.add_row("Problem", problem_id)
    table.add_row("Composite Score", f"[bold green]{score:.1f}%[/bold green]")
    
    for k, v in metrics.items():
        table.add_row(k.replace("_", " ").title(), str(v))

    console.print(Panel(table, title="[bold magenta]🚀 CODING SUBMISSION & SKILL PROFILE AUDIT[/bold magenta]", border_style="magenta", box=box.DOUBLE))

def audit_report_generated(call_id: str, summary: Dict[str, Any]):
    """Prints audit for diagnostic report generation."""
    console.print("\n")
    table = Table(box=box.ROUNDED, header_style="bold green")
    table.add_column("Section", style="bold white", width=22)
    table.add_column("Insight", style="white")

    table.add_row("Session ID", call_id)
    table.add_row("Readiness Verdict", f"[bold yellow]{summary.get('verdict', 'Assessment Complete')}[/bold yellow]")
    table.add_row("Overall Score", f"[bold green]{summary.get('overall_score', 'N/A')}[/bold green]")
    table.add_row("Key Strengths", str(summary.get('strengths_count', 0)) + " identified")
    table.add_row("Growth Areas", str(summary.get('growth_areas_count', 0)) + " identified")

    console.print(Panel(table, title="[bold green]📊 DIAGNOSTIC REPORT GENERATED[/bold green]", border_style="green", box=box.DOUBLE))
