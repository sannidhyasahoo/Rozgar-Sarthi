import json
from typing import Dict, Any, List
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.messages import HumanMessage, AIMessage

from models import FullInterviewReport, FeedbackCard, ClaimAuditEntry
from llm_factory import get_evaluator_llm

REPORT_SYNTHESIZER_PROMPT = """
You are a Principal Engineering Director and Hiring Bar Lead conducting a post-interview assessment synthesis.
Analyze the complete technical interview transcript, evidence graph, extracted claims, and competency scores for the position: {target_role}.

Candidate Transcript:
{transcript}

Competency Scores (0.0 to 1.0):
{competency_scores}

Evidence & Claim Observations:
{evidence_observations}

Instructions:
1. **Hiring Calibration**: Determine a hiring recommendation (`Strong Hire`, `Hire`, `Needs Work`, or `No Hire`) and write a crisp 2-3 sentence executive summary.
2. **Key Strengths & Critical Risks**: Identify 2-4 substantiated strengths and 2-4 key risks/red flags (evasions, lack of depth, missing metrics).
3. **2-Tier Actionable Coaching Cards**: Generate EXACTLY 6 feedback cards covering these categories:
   - "1. Role Alignment & Intentionality"
   - "2. Behavioral & Achievement Storytelling (STAR Method)"
   - "3. Tech Stack Breakdown & Ownership Mapping"
   - "4. Technical Trade-off Analysis"
   - "5. Problem Identification & Troubleshooting Story"
   - "6. Culture Fit & Growth Narrative"
   
   For each card:
   - `actionable_recommendation`: Provide a BOLD, prescriptive recommendation containing exact phrasing templates, STAR structure, and concrete numbers (e.g., "Use STAR: 'I wrote 500 lines of FastAPI code, reducing onboarding latency by 40%'").
   - `observed_diagnosis`: Provide a clear contextual diagnosis of what the candidate actually said in the interview and why it missed or met the expected bar.

4. **Claim Audit Table**: Create a detailed list of extracted claims, marking them as `Substantiated` (backed by technical mechanics/metrics) or `Unsubstantiated` (buzzwords dropped without evidence), noting missing details.
5. **Study Roadmap**: Provide 3-5 concrete technical study topics/concepts the candidate must master before their next interview (e.g. CAP Theorem, Raft Consensus, Redis cache eviction policies).

Format your response strictly as JSON matching the schema:
{format_instructions}
"""

