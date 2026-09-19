# Autonomous Content Factory

Local-first autonomous vertical-video factory.

## Current status

Phase 1A backend core is implemented and the operational frontend is available in `frontend/`.

Backend flow:

```text
IDEA_CREATED
  -> SCRIPT_GENERATING
  -> SCRIPT_REVIEW
       -> SCRIPT_APPROVED
       -> SCRIPT_REJECTED -> SCRIPT_GENERATING
       -> NEEDS_INTERVENTION
```

Frontend screens mirror the complete target pipeline:

```text
IDEIA -> ROTEIRO -> APROVAÇÃO -> CRIAÇÃO -> MOTION -> REVISÃO
-> APROVAÇÃO FINAL -> METADADOS -> AGENDAMENTO -> PUBLICAÇÃO
-> PERFORMANCE -> APRENDIZADO
```

## Requirements

- Python 3.12+
- Node.js 22+
- Ollama installed and running locally
- `qwen3:8b` (default) or another configured local model

## Backend install

Using `uv`:

```bash
uv sync --extra dev
cp .env.example .env
ollama pull qwen3:8b
```

Using `pip`:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e '.[dev]'
cp .env.example .env
ollama pull qwen3:8b
```

## Database

```bash
PYTHONPATH=backend alembic upgrade head
PYTHONPATH=backend python -m app.database
```

SQLite is the default. To move to PostgreSQL later, change `DATABASE_URL` and run migrations.

## Run API

```bash
PYTHONPATH=backend uvicorn app.main:app --reload
```

API docs: `http://127.0.0.1:8000/docs`.

## Run worker

```bash
PYTHONPATH=backend python -m app.workers.runner
```

## Run frontend

```bash
cd frontend
npm install
npm run dev
```

Dashboard: `http://localhost:3000`.

## Validate

Backend:

```bash
pytest -q
```

Frontend:

```bash
cd frontend
npm run typecheck
npm run lint
npm run build
```

## Security

The repository intentionally excludes:

- `.env`
- tokens, passwords and API secrets
- SQLite runtime databases
- generated videos and audio
- `node_modules`
- Python virtual environments
- Next.js build output

Only `.env.example` is versioned.

## Project map

```text
backend/app/
  api/                  FastAPI routes
  agents/               AgentBase + independent agents
  core/                 settings/logging
  database/             SQLAlchemy models/session/seed
  orchestrator/         state machine + controller
  services/ollama/      local LLM adapter
  services/ffmpeg/      Phase 1B attachment point
  services/whisper/     Phase 1B attachment point
  services/tts/         Phase 1B attachment point
  services/assets/      Phase 1B attachment point
  publishers/           isolated platform adapters
  workers/              local durable polling worker
frontend/
  app/                  Next.js routes
  components/           reusable dashboard components
docs/                    architecture and roadmap
storage/                 local runtime media/database
```

## Factuality

Phase 1A does not yet perform web research. `Idea.source_facts` is the authoritative fact input. The script prompt forbids unsupported hard facts and the reviewer can reject unsupported factual claims.
