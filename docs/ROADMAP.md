# Roadmap

## Phase 1A — implemented now
- Architecture and directories
- Complete future-facing database model
- Alembic migrations
- State machine
- Orchestrator
- `AgentBase`
- Ollama adapter with structured output
- Script agent
- Script reviewer
- Automatic correction/re-review loop
- DB-backed local worker
- Tests

## Phase 1B — next
- Source/research input contract
- Local TTS adapter (Piper-compatible)
- Legal asset provider adapters + source/license persistence
- Scene planner
- FFmpeg composition service
- Whisper/local alignment for captions
- Motion templates
- Technical video reviewer (ffprobe/FFmpeg checks)
- Final approval agent
- Automatic correction routing
- Final MP4 output

## Phase 2
- Publication calendar and slot allocator
- Durable retry queue + idempotency
- YouTube official API publisher

## Phase 3
- TikTok official API publisher
- Instagram Graph API publisher
- Facebook Graph API publisher

## Phase 4
- Analytics snapshots
- Performance agent
- Learning agent

## Phase 5
- Multi-channel configuration
- Autopilot buffer planning
- Pipeline pause rules
- PostgreSQL + Redis worker scale-out
- Next.js production dashboard
