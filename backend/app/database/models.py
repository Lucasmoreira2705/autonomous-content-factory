from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, JSON, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


def utcnow() -> datetime:
    return datetime.now(UTC)


def uuid_str() -> str:
    return str(uuid.uuid4())


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)


class Channel(Base, TimestampMixin):
    __tablename__ = "channels"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    niche: Mapped[str] = mapped_column(String(120), nullable=False)
    language: Mapped[str] = mapped_column(String(20), default="pt-BR", nullable=False)
    voice: Mapped[str | None] = mapped_column(String(120))
    template: Mapped[str | None] = mapped_column(String(120))
    timezone: Mapped[str] = mapped_column(String(64), default="America/Sao_Paulo", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    config_json: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)


class Idea(Base, TimestampMixin):
    __tablename__ = "ideas"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    channel_id: Mapped[str] = mapped_column(ForeignKey("channels.id", ondelete="CASCADE"), index=True)
    theme: Mapped[str] = mapped_column(String(255), nullable=False)
    provisional_title: Mapped[str | None] = mapped_column(String(255))
    hook: Mapped[str | None] = mapped_column(Text)
    category: Mapped[str | None] = mapped_column(String(120))
    subcategory: Mapped[str | None] = mapped_column(String(120))
    angle: Mapped[str | None] = mapped_column(Text)
    audience: Mapped[str | None] = mapped_column(String(255))
    retention_potential: Mapped[float | None] = mapped_column(Float)
    suggested_sources: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    keywords: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    source_facts: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    status: Mapped[str] = mapped_column(String(64), default="APPROVED", nullable=False)


class Script(Base, TimestampMixin):
    __tablename__ = "scripts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    idea_id: Mapped[str] = mapped_column(ForeignKey("ideas.id", ondelete="CASCADE"), unique=True, index=True)
    current_version: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[str] = mapped_column(String(64), default="DRAFT", nullable=False)


class ScriptVersion(Base, TimestampMixin):
    __tablename__ = "script_versions"
    __table_args__ = (UniqueConstraint("script_id", "version", name="uq_script_version"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    script_id: Mapped[str] = mapped_column(ForeignKey("scripts.id", ondelete="CASCADE"), index=True)
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    hook: Mapped[str] = mapped_column(Text, nullable=False)
    narrative_structure: Mapped[str] = mapped_column(Text, nullable=False)
    narration: Mapped[str] = mapped_column(Text, nullable=False)
    on_screen_text: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    visual_keywords: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    image_suggestions: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    video_suggestions: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    effects_suggested: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    cta: Mapped[str | None] = mapped_column(Text)
    scenes_json: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    duration_target_seconds: Mapped[int] = mapped_column(Integer, default=75, nullable=False)
    corrections_applied: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    raw_output: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)


class Job(Base, TimestampMixin):
    __tablename__ = "jobs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    channel_id: Mapped[str] = mapped_column(ForeignKey("channels.id", ondelete="CASCADE"), index=True)
    idea_id: Mapped[str] = mapped_column(ForeignKey("ideas.id", ondelete="CASCADE"), index=True)
    script_id: Mapped[str | None] = mapped_column(ForeignKey("scripts.id", ondelete="SET NULL"), index=True)
    video_id: Mapped[str | None] = mapped_column(ForeignKey("videos.id", ondelete="SET NULL"), index=True)
    status: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    retry_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    script_revision_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    max_attempts: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    reason_code: Mapped[str | None] = mapped_column(String(120))
    context_json: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    last_error: Mapped[str | None] = mapped_column(Text)


class StateEvent(Base):
    __tablename__ = "state_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    job_id: Mapped[str] = mapped_column(ForeignKey("jobs.id", ondelete="CASCADE"), index=True)
    from_status: Mapped[str] = mapped_column(String(64), nullable=False)
    to_status: Mapped[str] = mapped_column(String(64), nullable=False)
    reason: Mapped[str | None] = mapped_column(Text)
    payload_json: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)


class Video(Base, TimestampMixin):
    __tablename__ = "videos"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    script_id: Mapped[str] = mapped_column(ForeignKey("scripts.id", ondelete="CASCADE"), index=True)
    current_version: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    title: Mapped[str | None] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(64), default="PENDING", nullable=False)
    duration_seconds: Mapped[float | None] = mapped_column(Float)
    score: Mapped[float | None] = mapped_column(Float)
    thumbnail_path: Mapped[str | None] = mapped_column(Text)


class VideoVersion(Base, TimestampMixin):
    __tablename__ = "video_versions"
    __table_args__ = (UniqueConstraint("video_id", "version", name="uq_video_version"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    video_id: Mapped[str] = mapped_column(ForeignKey("videos.id", ondelete="CASCADE"), index=True)
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    file_path: Mapped[str | None] = mapped_column(Text)
    render_config_json: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    checksum: Mapped[str | None] = mapped_column(String(128))


class Scene(Base, TimestampMixin):
    __tablename__ = "scenes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    video_version_id: Mapped[str] = mapped_column(ForeignKey("video_versions.id", ondelete="CASCADE"), index=True)
    scene_index: Mapped[int] = mapped_column(Integer, nullable=False)
    start_time: Mapped[float] = mapped_column(Float, nullable=False)
    end_time: Mapped[float] = mapped_column(Float, nullable=False)
    narration: Mapped[str] = mapped_column(Text, nullable=False)
    visual: Mapped[str | None] = mapped_column(Text)
    text_overlay: Mapped[str | None] = mapped_column(Text)
    effect: Mapped[str | None] = mapped_column(String(120))
    transition: Mapped[str | None] = mapped_column(String(120))


class Asset(Base, TimestampMixin):
    __tablename__ = "assets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    scene_id: Mapped[str | None] = mapped_column(ForeignKey("scenes.id", ondelete="SET NULL"), index=True)
    asset_type: Mapped[str] = mapped_column(String(50), nullable=False)
    source_name: Mapped[str] = mapped_column(String(120), nullable=False)
    source_url: Mapped[str | None] = mapped_column(Text)
    license_type: Mapped[str | None] = mapped_column(String(120))
    attribution: Mapped[str | None] = mapped_column(Text)
    local_path: Mapped[str | None] = mapped_column(Text)
    checksum: Mapped[str | None] = mapped_column(String(128))
    metadata_json: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)


class Voiceover(Base, TimestampMixin):
    __tablename__ = "voiceovers"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    video_version_id: Mapped[str] = mapped_column(ForeignKey("video_versions.id", ondelete="CASCADE"), index=True)
    engine: Mapped[str] = mapped_column(String(80), nullable=False)
    voice_name: Mapped[str] = mapped_column(String(120), nullable=False)
    file_path: Mapped[str] = mapped_column(Text, nullable=False)
    duration_seconds: Mapped[float | None] = mapped_column(Float)
    config_json: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)


