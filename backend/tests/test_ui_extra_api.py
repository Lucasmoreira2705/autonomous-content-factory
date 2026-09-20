from datetime import UTC, datetime

from app.api.ui_extra import ui_agents, ui_calendar
from app.database.models import Agent, AgentRun, Channel, Idea, Job, PublicationSlot
from app.orchestrator.state_machine import PipelineStatus


def test_ui_agents_returns_registered_agents_and_last_run(db):
    channel = Channel(name="Canal agentes", niche="teste")
    db.add(channel)
    db.commit()

    idea = Idea(channel_id=channel.id, theme="Tema")
    db.add(idea)
    db.commit()

    job = Job(
        channel_id=channel.id,
        idea_id=idea.id,
        status=PipelineStatus.IDEA_CREATED.value,
        context_json={},
    )
    agent = Agent(name="idea_agent", role="Escolhe temas", model_name="qwen3:8b")
    db.add_all([job, agent])
    db.commit()

    run = AgentRun(
        agent_name="idea_agent",
        job_id=job.id,
        input_json={},
        output_json={},
        status="SUCCESS",
        duration_ms=1200,
    )
    db.add(run)
    db.commit()

    payload = ui_agents(db)

    assert len(payload) == 1
    assert payload[0]["name"] == "idea_agent"
    assert payload[0]["run_count"] == 1
    assert payload[0]["last_status"] == "SUCCESS"
    assert payload[0]["last_duration_ms"] == 1200


def test_ui_calendar_returns_real_slots(db):
    channel = Channel(name="Canal calendário", niche="teste")
    db.add(channel)
    db.commit()

    scheduled = datetime(2026, 9, 20, 10, 0, tzinfo=UTC)
    slot = PublicationSlot(
        channel_id=channel.id,
        platform="youtube",
        scheduled_at=scheduled,
        status="AVAILABLE",
    )
    db.add(slot)
    db.commit()

    payload = ui_calendar(db)

    assert len(payload) == 1
    assert payload[0]["channel"] == "Canal calendário"
    assert payload[0]["platform"] == "youtube"
    assert payload[0]["status"] == "AVAILABLE"
