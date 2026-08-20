from pydantic import BaseModel, Field, model_validator
from typing import List, Dict, Optional

class Claim(BaseModel):
    claim_text: str
    category: str
    is_quantified: bool
    has_evidence: bool
    missing_details: List[str]
    is_dodging_question: bool = Field(default=False)

class CompetencyVector(BaseModel):
    technical_depth: float = Field(default=0.5, ge=0.0, le=1.0)
    system_design: float = Field(default=0.5, ge=0.0, le=1.0)
    problem_solving: float = Field(default=0.5, ge=0.0, le=1.0)
    communication_clarity: float = Field(default=0.5, ge=0.0, le=1.0)
    ownership_specificity: float = Field(default=0.5, ge=0.0, le=1.0)

    @model_validator(mode='after')
    def clamp_scores(self) -> 'CompetencyVector':
        self.technical_depth = max(0.0, min(1.0, self.technical_depth))
        self.system_design = max(0.0, min(1.0, self.system_design))
        self.problem_solving = max(0.0, min(1.0, self.problem_solving))
        self.communication_clarity = max(0.0, min(1.0, self.communication_clarity))
        self.ownership_specificity = max(0.0, min(1.0, self.ownership_specificity))
        return self

class EvidenceEntry(BaseModel):
    turn_id: int
    competency: str
    quote: str
    signal: str # "positive" | "negative" | "unsubstantiated"
    observation: str

class EvaluatorOutput(BaseModel):
    extracted_claims: List[Claim]
    concepts_demonstrated: List[str]
    concepts_missing: List[str]
    competency_deltas: Dict[str, float]
    pressure_level_recommended: int = Field(ge=1, le=5)
    probe_direction: str

class PlannerOutput(BaseModel):
    next_question: str
    targeted_competency: str
    rationale: str

class FeedbackCard(BaseModel):
    category: str  # e.g., "Role Alignment & Intentionality", "STAR Framework", "Tech Stack & Ownership", "Technical Trade-offs", "Debugging & Troubleshooting", "Culture Fit & Growth"
    actionable_recommendation: str  # Bold prescriptive advice with concrete examples/metrics
    observed_diagnosis: str  # Contextual breakdown of candidate's response vs expected bar

class ClaimAuditEntry(BaseModel):
    claim_text: str
    category: str
    status: str  # "Substantiated" | "Unsubstantiated"
    is_quantified: bool
    missing_details: List[str]

class FullInterviewReport(BaseModel):
    session_id: str
    target_role: str
    hiring_recommendation: str  # "Strong Hire" | "Hire" | "Needs Work" | "No Hire"
    executive_summary: str
    competencies: Dict[str, float]
    verified_strengths: List[str]
    critical_risks: List[str]
    feedback_cards: List[FeedbackCard]
    claim_audit: List[ClaimAuditEntry]
    demonstrated_concepts: List[str]
    missing_concepts: List[str]
    study_roadmap: List[str]
