from langchain_core.prompts import ChatPromptTemplate

from models import PlannerOutput
from llm_factory import get_planner_llm

PLANNER_PROMPT = """
You are a sharp, conversational engineering interviewer for the role: {target_role}.
Your goal is to ask the next interview question based on the evaluation of the candidate's last response.

Current Pressure Level: {pressure_level} (1=Light Clarification, 3=Evidence Request, 5=Counterexample/Edge Case)
Probe Direction: {probe_direction}

Evaluation Context:
- Demonstrated Concepts: {concepts_demonstrated}
- Missing Concepts: {concepts_missing}
- Extracted Claims: {claims}
- Consecutive Evasions: {consecutive_evasions}

Instructions:
1. Generate the next question for the candidate. The question must be direct, conversational, and spoken text (NO markdown, NO bullet points).
2. Adapt your tone to the pressure level. Higher pressure means more challenging and specific follow-ups.
3. State the targeted competency and your rationale for choosing this question.
4. Here are the previous questions you asked: {question_history}. DO NOT repeat yourself. If the candidate is dodging, escalate your tone slightly. If they dodged twice, gracefully pivot to a new technical topic to keep the interview moving.
5. Keep your next_question strictly under 25 words to optimize for future Voice TTS latency.

Format your response strictly as JSON matching the schema.
{format_instructions}
"""

def run_planner(
    target_role: str, 
    pressure_level: int, 
    probe_direction: str, 
    concepts_demonstrated: list[str], 
    concepts_missing: list[str], 
    claims: list[dict],
    question_history: list[str],
    consecutive_evasions: int
) -> PlannerOutput:
    from langchain_core.output_parsers import PydanticOutputParser
    llm = get_planner_llm()
    structured_llm = llm.with_structured_output(PlannerOutput, method="json_mode")
    
    prompt = ChatPromptTemplate.from_template(PLANNER_PROMPT)
    chain = prompt | structured_llm
    
    parser = PydanticOutputParser(pydantic_object=PlannerOutput)
    
    result = chain.invoke({
        "target_role": target_role,
        "pressure_level": pressure_level,
        "probe_direction": probe_direction,
        "concepts_demonstrated": concepts_demonstrated,
        "concepts_missing": concepts_missing,
        "claims": claims,
        "question_history": question_history,
        "consecutive_evasions": consecutive_evasions,
        "format_instructions": parser.get_format_instructions()
    })
    
    return result
