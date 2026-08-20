import json
import os
import asyncio
from datetime import datetime
from report_generator import generate_agentic_report
from pdf_generator import compile_report_pdf

def finalize_interview_report(call_id: str, state: dict) -> str:
    """
    Synchronous / End-of-call handler:
    1. Generates Agentic FullInterviewReport.
    2. Saves JSON representation to reports/{call_id}_report.json.
    3. Compiles PDF to reports/{call_id}_report.pdf.
    Returns path to the compiled PDF file.
    """
    reports_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "reports"))
    os.makedirs(reports_dir, exist_ok=True)
    
    pdf_path = os.path.join(reports_dir, f"{call_id}_report.pdf")
    json_path = os.path.join(reports_dir, f"{call_id}_report.json")
    
    # 1. Synthesize Agentic Report
    report_obj = generate_agentic_report(state, session_id=call_id)
    
    # 2. Save JSON report
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(report_obj.model_dump(), f, indent=4)
        
    # 3. Compile PDF
    compile_report_pdf(report_obj, pdf_path)
    return pdf_path

async def save_session_insights(call_id: str, state: dict):
    """Async background wrapper for api.py streaming response closure."""
    try:
        loop = asyncio.get_running_loop()
        await loop.run_in_executor(None, finalize_interview_report, call_id, state)
    except Exception as e:
        print(f"Error saving session insights: {e}")
