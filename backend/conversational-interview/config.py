from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import model_validator
from typing import Literal

class Settings(BaseSettings):
    LLM_PROVIDER: Literal["gemini", "groq"] = "groq"
    GEMINI_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    
    # Defaults according to provider
    EVALUATOR_MODEL: str = "openai/gpt-oss-120b"
    PLANNER_MODEL: str = "openai/gpt-oss-120b"
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @model_validator(mode='after')
    def set_defaults(self):
        if not self.GEMINI_API_KEY and self.GOOGLE_API_KEY:
            self.GEMINI_API_KEY = self.GOOGLE_API_KEY
            
        if self.LLM_PROVIDER == "groq":
            if "gemini" in self.EVALUATOR_MODEL or not self.EVALUATOR_MODEL:
                self.EVALUATOR_MODEL = "openai/gpt-oss-120b"
            if "gemini" in self.PLANNER_MODEL or not self.PLANNER_MODEL:
                self.PLANNER_MODEL = "openai/gpt-oss-120b"
        elif self.LLM_PROVIDER == "gemini":
            if "gpt-oss" in self.EVALUATOR_MODEL or not self.EVALUATOR_MODEL:
                self.EVALUATOR_MODEL = "gemini-3.6-flash"
            if "gpt-oss" in self.PLANNER_MODEL or not self.PLANNER_MODEL:
                self.PLANNER_MODEL = "gemini-3.6-flash"
        return self

settings = Settings()