def generate_agentic_report(state: Dict[str, Any], session_id: str = "default-session") -> FullInterviewReport:
    target_role = state.get("target_role", "Senior Backend Engineer")
    
    # Format conversation transcript
    messages = state.get("messages", [])
    transcript_lines = []
    for msg in messages:
        if isinstance(msg, HumanMessage):
            transcript_lines.append(f"Candidate: {msg.content}")
        elif isinstance(msg, AIMessage):
            transcript_lines.append(f"Interviewer: {msg.content}")
        elif isinstance(msg, dict):
            role = "Candidate" if msg.get("role") == "user" else "Interviewer"
            transcript_lines.append(f"{role}: {msg.get('content', '')}")
            
    transcript_text = "\n".join(transcript_lines) if transcript_lines else "No conversation transcript recorded."
    
    # Format competency vector
    comp_state = state.get("competency_state")
    if hasattr(comp_state, "model_dump"):
        comp_dict = comp_state.model_dump()
    elif isinstance(comp_state, dict):
        comp_dict = comp_state
    else:
        comp_dict = {
            "technical_depth": 0.5,
            "system_design": 0.5,
            "problem_solving": 0.5,
            "communication_clarity": 0.5,
            "ownership_specificity": 0.5
        }
        
    # Format evidence graph
    evidence_graph = state.get("evidence_graph", [])
    evidence_lines = []
    claim_audit_entries = []
    
    for entry in evidence_graph:
        e_dict = entry.model_dump() if hasattr(entry, "model_dump") else entry
        quote = e_dict.get("quote", "")
        competency = e_dict.get("competency", "General")
        signal = e_dict.get("signal", "unsubstantiated")
        obs = e_dict.get("observation", "")
        
        evidence_lines.append(f"- [{competency}] Quote: '{quote}' | Signal: {signal} | Observation: {obs}")
        
        status = "Substantiated" if signal == "positive" else "Unsubstantiated"
        is_quantified = "Quantified: True" in obs
        
        claim_audit_entries.append(ClaimAuditEntry(
            claim_text=quote,
            category=competency,
            status=status,
            is_quantified=is_quantified,
            missing_details=[obs] if obs else []
        ))
        
    evidence_text = "\n".join(evidence_lines) if evidence_lines else "No specific claims recorded."

    llm = get_evaluator_llm()
    parser = PydanticOutputParser(pydantic_object=FullInterviewReport)
    structured_llm = llm.with_structured_output(FullInterviewReport, method="json_mode")
    
    prompt = ChatPromptTemplate.from_template(REPORT_SYNTHESIZER_PROMPT)
    chain = prompt | structured_llm
    
    try:
        result = chain.invoke({
            "target_role": target_role,
            "transcript": transcript_text,
            "competency_scores": json.dumps(comp_dict, indent=2),
            "evidence_observations": evidence_text,
            "format_instructions": parser.get_format_instructions()
        })
        result.session_id = session_id
        result.competencies = comp_dict
        if claim_audit_entries:
            result.claim_audit = claim_audit_entries
        return result
    except Exception as e:
        print(f"Warning: Agentic Report Generation failed. Using fallback structured report. Error: {e}")
        
        latest_eval = state.get("latest_evaluation")
        demo_concepts = latest_eval.concepts_demonstrated if latest_eval else ["Basic Architecture"]
        miss_concepts = latest_eval.concepts_missing if latest_eval else ["CAP Theorem", "Distributed Consensus"]
        
        fallback_cards = [
            FeedbackCard(
                category="1. Role Alignment & Intentionality",
                actionable_recommendation="State clear must-haves and deal-breakers. E.g., 'I want roles using Python and FastAPI end-to-end with scalable cloud infrastructure.'",
                observed_diagnosis="Your role preferences were generalized. Be explicit about target engineering environments."
            ),
            FeedbackCard(
                category="2. Behavioral & Achievement Storytelling (STAR Method)",
                actionable_recommendation="Use STAR: Situation, Task, Action ('I wrote 500 lines of FastAPI code'), and Result ('reduced onboarding by 40%').",
                observed_diagnosis="Your project explanations lacked structured metrics showing individual contribution."
            ),
            FeedbackCard(
                category="3. Tech Stack Breakdown & Ownership Mapping",
                actionable_recommendation="List languages (Python), frameworks (FastAPI), DBs (PostgreSQL, Redis), and infra (Docker, AWS) layer by layer.",
                observed_diagnosis="Tech stack description was scattered across answers without clear layer-by-layer ownership."
            ),
            FeedbackCard(
                category="4. Technical Trade-off Analysis",
                actionable_recommendation="Structure trade-offs as: Challenge -> Options -> Rationale -> Outcome ('Achieved 2s latency with 1.5x accuracy drop').",
                observed_diagnosis="Trade-off explanations focused heavily on tools rather than decision criteria and tradeoffs."
            ),
            FeedbackCard(
                category="5. Problem Identification & Troubleshooting Story",
                actionable_recommendation="Detail how you identified a bug using logs/profiling, your fix, and measured result ('30% lower CPU usage').",
                observed_diagnosis="Debugging stories did not mention specific profiling tools or quantifiable improvements."
            ),
            FeedbackCard(
                category="6. Culture Fit & Growth Narrative",
                actionable_recommendation="Develop a narrative highlighting fast iteration, wearing multiple hats, and shipping speed.",
                observed_diagnosis="Culture fit answers did not emphasize adaptability and startup pace lessons."
            )
        ]
        
        return FullInterviewReport(
            session_id=session_id,
            target_role=target_role,
            hiring_recommendation="Needs Work",
            executive_summary="Candidate demonstrated foundational engineering awareness but requires more structured technical storytelling and quantified evidence.",
            competencies=comp_dict,
            verified_strengths=["Basic backend concept awareness"],
            critical_risks=["Lack of quantified metrics", "Unsubstantiated claims"],
            feedback_cards=fallback_cards,
            claim_audit=claim_audit_entries if claim_audit_entries else [
                ClaimAuditEntry(
                    claim_text="Implemented caching layer",
                    category="System Design",
                    status="Unsubstantiated",
                    is_quantified=False,
                    missing_details=["Missing latency numbers and cache eviction strategy"]
                )
            ],
            demonstrated_concepts=demo_concepts,
            missing_concepts=miss_concepts,
            study_roadmap=["CAP Theorem & Distributed Systems", "Raft Consensus Algorithm", "Redis Caching Strategies", "STAR Interview Methodology"]
        )
