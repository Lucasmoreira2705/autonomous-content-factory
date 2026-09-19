from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.agents.script_agent import ScriptAgent
from app.agents.script_reviewer import ScriptReviewerAgent
from app.core.config import get_settings
from app.database.models import (
    ApprovalResult,
    Channel,
    Idea,
    Job,
    ReviewResult,
    Script,
    ScriptVersion,
)
from app.orchestrator.state_machine import PipelineStatus
from app.orchestrator.transitions import transition_job
from app.schemas.agents import ScriptAgentInput, ScriptAgentOutput, ScriptReviewInput


class OrchestratorError(RuntimeError):
    pass


class Orchestrator:
    """State-driven coordinator. It controls flow; it does not create content itself."""

    def __init__(
        self,
        db: Session,
        *,
        script_agent: ScriptAgent | None = None,
        script_reviewer: ScriptReviewerAgent | None = None,
    ) -> None:
        self.db = db
        self.settings = get_settings()
        self.script_agent = script_agent or ScriptAgent(db)
        self.script_reviewer = script_reviewer or ScriptReviewerAgent(db)

    def _job(self, job_id: str) -> Job:
        job = self.db.get(Job, job_id)
        if not job:
            raise OrchestratorError(f"Job not found: {job_id}")
        return job

    def _idea(self, job: Job) -> Idea:
        idea = self.db.get(Idea, job.idea_id)
        if not idea:
            raise OrchestratorError(f"Idea not found: {job.idea_id}")
        return idea

    def _channel(self, idea: Idea) -> Channel:
        channel = self.db.get(Channel, idea.channel_id)
        if not channel:
            raise OrchestratorError(f"Channel not found: {idea.channel_id}")
        return channel

    def _script(self, job: Job) -> Script | None:
        return self.db.get(Script, job.script_id) if job.script_id else None

    def _latest_script_version(self, script: Script) -> ScriptVersion | None:
        stmt = (
            select(ScriptVersion)
            .where(ScriptVersion.script_id == script.id)
            .order_by(ScriptVersion.version.desc())
            .limit(1)
        )
        return self.db.scalar(stmt)

    async def tick(self, job_id: str) -> Job:
        job = self._job(job_id)
        status = PipelineStatus(job.status)

        if status == PipelineStatus.IDEA_CREATED:
            return transition_job(self.db, job, PipelineStatus.SCRIPT_GENERATING, reason="idea_ready")

        if status == PipelineStatus.SCRIPT_REJECTED:
            if job.script_revision_count >= job.max_attempts:
                return transition_job(
                    self.db,
                    job,
                    PipelineStatus.NEEDS_INTERVENTION,
                    reason="max_script_revisions_reached",
                )
            return transition_job(self.db, job, PipelineStatus.SCRIPT_GENERATING, reason="apply_script_corrections")

        if status == PipelineStatus.SCRIPT_GENERATING:
            return await self._generate_script(job)

        if status == PipelineStatus.SCRIPT_REVIEW:
            return await self._review_script(job)

        return job

    async def run_until_checkpoint(self, job_id: str, max_steps: int = 20) -> Job:
        checkpoint = {
            PipelineStatus.SCRIPT_APPROVED,
            PipelineStatus.NEEDS_INTERVENTION,
            PipelineStatus.PIPELINE_PAUSED,
        }
        for _ in range(max_steps):
            job = self._job(job_id)
            if PipelineStatus(job.status) in checkpoint:
                return job
            job = await self.tick(job_id)
        raise OrchestratorError(f"Job {job_id} exceeded {max_steps} orchestrator steps")

    async def _generate_script(self, job: Job) -> Job:
        idea = self._idea(job)
        script = self._script(job)
        previous_output: dict | None = None

        if script is None:
            script = Script(idea_id=idea.id, current_version=0, status="GENERATING")
            self.db.add(script)
            self.db.commit()
            self.db.refresh(script)
            job.script_id = script.id
            self.db.add(job)
            self.db.commit()
        else:
            latest = self._latest_script_version(script)
            if latest:
                previous_output = latest.raw_output

        corrections = list((job.context_json or {}).get("mandatory_corrections", []))
        target_duration = int((job.context_json or {}).get("target_duration_seconds", 75))

        payload = ScriptAgentInput(
            idea_id=idea.id,
            theme=idea.theme,
            niche=self._channel(idea).niche,
            language=self._channel(idea).language,
            target_duration_seconds=target_duration,
            factual_sources=idea.source_facts,
            previous_script=previous_output,
            mandatory_corrections=corrections,
        )

        try:
            output = await self.script_agent.run(job_id=job.id, payload=payload)
        except Exception as exc:
            job.last_error = str(exc)
            self.db.add(job)
            self.db.commit()
            return transition_job(
                self.db,
                job,
                PipelineStatus.NEEDS_INTERVENTION,
                reason="script_agent_error",
                payload={"error": str(exc)},
            )

        new_version = script.current_version + 1
        version = ScriptVersion(
            script_id=script.id,
            version=new_version,
            title=output.title,
            hook=output.hook,
            narrative_structure=output.narrative_structure,
            narration=output.narration,
            on_screen_text=output.on_screen_text,
            visual_keywords=output.visual_keywords,
            image_suggestions=output.image_suggestions,
            video_suggestions=output.video_suggestions,
            effects_suggested=output.effects_suggested,
            cta=output.cta,
            scenes_json=[scene.model_dump(mode="json") for scene in output.scenes],
            duration_target_seconds=output.estimated_duration_seconds,
            corrections_applied=corrections,
            raw_output=output.model_dump(mode="json"),
        )
        self.db.add(version)
        script.current_version = new_version
        script.status = "REVIEW"
        job.script_revision_count = new_version
        context = dict(job.context_json or {})
        context["mandatory_corrections"] = []
        job.context_json = context
        self.db.add(script)
        self.db.add(job)
        self.db.commit()

        return transition_job(
            self.db,
            job,
            PipelineStatus.SCRIPT_REVIEW,
            reason=f"script_v{new_version}_generated",
            payload={"script_version": new_version},
        )

    async def _review_script(self, job: Job) -> Job:
        idea = self._idea(job)
        script = self._script(job)
        if script is None:
            raise OrchestratorError("SCRIPT_REVIEW without a script")
        latest = self._latest_script_version(script)
        if latest is None:
            raise OrchestratorError("SCRIPT_REVIEW without a script version")

        script_output = ScriptAgentOutput.model_validate(latest.raw_output)
        payload = ScriptReviewInput(
            idea={
                "theme": idea.theme,
                "hook": idea.hook,
                "suggested_sources": idea.suggested_sources,
                "source_facts": idea.source_facts,
            },
            script=script_output,
            minimum_score=80,
            target_duration_seconds=int((job.context_json or {}).get("target_duration_seconds", 75)),
        )

        try:
            review = await self.script_reviewer.run(job_id=job.id, payload=payload)
        except Exception as exc:
            job.last_error = str(exc)
            self.db.add(job)
            self.db.commit()
            return transition_job(
                self.db,
                job,
                PipelineStatus.NEEDS_INTERVENTION,
                reason="script_reviewer_error",
                payload={"error": str(exc)},
            )

        review_row = ReviewResult(
            job_id=job.id,
            stage="SCRIPT",
            subject_id=latest.id,
            result=review.decision,
            scores_json=review.scores.model_dump(mode="json"),
            issues_json=[{"problem": p} for p in review.problems],
            corrections_json=review.mandatory_corrections,
            raw_output=review.model_dump(mode="json"),
        )
        approval = ApprovalResult(
            job_id=job.id,
            stage="SCRIPT",
            subject_id=latest.id,
            decision=review.decision,
            reason=review.reason,
            score=review.scores.score_geral,
            details_json=review.model_dump(mode="json"),
        )
        self.db.add(review_row)
        self.db.add(approval)

        if review.decision == "APROVADO":
            script.status = "APPROVED"
            self.db.add(script)
            self.db.commit()
            return transition_job(
                self.db,
                job,
                PipelineStatus.SCRIPT_APPROVED,
                reason=f"script_v{latest.version}_approved",
                payload={"score": review.scores.score_geral},
            )

        script.status = "REJECTED"
        context = dict(job.context_json or {})
        context["mandatory_corrections"] = review.mandatory_corrections
        job.context_json = context
        self.db.add(script)
        self.db.add(job)
        self.db.commit()

        if job.script_revision_count >= job.max_attempts:
            return transition_job(
                self.db,
                job,
                PipelineStatus.NEEDS_INTERVENTION,
                reason="max_script_revisions_reached",
                payload={"corrections": review.mandatory_corrections},
            )

        return transition_job(
            self.db,
            job,
            PipelineStatus.SCRIPT_REJECTED,
            reason=f"script_v{latest.version}_rejected",
            payload={"corrections": review.mandatory_corrections},
        )
