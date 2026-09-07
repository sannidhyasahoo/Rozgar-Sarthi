import json
import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from langchain_core.prompts import ChatPromptTemplate
from llm_factory import get_planner_llm
from langchain_core.messages import HumanMessage

router = APIRouter()

REPORTS_DIR = os.path.join(os.path.dirname(__file__), "..", "reports")

BLUEPRINT_PROMPT = """
You are an expert technical recruiter and engineering manager. You have been provided with the raw JSON diagnostics from an AI-conducted technical interview.

Your task is to synthesize this raw data into a highly detailed, 4-page diagnostic report formatted entirely in Markdown. 
Do NOT include any extra conversational text before or after the report. Just output the pure Markdown.

Here is the RAW INTERVIEW DATA:
{raw_data}

Generate the report following EXACTLY this Blueprint structure:

# Post-Interview Diagnostic Report

## PAGE 1: Executive Summary & Competency Breakdown

**Session ID**: {session_id}
**Date & Time**: {date_time}
**Targeted Position**: Backend Engineer (or inferred from data)

### Overall Hiring Calibration Badge
[State one of: Strong Hire | Hire | Needs Work | No Hire based on the overall score]

### Executive Summary
[A 2-3 sentence overview of candidate readiness and core evaluation takeaway]

### 5-Axis Competency Scorecard
- 🛠️ **Technical Depth**: [Score / 1.0] - [Brief reasoning based on data]
- 🏗️ **System Design**: [Score / 1.0] - [Brief reasoning based on data]
- 🧩 **Problem Solving**: [Score / 1.0] - [Brief reasoning based on data]
- 🗣️ **Communication Clarity**: [Score / 1.0] - [Brief reasoning based on data]
- 🎯 **Ownership Specificity**: [Score / 1.0] - [Brief reasoning based on data]

### Key Strengths & Critical Risk Areas
- **Verified Strengths**: [List strengths from data]
- **Key Risks & Red Flags**: [List weaknesses/evasions from data]

---

## PAGE 2: Actionable Coaching Feedback (Startup Feedback Style)

### 🎯 Role Alignment & Intentionality
**Prescriptive Recommendation**: [Concrete recommendation]
**Contextual Diagnosis**: [What was observed]

### ⭐ Behavioral & Achievement Storytelling (STAR Method)
**Prescriptive Recommendation**: [Concrete recommendation]
**Contextual Diagnosis**: [What was observed]

### 💻 Tech Stack Breakdown & Ownership Mapping
**Prescriptive Recommendation**: [Concrete recommendation]
**Contextual Diagnosis**: [What was observed]

### ⚖️ Technical Trade-off Analysis
**Prescriptive Recommendation**: [Concrete recommendation]
**Contextual Diagnosis**: [What was observed]

---

## PAGE 3: Evidence Graph & Buzzword Audit

### Claims Substantiation Table
Create a markdown table of the candidate's exact claims and whether they were Substantiated or Unsubstantiated.
Include a column for "Missing Details" if unsubstantiated.

### Evasion & Pressure Trajectory
Provide an analysis of the candidate's performance under pressure. How many times did they dodge questions? Did they crack under Level 5 pressure?

---

## PAGE 4: Personalized Actionable Study Roadmap

### Demonstrated vs. Missing Concepts Summary
- **Demonstrated Concepts**: [List concepts]
- **Concepts Lacking Deep Evidence**: [List concepts]

### Actionable Study Recommendations
Provide a step-by-step list of technical topics to master before their next real interview.

### Recommended Next Steps
Suggest reading materials, system design exercises, or specific practice focus areas.
"""

@router.get("/list")
def list_reports():
    if not os.path.exists(REPORTS_DIR):
        return []
        
    reports = []
    for filename in os.listdir(REPORTS_DIR):
        if filename.endswith("_insights.json"):
            # Extract just the ID
            call_id = filename.replace("_insights.json", "")
            filepath = os.path.join(REPORTS_DIR, filename)
            
            # Get modified time
            mtime = os.path.getmtime(filepath)
            
            # Read snippet to get score/role if possible
            score = 0
            try:
                with open(filepath, "r") as f:
                    data = json.load(f)
                    score = data.get("overall_score", 0)
            except:
                pass
                
            reports.append({
                "id": call_id,
                "timestamp": mtime,
                "score": score,
                "filename": filename
            })
            
    # Sort by newest first
    reports.sort(key=lambda x: x["timestamp"], reverse=True)
    return reports

@router.get("/{call_id}/generate")
async def generate_blueprint_report(call_id: str):
    file_path = os.path.join(REPORTS_DIR, f"{call_id}_insights.json")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Report not found")
        
    with open(file_path, "r") as f:
        data = json.load(f)
        
    prompt = ChatPromptTemplate.from_template(BLUEPRINT_PROMPT)
    
    # We must use gemini-3.7-flash (configured via settings/get_planner_llm)
    llm = get_planner_llm()
    
    chain = prompt | llm
    
    # Generate the report on the fly
    try:
        response = await chain.ainvoke({
            "raw_data": json.dumps(data, indent=2),
            "session_id": data.get("session_id", call_id),
            "date_time": data.get("last_updated", "Unknown Date")
        })
        return {"markdown": response.content}
    except Exception as e:
        print(f"Error generating blueprint report: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate AI report")