class ReviewResult(Base, TimestampMixin):
    __tablename__ = "review_results"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    job_id: Mapped[str] = mapped_column(ForeignKey("jobs.id", ondelete="CASCADE"), index=True)
    stage: Mapped[str] = mapped_column(String(80), nullable=False)
    subject_id: Mapped[str] = mapped_column(String(36), nullable=False)
    result: Mapped[str] = mapped_column(String(50), nullable=False)
    scores_json: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    issues_json: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    corrections_json: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    raw_output: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)


class ApprovalResult(Base, TimestampMixin):
    __tablename__ = "approval_results"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    job_id: Mapped[str] = mapped_column(ForeignKey("jobs.id", ondelete="CASCADE"), index=True)
    stage: Mapped[str] = mapped_column(String(80), nullable=False)
    subject_id: Mapped[str] = mapped_column(String(36), nullable=False)
    decision: Mapped[str] = mapped_column(String(50), nullable=False)
    reason: Mapped[str | None] = mapped_column(Text)
    score: Mapped[float | None] = mapped_column(Float)
    details_json: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)


class PublicationSlot(Base, TimestampMixin):
    __tablename__ = "publication_slots"
    __table_args__ = (UniqueConstraint("channel_id", "platform", "scheduled_at", name="uq_publication_slot"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    channel_id: Mapped[str] = mapped_column(ForeignKey("channels.id", ondelete="CASCADE"), index=True)
    platform: Mapped[str] = mapped_column(String(50), nullable=False)
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    video_id: Mapped[str | None] = mapped_column(ForeignKey("videos.id", ondelete="SET NULL"))
    status: Mapped[str] = mapped_column(String(50), default="AVAILABLE", nullable=False)


class Publication(Base, TimestampMixin):
    __tablename__ = "publications"
    __table_args__ = (UniqueConstraint("platform", "idempotency_key", name="uq_publication_idempotency"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    video_id: Mapped[str] = mapped_column(ForeignKey("videos.id", ondelete="CASCADE"), index=True)
    platform: Mapped[str] = mapped_column(String(50), nullable=False)
    scheduled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    platform_post_id: Mapped[str | None] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(50), nullable=False)
    url: Mapped[str | None] = mapped_column(Text)
    error: Mapped[str | None] = mapped_column(Text)
    retry_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    idempotency_key: Mapped[str] = mapped_column(String(255), nullable=False)
    metadata_json: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)


class AnalyticsSnapshot(Base):
    __tablename__ = "analytics"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    publication_id: Mapped[str] = mapped_column(ForeignKey("publications.id", ondelete="CASCADE"), index=True)
    captured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False, index=True)
    metrics_json: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)


class Agent(Base, TimestampMixin):
    __tablename__ = "agents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    role: Mapped[str] = mapped_column(String(120), nullable=False)
    model_name: Mapped[str | None] = mapped_column(String(120))
    enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    config_json: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)


class AgentRun(Base):
    __tablename__ = "agent_runs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    agent_name: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    job_id: Mapped[str] = mapped_column(ForeignKey("jobs.id", ondelete="CASCADE"), index=True)
    input_json: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    output_json: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    duration_ms: Mapped[int | None] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(50), nullable=False)
    error: Mapped[str | None] = mapped_column(Text)


class SystemLog(Base):
    __tablename__ = "system_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    level: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    component: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    job_id: Mapped[str | None] = mapped_column(String(36), index=True)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    context_json: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False, index=True)


class Setting(Base, TimestampMixin):
    __tablename__ = "settings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    scope: Mapped[str] = mapped_column(String(80), default="global", nullable=False)
    key: Mapped[str] = mapped_column(String(120), nullable=False)
    value_json: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)


class LearningInsight(Base, TimestampMixin):
    __tablename__ = "learning_insights"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    channel_id: Mapped[str] = mapped_column(ForeignKey("channels.id", ondelete="CASCADE"), index=True)
    insight_type: Mapped[str] = mapped_column(String(120), nullable=False)
    statement: Mapped[str] = mapped_column(Text, nullable=False)
    evidence_json: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    confidence: Mapped[float | None] = mapped_column(Float)


class PlatformAccount(Base, TimestampMixin):
    __tablename__ = "platform_accounts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    channel_id: Mapped[str] = mapped_column(ForeignKey("channels.id", ondelete="CASCADE"), index=True)
    platform: Mapped[str] = mapped_column(String(50), nullable=False)
    external_account_id: Mapped[str | None] = mapped_column(String(255))
    display_name: Mapped[str | None] = mapped_column(String(255))
    auth_reference: Mapped[str | None] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(50), default="DISCONNECTED", nullable=False)
    metadata_json: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
