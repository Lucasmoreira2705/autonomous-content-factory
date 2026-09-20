from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.api.ui_extra import router as ui_extra_router
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
    version="0.2.0",
    lifespan=lifespan,
)

frontend_origins = [
    origin.strip()
    for origin in settings.frontend_origins.split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(ui_extra_router)


@app.get("/")
def root() -> dict:
    return {
        "name": settings.app_name,
        "version": "0.2.0",
        "docs": "/docs",
        "status": "phase_1_core",
        "frontend": "React + TypeScript + Vite",
    }
