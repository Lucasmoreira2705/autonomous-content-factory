.PHONY: install migrate seed api worker test

install:
	uv sync --extra dev
	cp -n .env.example .env || true

migrate:
	PYTHONPATH=backend alembic upgrade head

seed:
	PYTHONPATH=backend python -m app.database

api:
	PYTHONPATH=backend uvicorn app.main:app --reload

worker:
	PYTHONPATH=backend python -m app.workers.runner

test:
	pytest -q
