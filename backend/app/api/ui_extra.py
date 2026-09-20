from sqlalchemy import func, select
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends

from app.database.models import Agent, AgentRun, Channel, PublicationSlot
from app.database.session import get_db

router = APIRouter(prefix="/api/v1/ui")


@router.get("/agents")
def ui_agents(db: Session = Depends(get_db)) -> list[dict]:
    agents = db.scalars(select(Agent).order_by(Agent.name.asc())).all()
    result: list[dict] = []

    for agent in agents:
        run_count = (
            db.scalar(
                select(func.count())
                .select_from(AgentRun)
                .where(AgentRun.agent_name == agent.name)
            )
            or 0
        )
        last_run = db.scalar(
            select(AgentRun)
            .where(AgentRun.agent_name == agent.name)
            .order_by(AgentRun.started_at.desc())
            .limit(1)
        )

        result.append(
            {
                "id": agent.id,
                "name": agent.name,
                "role": agent.role,
                "model_name": agent.model_name,
                "enabled": agent.enabled,
                "run_count": run_count,
                "last_run_at": last_run.started_at.isoformat() if last_run else None,
                "last_status": last_run.status if last_run else None,
                "last_duration_ms": last_run.duration_ms if last_run else None,
                "last_error": last_run.error if last_run else None,
            }
        )

    return result


@router.get("/calendar")
def ui_calendar(db: Session = Depends(get_db)) -> list[dict]:
    slots = db.scalars(
        select(PublicationSlot)
        .order_by(PublicationSlot.scheduled_at.asc())
        .limit(300)
    ).all()

    result: list[dict] = []
    for slot in slots:
        channel = db.get(Channel, slot.channel_id)
        result.append(
            {
                "id": slot.id,
                "channel": channel.name if channel else "Sem canal",
                "platform": slot.platform,
                "scheduled_at": slot.scheduled_at.isoformat(),
                "video_id": slot.video_id,
                "status": slot.status,
            }
        )
    return result
