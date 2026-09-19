from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI

from app.api.routes import router
from app.core.config import get_settings
from app.core.logging import configure_logging
from app.database.session import init_db


@asynccontextmanager
async def lifespan(_: FastAPI):
    configure_logging()
    Path("storage").mkdir(parents=True, exist_ok=True)
    init_db()
    yield


settings = get_settings()
app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    lifespan=lifespan,
)
app.include_router(router)


@app.get("/")
def root() -> dict:
    return {
        "name": settings.app_name,
        "version": "0.1.0",
        "docs": "/docs",
        "status": "phase_1_core",
    }
