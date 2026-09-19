from sqlalchemy import select

from app.core.config import get_settings
from app.database.models import Agent, Channel
from app.database.session import SessionLocal, init_db


def seed() -> None:
    init_db()
    settings = get_settings()
    with SessionLocal() as db:
        if db.scalar(select(Channel).where(Channel.name == "MVP Local").limit(1)) is None:
            db.add(
                Channel(
                    name="MVP Local",
                    niche="curiosidades",
                    language=settings.default_language,
                    timezone=settings.default_timezone,
                )
            )
        agents = [
            ("script_agent", "Gera e revisa versões de roteiro", settings.ollama_script_model),
            ("script_reviewer", "Avalia e aprova/reprova roteiros", settings.ollama_review_model),
        ]
        for name, role, model in agents:
            if db.scalar(select(Agent).where(Agent.name == name).limit(1)) is None:
                db.add(Agent(name=name, role=role, model_name=model))
        db.commit()


if __name__ == "__main__":
    seed()
