from pydantic import BaseModel, Field


class TopicJobCreate(BaseModel):
    topic: str = Field(min_length=3, max_length=500)
    channel_id: str | None = None
    niche: str = "curiosidades"
    language: str = "pt-BR"
    target_duration_seconds: int = Field(default=75, ge=30, le=120)
    auto_run: bool = True


class JobResponse(BaseModel):
    job_id: str
    status: str
    idea_id: str
    script_id: str | None = None
    current_script_version: int | None = None
    review_decision: str | None = None
    message: str
