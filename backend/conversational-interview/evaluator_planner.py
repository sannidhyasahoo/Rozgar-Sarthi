from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser

from models import EvaluatorPlannerOutput
from llm_factory import get_planner_llm  # Using the planner LLM (usually less strict temperature)

EVALUATOR_PLANNER_PROMPT = """
You are an expert technical interviewer for the role: {target_role}.
Your task is to BOTH evaluate the candidate's last response AND generate the next interview question in a single step.

Current Pressure Level: {current_pressure_level} (1=Light Clarification, 3=Evidence Request, 5=Counterexample/Edge Case)

Candidate Profile Context (Experience & Projects):
{candidate_profile}

Candidate's Latest Response:
{candidate_response}

Past Questions Asked:
{question_history}

Instructions for Evaluation:
1. Extract specific claims made by the candidate. Do NOT reward buzzwords. Mark vague claims as `has_evidence = False`.
2. Calculate competency deltas (between -0.2 and +0.2). Use EXACTLY these keys: "technical_depth", "system_design", "problem_solving", "communication_clarity", "ownership_specificity".
3. Recommend a new pressure level (1 to 5).
4. Provide a probe direction. If the candidate dodged the question, set `is_dodging_question = True`.

Instructions for Planning the Next Question:
1. Generate the `next_question`. It must be direct, conversational, and spoken text (NO markdown).
2. Keep `next_question` strictly under 25 words to optimize voice latency.
3. CRITICAL: Use the Candidate Profile Context! When asking follow-ups, explicitly reference their past companies, roles, or projects.
4. Do NOT repeat questions from the Past Questions Asked.
"""

def run_evaluator_planner(
    candidate_response: str,
    target_role: str,
    current_pressure_level: int,
    question_history: list[str],
    candidate_profile: dict = None
) -> EvaluatorPlannerOutput:
    llm = get_planner_llm()
    structured_llm = llm.with_structured_output(EvaluatorPlannerOutput)
    
    prompt = ChatPromptTemplate.from_template(EVALUATOR_PLANNER_PROMPT)
    chain = prompt | structured_llm
    
    try:
        result = chain.invoke({
            "candidate_response": candidate_response,
            "target_role": target_role,
            "current_pressure_level": current_pressure_level,
            "question_history": question_history,
            "candidate_profile": candidate_profile or "No profile available."
        })
        return result
    except Exception as e:
        print(f"Warning: EvaluatorPlanner LLM failed to parse. Using fallback. Error: {e}")
        return EvaluatorPlannerOutput(
            extracted_claims=[],
            competency_deltas={
                "technical_depth": 0.0,
                "system_design": 0.0,
                "problem_solving": 0.0,
                "communication_clarity": 0.0,
                "ownership_specificity": 0.0
            },
            pressure_level_recommended=1,
            probe_direction="Ask for clarification.",
            next_question="Could you elaborate on that?"
        )
