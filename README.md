# Autonomous Content Factory

Phase 1A of a local-first autonomous vertical-video factory.

## What works now

A topic can become a persisted job, generate a structured script through local Ollama, be evaluated by an independent reviewer, automatically regenerate with mandatory corrections, preserve every version, and stop only at `SCRIPT_APPROVED` or `NEEDS_INTERVENTION`.

## Requirements

- Python 3.12+
- Ollama installed and running locally
- `qwen3:8b` (default) or another configured local model

## Install

Using `uv`:

```bash
uv sync --extra dev
cp .env.example .env
ollama pull qwen3:8b
```

Using `pip`:

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -e '.[dev]'
cp .env.example .env
ollama pull qwen3:8b
```

## Database

```bash
PYTHONPATH=backend alembic upgrade head
PYTHONPATH=backend python -m app.database
```

SQLite is the default. To move to PostgreSQL later, change only `DATABASE_URL` and run migrations.

## Run API

From the project root:

```bash
PYTHONPATH=backend uvicorn app.main:app --reload
```

Open `http://127.0.0.1:8000/docs`.

## Run worker

In another terminal:

```bash
PYTHONPATH=backend python -m app.workers.runner
```

This is the zero-cost DB-backed queue for Phase 1. A future Redis/Celery adapter can replace polling without replacing the state machine.

## Create a topic job

```bash
curl -X POST http://127.0.0.1:8000/api/v1/jobs/from-topic \\
  -H 'Content-Type: application/json' \\
  -d '{
    "topic": "Como uma empresa quase perdeu tudo por uma decisão simples",
    "niche": "negócios",
    "target_duration_seconds": 75,
    "auto_run": true
  }'
```

For queue mode use `"auto_run": false`; the worker will pick it up.

## Health

```bash
curl http://127.0.0.1:8000/api/v1/health
```

## Tests

```bash
pytest -q
```

The tests do not require a live Ollama instance; LLM behavior is mocked at the agent boundary.

## Important factuality behavior

Phase 1A does not yet search the web. Factual sources live in `ideas.source_facts`. The script agent is instructed not to invent unsupported hard facts and the reviewer can reject them. The dedicated discovery/research stage comes next.

## Project map

```text
backend/app/
  api/                  FastAPI routes
  agents/               AgentBase + independent agents
  core/                 settings/logging
  database/             SQLAlchemy models/session/seed
  orchestrator/         state machine + transitions + controller
  services/ollama/      local LLM adapter
  services/ffmpeg/      reserved Phase 1B
  services/whisper/     reserved Phase 1B
  services/tts/         reserved Phase 1B
  services/assets/      reserved Phase 1B
  publishers/           isolated official platform adapters
  workers/              local durable polling worker
  templates/            future video templates
backend/alembic/         schema migrations
backend/tests/           automated tests
frontend/                future Next.js dashboard
storage/                 local media/database runtime data
docs/                    architecture and roadmap
```
