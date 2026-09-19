# Autonomous Content Factory — Architecture v0.1

## Goal
Local-first autonomous content production platform. Phase 1 intentionally stops at the `SCRIPT_APPROVED` checkpoint. Later phases attach media generation, FFmpeg motion, QC, scheduling, official publishers, analytics and learning without changing the core orchestration contract.

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
10. **No secrets in code/logs.** Runtime credentials live in environment variables or future secret managers.

## Runtime components

```text
FastAPI
  |
  +--> Job creation / inspection API
  |
  +--> SQLite/PostgreSQL
          ^
          |
DB Worker ---> Orchestrator ---> State Machine
                               |
                               +--> Script Agent ------> Ollama adapter
                               +--> Script Reviewer ---> Ollama adapter
                               |
                               +--> future Content/Voice/Motion/QC/Publish agents
```

## Phase 1 implemented flow

```text
IDEA_CREATED
  -> SCRIPT_GENERATING
  -> SCRIPT_REVIEW
       -> SCRIPT_APPROVED
       -> SCRIPT_REJECTED
            -> SCRIPT_GENERATING (new immutable version)
       -> NEEDS_INTERVENTION (max revisions/error)
```

## Future pipeline attachment points

After `SCRIPT_APPROVED`:

`ASSETS_COLLECTING -> VOICE_GENERATING -> VIDEO_BUILDING -> MOTION_PROCESSING -> VIDEO_RENDERED -> QUALITY_REVIEW -> FINAL_REVIEW -> READY_TO_SCHEDULE -> SCHEDULED -> PUBLISHING -> PUBLISHED -> ANALYTICS_COLLECTING -> COMPLETED`

The enum and legal transitions already contain these states, so future modules attach to the existing machine instead of replacing it.

## Database

Core and future-facing tables already modeled:

- `channels`, `ideas`, `jobs`
- `scripts`, `script_versions`
- `videos`, `video_versions`, `scenes`, `assets`, `voiceovers`
- `review_results`, `approval_results`
- `publication_slots`, `publications`, `analytics`
- `agents`, `agent_runs`, `state_events`, `system_logs`
- `settings`, `learning_insights`, `platform_accounts`

`jobs` is intentionally added even though it was not in the initial table list because a durable orchestration queue needs its own persisted work item.

## AI model policy

Defaults are configurable in `.env`:

- Script: `qwen3:8b`
- Script reviewer: `qwen3:8b`

The code does not depend on a specific model. Any Ollama model that reliably follows the JSON schema can replace them. Model selection will later become channel/agent-specific through `agents` and `settings`.

## Fact safety

Phase 1 does not yet perform web research. `Idea.source_facts` is the authoritative fact input. The script prompt forbids unsupported hard facts; the reviewer is instructed to reject unsupported factual claims. The discovery/research agent will populate this field in a later stage.

## Queue evolution

Current worker: database-backed polling loop, intentionally simple and zero-cost.

Future adapter: Redis + Celery/RQ/Dramatiq can consume the same persisted `jobs` and state transitions. The state machine remains authoritative, preventing the queue engine from becoming business logic.

## Frontend choice

Planned frontend: **Next.js + React + TypeScript**. It will consume FastAPI only; it must not read SQLite directly. Dashboard, pipeline, video detail, calendar, settings and System Health are scheduled after the media generation core works end-to-end.
