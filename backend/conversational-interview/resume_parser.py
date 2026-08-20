import io
import PyPDF2
from pydantic import ValidationError
from models import UserProfile
from llm_factory import get_evaluator_llm

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extracts raw text from a PDF file."""
    reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
    text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
    return text.strip()

def parse_resume_to_profile(resume_text: str) -> UserProfile:
    """Uses the evaluator LLM to extract a structured UserProfile from raw resume text."""
    from langchain_core.output_parsers import PydanticOutputParser
    from langchain_core.prompts import PromptTemplate
    
    llm = get_evaluator_llm()
    structured_llm = llm.with_structured_output(UserProfile, method="json_mode")
    parser = PydanticOutputParser(pydantic_object=UserProfile)
    
    prompt = f"""
You are an expert technical recruiter. Analyze the following raw resume text and extract the candidate's profile into the requested JSON schema.
Ensure you capture their name, core technical skills, detailed work experience (including duration and key achievements), and any major projects listed.

Format your response strictly as JSON matching the schema. Do not output markdown blocks, just the JSON string.
{parser.get_format_instructions()}

RESUME TEXT:
{resume_text}
"""
    try:
        profile = structured_llm.invoke(prompt)
        return profile
    except ValidationError as e:
        print(f"Validation error during resume parsing: {e}")
        # Return a fallback empty profile if parsing fails completely
        return UserProfile(name="Unknown Candidate", skills=[], experience=[], projects=[])
