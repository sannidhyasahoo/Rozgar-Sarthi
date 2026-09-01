from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import model_validator
from typing import Literal

class Settings(BaseSettings):
    LLM_PROVIDER: Literal["gemini", "groq"] = "groq"
    GEMINI_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    GROQ_API_KEY_2: str = ""
    
    # Defaults according to spec
    EVALUATOR_MODEL: str = "openai/gpt-oss-120b"
    PLANNER_MODEL: str = "openai/gpt-oss-120b"
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @model_validator(mode='after')
    def set_groq_defaults(self):
        if self.LLM_PROVIDER == "groq":
            if self.EVALUATOR_MODEL == "gemini-2.5-flash":
                self.EVALUATOR_MODEL = "openai/gpt-oss-120b"
            if self.PLANNER_MODEL == "gemini-2.5-flash":
                self.PLANNER_MODEL = "openai/gpt-oss-120b"
        return self

settings = Settings()
