from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from langchain_core.language_models.chat_models import BaseChatModel

from config import settings

def get_evaluator_llm() -> BaseChatModel:
    if settings.LLM_PROVIDER == "gemini":
        return ChatGoogleGenerativeAI(
            model=settings.EVALUATOR_MODEL,
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.1
        )
    elif settings.LLM_PROVIDER == "groq":
        return ChatGroq(
            model=settings.EVALUATOR_MODEL,
            api_key=settings.GROQ_API_KEY,
            temperature=0.1
        )
    else:
        raise ValueError(f"Unsupported LLM_PROVIDER: {settings.LLM_PROVIDER}")

def get_planner_llm() -> BaseChatModel:
    if settings.LLM_PROVIDER == "gemini":
        return ChatGoogleGenerativeAI(
            model=settings.PLANNER_MODEL,
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.7
        )
    elif settings.LLM_PROVIDER == "groq":
        return ChatGroq(
            model=settings.PLANNER_MODEL,
            api_key=settings.GROQ_API_KEY,
            temperature=0.7
        )
    else:
        raise ValueError(f"Unsupported LLM_PROVIDER: {settings.LLM_PROVIDER}")
