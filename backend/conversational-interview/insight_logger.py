import json
import os
import asyncio
from datetime import datetime
from langchain_core.prompts import ChatPromptTemplate
from llm_factory import get_planner_llm

TIPS_PROMPT = """
Based on the following weaknesses from an interview, provide 1-2 actionable tips for the candidate. Keep them brief.

Weaknesses: {weaknesses}

Return ONLY a JSON array of strings. Example: ["Tip 1", "Tip 2"]
"""

async def save_session_insights(call_id: str, state: dict):
    # Ensure directory exists
    os.makedirs(os.path.join(os.path.dirname(__file__), "..", "reports"), exist_ok=True)
    file_path = os.path.join(os.path.dirname(__file__), "..", "reports", f"{call_id}_insights.json")
    
    comp_state = state.get("competency_state")
    competencies = comp_state.model_dump() if comp_state else {}
    
    evidence_graph = state.get("evidence_graph", [])
    evidence_log = []
    strengths = []
    weaknesses = []
    
    for entry in evidence_graph:
        e_dict = entry.model_dump() if hasattr(entry, "model_dump") else entry
        evidence_log.append(e_dict)
        
        if e_dict.get("signal") == "positive":
            strengths.append(f"Demonstrated in {e_dict.get('competency')}: {e_dict.get('quote')}")
        elif e_dict.get("signal") in ["negative", "unsubstantiated"]:
            weaknesses.append(f"Lacked evidence in {e_dict.get('competency')}: {e_dict.get('quote')}")

    tips = []
    if weaknesses:
        llm = get_planner_llm()
        prompt = ChatPromptTemplate.from_template(TIPS_PROMPT)
        # For background tasks, we can use invoke synchronously or ainvoke
        try:
            # simple json extraction
            response = await (prompt | llm).ainvoke({
                "weaknesses": " | ".join(weaknesses[:3]) # Send top 3
            })
            content = response.content.strip()
            if content.startswith("```json"):
                content = content[7:-3].strip()
            tips = json.loads(content)
        except Exception as e:
            tips = ["Always quantify your performance claims with baseline metrics."]

    insight_data = {
        "session_id": call_id,
        "last_updated": datetime.utcnow().isoformat() + "Z",
        "competencies": competencies,
        "evidence_log": evidence_log,
        "identified_strengths": strengths,
        "areas_for_improvement": weaknesses,
        "actionable_tips": tips
    }
    
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(insight_data, f, indent=4)
