.PHONY: install migrate seed api worker test frontend-install frontend-dev frontend-build frontend-preview validate

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

frontend-install:
	cd frontend && npm install

frontend-dev:
	cd frontend && npm run dev

frontend-build:
	cd frontend && npm run typecheck && npm run lint && npm run build

frontend-preview:
	cd frontend && npm run preview

validate:
	pytest -q
	cd frontend && npm run typecheck && npm run lint && npm run build
