from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser

from models import EvaluatorOutput
from llm_factory import get_evaluator_llm

EVALUATOR_PROMPT = """
You are the Evaluation Engine for a technical interview.
You are a ruthless technical evaluator. Do NOT reward buzzwords. If a candidate says 'I used Kafka', that is NOT evidence of technical depth unless they explain *why* and *how*. Mark vague claims as `has_evidence = False`.
Your job is to analyze the candidate's latest response, extract claims, assess evidence, and determine competency changes.

Target Role: {target_role}
Current Pressure Level: {current_pressure_level}

Candidate Response:
{candidate_response}

Instructions:
1. Extract specific claims made by the candidate.
2. Determine if each claim has quantified evidence and missing details.
3. Identify concepts demonstrated and missing.
4. Calculate competency deltas (between -0.2 and +0.2) based on the quality of the response.
   Use EXACTLY these keys for the dictionary: "technical_depth", "system_design", "problem_solving", "communication_clarity", "ownership_specificity".
5. Recommend a new pressure level (1: Clarification to 5: Deep Dive/Counterexample).
6. Provide a probe direction for the next question.
7. If the candidate dodged the previous question, set `is_dodging_question = True` and decrement the `communication_clarity` score by 0.1 in the deltas.

Format your response strictly as JSON matching the schema.
{format_instructions}
"""

def run_evaluator(candidate_response: str, target_role: str, current_pressure_level: int) -> EvaluatorOutput:
    llm = get_evaluator_llm()
    structured_llm = llm.with_structured_output(EvaluatorOutput, method="json_mode")
    
    prompt = ChatPromptTemplate.from_template(EVALUATOR_PROMPT)
    chain = prompt | structured_llm
    
    parser = PydanticOutputParser(pydantic_object=EvaluatorOutput)
    
    try:
        result = chain.invoke({
            "candidate_response": candidate_response,
            "target_role": target_role,
            "current_pressure_level": current_pressure_level,
            "format_instructions": parser.get_format_instructions()
        })
        return result
    except Exception as e:
        print(f"Warning: Evaluator LLM failed to parse. Using fallback. Error: {e}")
        return EvaluatorOutput(
            extracted_claims=[],
            concepts_demonstrated=[],
            concepts_missing=[],
            competency_deltas={
                "technical_depth": 0.0,
                "system_design": 0.0,
                "problem_solving": 0.0,
                "communication_clarity": 0.0,
                "ownership_specificity": 0.0
            },
            pressure_level_recommended=1,
            probe_direction="Ask the candidate to clarify their previous statement."
        )
