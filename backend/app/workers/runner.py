from __future__ import annotations

import asyncio
import logging

from sqlalchemy import select

from app.core.logging import configure_logging
from app.database.models import Job
from app.database.session import SessionLocal, init_db
from app.orchestrator.service import Orchestrator
from app.orchestrator.state_machine import PipelineStatus

logger = logging.getLogger("worker")
PROCESSABLE = {
    PipelineStatus.IDEA_CREATED.value,
    PipelineStatus.SCRIPT_GENERATING.value,
    PipelineStatus.SCRIPT_REVIEW.value,
    PipelineStatus.SCRIPT_REJECTED.value,
}


async def process_once() -> int:
    processed = 0
    with SessionLocal() as db:
        jobs = db.scalars(
            select(Job).where(Job.status.in_(PROCESSABLE)).order_by(Job.created_at.asc()).limit(10)
        ).all()
        for job in jobs:
            try:
                await Orchestrator(db).run_until_checkpoint(job.id)
                processed += 1
            except Exception:
                logger.exception("Failed processing job %s", job.id)
    return processed


async def main() -> None:
    configure_logging()
    init_db()
    logger.info("Local DB-backed worker started")
    while True:
        processed = await process_once()
        await asyncio.sleep(1 if processed else 3)


if __name__ == "__main__":
    asyncio.run(main())
