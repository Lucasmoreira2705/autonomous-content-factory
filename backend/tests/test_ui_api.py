from app.api.routes import ui_channels, ui_dashboard
from app.database.models import Channel, Idea, Job
from app.orchestrator.state_machine import PipelineStatus


def test_ui_dashboard_projects_persisted_jobs(db):
    channel = Channel(name="Canal de teste", niche="negócios", language="pt-BR")
    db.add(channel)
    db.commit()

    idea = Idea(
        channel_id=channel.id,
        theme="Tema de teste",
        provisional_title="Título visível no React",
    )
    db.add(idea)
    db.commit()

    job = Job(
        channel_id=channel.id,
        idea_id=idea.id,
        status=PipelineStatus.SCRIPT_REVIEW.value,
        max_attempts=5,
        context_json={"target_duration_seconds": 70},
    )
    db.add(job)
    db.commit()

    payload = ui_dashboard(db)

    assert payload["totals"]["ideas"] == 1
    assert payload["totals"]["jobs_active"] == 1
    assert payload["pipeline"][PipelineStatus.SCRIPT_REVIEW.value] == 1
    assert payload["jobs"][0]["title"] == "Título visível no React"
    assert payload["jobs"][0]["channel"] == "Canal de teste"
    assert payload["jobs"][0]["target_duration_seconds"] == 70


def test_ui_channels_exposes_only_public_configuration(db):
    channel = Channel(
        name="Canal API",
        niche="tecnologia",
        language="pt-BR",
        voice="voz-local",
    )
    db.add(channel)
    db.commit()

    payload = ui_channels(db)

    assert payload[0]["name"] == "Canal API"
    assert payload[0]["voice"] == "voz-local"
    assert "auth_reference" not in payload[0]
