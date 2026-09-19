from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.database.models import ApprovalResult, Channel, Idea, Job, Script
from app.database.session import get_db
from app.orchestrator.service import Orchestrator
from app.orchestrator.state_machine import PipelineStatus
from app.schemas.api import JobResponse, TopicJobCreate
from app.services.ollama.client import OllamaClient

router = APIRouter(prefix="/api/v1")


def _response(db: Session, job: Job, message: str) -> JobResponse:
    script = db.get(Script, job.script_id) if job.script_id else None
    approval = db.scalar(
        select(ApprovalResult)
        .where(ApprovalResult.job_id == job.id, ApprovalResult.stage == "SCRIPT")
        .order_by(ApprovalResult.created_at.desc())
        .limit(1)
    )
    return JobResponse(
        job_id=job.id,
        status=job.status,
        idea_id=job.idea_id,
        script_id=job.script_id,
        current_script_version=script.current_version if script else None,
        review_decision=approval.decision if approval else None,
        message=message,
    )


@router.get("/health")
async def health() -> dict:
    ollama_ok = await OllamaClient().health()
    return {
        "status": "ok" if ollama_ok else "degraded",
        "database": "ok",
        "ollama": "ok" if ollama_ok else "unavailable",
        "phase": "phase_1_core",
    }


@router.post("/jobs/from-topic", response_model=JobResponse)
async def create_job(payload: TopicJobCreate, db: Session = Depends(get_db)) -> JobResponse:
    settings = get_settings()
    channel: Channel | None = None
    if payload.channel_id:
        channel = db.get(Channel, payload.channel_id)
        if channel is None:
            raise HTTPException(status_code=404, detail="Channel not found")
    else:
        channel = db.scalar(select(Channel).where(Channel.name == "MVP Local").limit(1))
        if channel is None:
            channel = Channel(
                name="MVP Local",
                niche=payload.niche,
                language=payload.language,
                timezone=settings.default_timezone,
            )
            db.add(channel)
            db.commit()
            db.refresh(channel)

    idea = Idea(
        channel_id=channel.id,
        theme=payload.topic,
        provisional_title=payload.topic,
        category=payload.niche,
        audience="público geral",
        source_facts=[],
        suggested_sources=[],
        keywords=[],
        status="APPROVED",
    )
    db.add(idea)
    db.commit()
    db.refresh(idea)

    job = Job(
        channel_id=channel.id,
        idea_id=idea.id,
        status=PipelineStatus.IDEA_CREATED.value,
        max_attempts=settings.max_script_revisions,
        context_json={"target_duration_seconds": payload.target_duration_seconds},
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    if not payload.auto_run:
        return _response(db, job, "Job created and waiting for orchestrator")

    orchestrator = Orchestrator(db)
    final_job = await orchestrator.run_until_checkpoint(job.id)
    return _response(db, final_job, "Phase 1 script pipeline finished at checkpoint")


@router.post("/jobs/{job_id}/run", response_model=JobResponse)
async def run_job(job_id: str, db: Session = Depends(get_db)) -> JobResponse:
    job = db.get(Job, job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    orchestrator = Orchestrator(db)
    final_job = await orchestrator.run_until_checkpoint(job_id)
    return _response(db, final_job, "Orchestrator reached a checkpoint")


@router.get("/jobs/{job_id}", response_model=JobResponse)
def get_job(job_id: str, db: Session = Depends(get_db)) -> JobResponse:
    job = db.get(Job, job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return _response(db, job, "Job loaded")
