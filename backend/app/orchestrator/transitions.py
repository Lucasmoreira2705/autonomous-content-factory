from sqlalchemy.orm import Session

from app.database.models import Job, StateEvent, SystemLog
from app.orchestrator.state_machine import PipelineStatus, assert_transition


def transition_job(
    db: Session,
    job: Job,
    target: PipelineStatus,
    *,
    reason: str | None = None,
    payload: dict | None = None,
) -> Job:
    current = PipelineStatus(job.status)
    assert_transition(current, target)

    event = StateEvent(
        job_id=job.id,
        from_status=current.value,
        to_status=target.value,
        reason=reason,
        payload_json=payload or {},
    )
    job.status = target.value
    db.add(event)
    db.add(SystemLog(
        level="INFO",
        component="orchestrator",
        job_id=job.id,
        message=f"State transition {current.value} -> {target.value}",
        context_json={"reason": reason, "payload": payload or {}},
    ))
    db.add(job)
    db.commit()
    db.refresh(job)
    return job
