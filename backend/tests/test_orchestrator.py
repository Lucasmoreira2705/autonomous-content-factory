import asyncio
from app.database.models import ApprovalResult, Channel, Idea, Job, Script, ScriptVersion, StateEvent
from app.orchestrator.service import Orchestrator
from app.orchestrator.state_machine import PipelineStatus
from app.schemas.agents import (
    ReviewScores,
    ScriptAgentOutput,
    ScriptReviewOutput,
    ScriptScene,
)


class FakeScriptAgent:
    def __init__(self):
        self.calls = 0

    async def run(self, *, job_id, payload):
        self.calls += 1
        return ScriptAgentOutput(
            title=f"Versão {self.calls}",
            hook="Um gancho forte entra direto no conflito.",
            script="Roteiro original de teste.",
            narrative_structure="gancho > contexto > desenvolvimento > virada > conclusão",
            narration="Narração original de teste sem afirmações factuais externas.",
            scenes=[
                ScriptScene(
                    scene_id="scene_01",
                    start_time=0,
                    end_time=75,
                    narration="Narração original de teste sem afirmações factuais externas.",
                    visual="animação abstrata original",
                    text="GANCHO",
                )
            ],
            on_screen_text=["GANCHO"],
            visual_keywords=["abstract"],
            image_suggestions=["generated abstract image"],
            video_suggestions=[],
            effects_suggested=["subtle zoom"],
            estimated_duration_seconds=75,
            factual_claims=[],
        )


class RejectThenApproveReviewer:
    def __init__(self):
        self.calls = 0

    async def run(self, *, job_id, payload):
        self.calls += 1
        base_scores = ReviewScores(
            score_geral=70 if self.calls == 1 else 90,
            score_gancho=80,
            score_retencao=80,
            score_originalidade=90,
            score_clareza=90,
            score_factualidade=100,
        )
        if self.calls == 1:
            return ScriptReviewOutput(
                decision="REPROVADO",
                scores=base_scores,
                problems=["Final pouco forte"],
                mandatory_corrections=["Criar uma conclusão mais forte e curta"],
                reason="Precisa melhorar o fechamento",
            )
        return ScriptReviewOutput(
            decision="APROVADO",
            scores=base_scores,
            reason="Critérios atendidos",
        )


class AlwaysRejectReviewer:
    async def run(self, *, job_id, payload):
        return ScriptReviewOutput(
            decision="REPROVADO",
            scores=ReviewScores(
                score_geral=50,
                score_gancho=50,
                score_retencao=50,
                score_originalidade=60,
                score_clareza=60,
                score_factualidade=100,
            ),
            problems=["Retenção insuficiente"],
            mandatory_corrections=["Melhorar retenção"],
            reason="Abaixo do score mínimo",
        )


def seed_job(db, max_attempts=5):
    channel = Channel(name="MVP", niche="curiosidades", language="pt-BR")
    db.add(channel)
    db.commit()
    idea = Idea(channel_id=channel.id, theme="Tema de teste", source_facts=[])
    db.add(idea)
    db.commit()
    job = Job(
        channel_id=channel.id,
        idea_id=idea.id,
        status=PipelineStatus.IDEA_CREATED.value,
        max_attempts=max_attempts,
        context_json={"target_duration_seconds": 75},
    )
    db.add(job)
    db.commit()
    return job


def test_rejection_creates_new_version_and_then_approves(db):
    job = seed_job(db)
    scripts = FakeScriptAgent()
    reviewer = RejectThenApproveReviewer()
    orchestrator = Orchestrator(db, script_agent=scripts, script_reviewer=reviewer)

    result = asyncio.run(orchestrator.run_until_checkpoint(job.id))

    assert result.status == PipelineStatus.SCRIPT_APPROVED.value
    script = db.get(Script, result.script_id)
    assert script.current_version == 2
    versions = db.query(ScriptVersion).filter_by(script_id=script.id).order_by(ScriptVersion.version).all()
    assert [v.version for v in versions] == [1, 2]
    assert versions[1].corrections_applied == ["Criar uma conclusão mais forte e curta"]
    approvals = db.query(ApprovalResult).filter_by(job_id=job.id).all()
    assert [a.decision for a in approvals] == ["REPROVADO", "APROVADO"]
    events = db.query(StateEvent).filter_by(job_id=job.id).all()
    assert any(e.to_status == PipelineStatus.SCRIPT_REJECTED.value for e in events)
    assert any(e.to_status == PipelineStatus.SCRIPT_APPROVED.value for e in events)


def test_max_revisions_goes_to_intervention(db):
    job = seed_job(db, max_attempts=2)
    orchestrator = Orchestrator(
        db,
        script_agent=FakeScriptAgent(),
        script_reviewer=AlwaysRejectReviewer(),
    )

    result = asyncio.run(orchestrator.run_until_checkpoint(job.id))

    assert result.status == PipelineStatus.NEEDS_INTERVENTION.value
    script = db.get(Script, result.script_id)
    assert script.current_version == 2
