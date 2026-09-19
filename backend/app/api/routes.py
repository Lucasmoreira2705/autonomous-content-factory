from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.database.models import (
    AnalyticsSnapshot,
    ApprovalResult,
    Channel,
    Idea,
    Job,
    LearningInsight,
    Publication,
    Script,
)
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


@router.get("/ui/dashboard")
def ui_dashboard(db: Session = Depends(get_db)) -> dict:
    ideas_total = db.scalar(select(func.count()).select_from(Idea)) or 0
    published_total = (
        db.scalar(
            select(func.count())
            .select_from(Publication)
            .where(Publication.status == "PUBLISHED")
        )
        or 0
    )

    terminal_statuses = {
        PipelineStatus.PUBLISHED.value,
        PipelineStatus.COMPLETED.value,
        PipelineStatus.NEEDS_INTERVENTION.value,
        PipelineStatus.PIPELINE_PAUSED.value,
    }
    error_statuses = {
        PipelineStatus.NEEDS_INTERVENTION.value,
        PipelineStatus.PUBLISH_FAILED.value,
        PipelineStatus.QUALITY_FAILED.value,
        PipelineStatus.FINAL_REJECTED.value,
    }

    all_jobs = db.scalars(select(Job).order_by(Job.created_at.desc()).limit(50)).all()
    active_jobs = sum(1 for job in all_jobs if job.status not in terminal_statuses)
    errors = sum(1 for job in all_jobs if job.status in error_statuses)

    pipeline_rows = db.execute(
        select(Job.status, func.count(Job.id)).group_by(Job.status)
    ).all()
    pipeline = {status: count for status, count in pipeline_rows}

    jobs = []
    for job in all_jobs:
        idea = db.get(Idea, job.idea_id)
        channel = db.get(Channel, job.channel_id)
        jobs.append(
            {
                "id": job.id,
                "title": (idea.provisional_title or idea.theme) if idea else job.id,
                "channel": channel.name if channel else "Sem canal",
                "status": job.status,
                "retry_count": job.retry_count,
                "script_revision_count": job.script_revision_count,
                "max_attempts": job.max_attempts,
                "target_duration_seconds": int(
                    (job.context_json or {}).get("target_duration_seconds", 75)
                ),
                "created_at": job.created_at.isoformat(),
            }
        )

    return {
        "totals": {
            "ideas": ideas_total,
            "jobs_active": active_jobs,
            "published": published_total,
            "errors": errors,
        },
        "jobs": jobs,
        "pipeline": pipeline,
    }


@router.get("/ui/channels")
def ui_channels(db: Session = Depends(get_db)) -> list[dict]:
    channels = db.scalars(select(Channel).order_by(Channel.created_at.asc())).all()
    return [
        {
            "id": channel.id,
            "name": channel.name,
            "niche": channel.niche,
            "language": channel.language,
            "voice": channel.voice,
            "timezone": channel.timezone,
            "is_active": channel.is_active,
        }
        for channel in channels
    ]


@router.get("/ui/publications")
def ui_publications(db: Session = Depends(get_db)) -> list[dict]:
    publications = db.scalars(
        select(Publication).order_by(Publication.created_at.desc()).limit(100)
    ).all()
    return [
        {
            "id": publication.id,
            "video_id": publication.video_id,
            "platform": publication.platform,
            "status": publication.status,
            "scheduled_at": publication.scheduled_at.isoformat() if publication.scheduled_at else None,
            "published_at": publication.published_at.isoformat() if publication.published_at else None,
            "url": publication.url,
            "retry_count": publication.retry_count,
        }
        for publication in publications
    ]


@router.get("/ui/learning")
def ui_learning(db: Session = Depends(get_db)) -> list[dict]:
    insights = db.scalars(
        select(LearningInsight).order_by(LearningInsight.created_at.desc()).limit(100)
    ).all()
    return [
        {
            "id": insight.id,
            "insight_type": insight.insight_type,
            "statement": insight.statement,
            "confidence": insight.confidence,
            "created_at": insight.created_at.isoformat(),
        }
        for insight in insights
    ]


@router.get("/ui/analytics")
def ui_analytics(db: Session = Depends(get_db)) -> list[dict]:
    snapshots = db.scalars(
        select(AnalyticsSnapshot).order_by(AnalyticsSnapshot.captured_at.desc()).limit(100)
    ).all()
    return [
        {
            "id": snapshot.id,
            "publication_id": snapshot.publication_id,
            "captured_at": snapshot.captured_at.isoformat(),
            "metrics": snapshot.metrics_json,
        }
        for snapshot in snapshots
    ]


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
