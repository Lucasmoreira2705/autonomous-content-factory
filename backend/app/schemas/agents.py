from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class ScriptScene(BaseModel):
    scene_id: str
    start_time: float = Field(ge=0)
    end_time: float = Field(gt=0)
    narration: str
    visual: str
    text: str | None = None
    effect: str | None = None
    transition: str | None = None


class ScriptAgentInput(BaseModel):
    idea_id: str
    theme: str
    niche: str
    language: str = "pt-BR"
    target_duration_seconds: int = Field(default=75, ge=30, le=120)
    factual_sources: list[dict] = Field(default_factory=list)
    previous_script: dict | None = None
    mandatory_corrections: list[str] = Field(default_factory=list)


class ScriptAgentOutput(BaseModel):
    title: str
    hook: str
    script: str
    narrative_structure: str
    narration: str
    scenes: list[ScriptScene]
    on_screen_text: list[str] = Field(default_factory=list)
    visual_keywords: list[str] = Field(default_factory=list)
    image_suggestions: list[str] = Field(default_factory=list)
    video_suggestions: list[str] = Field(default_factory=list)
    effects_suggested: list[str] = Field(default_factory=list)
    cta: str | None = None
    estimated_duration_seconds: int = Field(ge=30, le=120)
    factual_claims: list[dict] = Field(default_factory=list)


class ReviewScores(BaseModel):
    score_geral: float = Field(ge=0, le=100)
    score_gancho: float = Field(ge=0, le=100)
    score_retencao: float = Field(ge=0, le=100)
    score_originalidade: float = Field(ge=0, le=100)
    score_clareza: float = Field(ge=0, le=100)
    score_factualidade: float = Field(ge=0, le=100)


class ScriptReviewInput(BaseModel):
    idea: dict
    script: ScriptAgentOutput
    minimum_score: float = Field(default=80, ge=0, le=100)
    target_duration_seconds: int = 75


class ScriptReviewOutput(BaseModel):
    decision: Literal["APROVADO", "REPROVADO"]
    scores: ReviewScores
    problems: list[str] = Field(default_factory=list)
    mandatory_corrections: list[str] = Field(default_factory=list)
    factual_risks: list[str] = Field(default_factory=list)
    copyright_risks: list[str] = Field(default_factory=list)
    visual_feasibility_notes: list[str] = Field(default_factory=list)
    reason: str
