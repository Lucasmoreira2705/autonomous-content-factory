from __future__ import annotations

import time
from abc import ABC, abstractmethod
from typing import Generic, TypeVar

from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.models import AgentRun, SystemLog, utcnow

InputT = TypeVar("InputT", bound=BaseModel)
OutputT = TypeVar("OutputT", bound=BaseModel)


class AgentBase(ABC, Generic[InputT, OutputT]):
    name: str

    def __init__(self, db: Session) -> None:
        self.db = db

    async def run(self, *, job_id: str, payload: InputT) -> OutputT:
        started = time.perf_counter()
        run = AgentRun(
            agent_name=self.name,
            job_id=job_id,
            input_json=payload.model_dump(mode="json"),
            output_json={},
            status="RUNNING",
        )
        self.db.add(run)
        self.db.commit()
        self.db.refresh(run)

        try:
            output = await self.execute(payload)
            run.output_json = output.model_dump(mode="json")
            run.status = "SUCCESS"
            return output
        except Exception as exc:
            self.db.rollback()
            persisted = self.db.get(AgentRun, run.id)
            if persisted is None:
                persisted = run
                self.db.add(persisted)
            persisted.status = "FAILED"
            persisted.error = str(exc)[:8000]
            self.db.add(SystemLog(
                level="ERROR",
                component=self.name,
                job_id=job_id,
                message="Agent execution failed",
                context_json={"error": str(exc)[:8000]},
            ))
            self.db.commit()
            raise
        finally:
            ended = time.perf_counter()
            persisted = self.db.get(AgentRun, run.id)
            if persisted is not None:
                persisted.ended_at = utcnow()
                persisted.duration_ms = int((ended - started) * 1000)
                self.db.add(persisted)
                self.db.commit()

    @abstractmethod
    async def execute(self, payload: InputT) -> OutputT:
        raise NotImplementedError
