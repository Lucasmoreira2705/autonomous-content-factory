# Autonomous Content Factory — Architecture v0.2

## Goal
Local-first autonomous content production platform with a Python/FastAPI backend and a fully separated React frontend.

## Architectural rules

1. **State machine is the source of truth.** Agents never decide what component runs next.
2. **Orchestrator coordinates only.** It does not generate creative content.
3. **Every agent receives/returns validated Pydantic models.** No dependency on chat memory.
4. **Every execution is persisted.** `agent_runs`, `state_events`, `review_results`, `approval_results`, and `system_logs` provide auditability.
5. **Versions are append-only.** `script_versions` and `video_versions` have immutable version numbers and unique constraints.
6. **External dependencies are adapters.** Ollama, FFmpeg, Whisper, TTS and each social network publisher are isolated behind dedicated modules.
7. **Failures are local.** A failing agent/job does not terminate the API or other platform workers.
8. **SQLite first, PostgreSQL later.** SQLAlchemy models and Alembic migrations avoid SQLite-specific application logic.
9. **Official platform APIs only.** Browser automation is not part of the publisher architecture.
10. **No secrets in frontend code or logs.** React receives only public API responses and `VITE_*` configuration.

## Runtime components

```text
React + TypeScript + Vite
  |
  | HTTP / JSON
  v
FastAPI
  |
  +--> SQLite/PostgreSQL
          ^
          |
DB Worker ---> Orchestrator ---> State Machine
                               |
                               +--> Script Agent ------> Ollama adapter
                               +--> Script Reviewer ---> Ollama adapter
                               +--> future Voice/Motion/QC/Publish agents
```

## Frontend

`frontend/` is a standalone SPA built with:

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui-compatible local components
- Lucide Icons
- Recharts
- React Router

The frontend never imports Python modules and never performs video, TTS, Whisper or Ollama processing.

## Backend API boundary

The React app reads operational data through `/api/v1/ui/*` endpoints and uses the job endpoints for future user actions. Local development uses a Vite proxy; deployed environments can set `VITE_API_BASE_URL`.

## Current backend flow

```text
IDEA_CREATED
  -> SCRIPT_GENERATING
  -> SCRIPT_REVIEW
       -> SCRIPT_APPROVED
       -> SCRIPT_REJECTED
            -> SCRIPT_GENERATING
       -> NEEDS_INTERVENTION
```

The state machine already contains future media, quality, scheduling, publishing and analytics states, so later modules attach without replacing the core orchestration model.

## Database

Core and future-facing tables:

- `channels`, `ideas`, `jobs`
- `scripts`, `script_versions`
- `videos`, `video_versions`, `scenes`, `assets`, `voiceovers`
- `review_results`, `approval_results`
- `publication_slots`, `publications`, `analytics`
- `agents`, `agent_runs`, `state_events`, `system_logs`
- `settings`, `learning_insights`, `platform_accounts`

## Queue evolution

Current worker: database-backed polling loop, intentionally simple and zero-cost.

Future adapters such as Redis/Celery can consume the same persisted jobs and transitions while the state machine remains authoritative.
