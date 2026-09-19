# Autonomous Content Factory

Fábrica autônoma de conteúdo em vídeo com backend Python e frontend React desacoplados.

## Arquitetura

```text
frontend/
  React + TypeScript + Vite
  Tailwind CSS + shadcn/ui
  Lucide Icons + Recharts
  React Router
        |
        | HTTP / JSON
        v
backend/
  FastAPI + SQLAlchemy
  app/agents/        agentes de IA
  app/services/      Ollama, futuros FFmpeg/Whisper/TTS/assets
  app/orchestrator/  state machine e fluxo
  app/publishers/    integrações oficiais futuras
  app/workers/       execução assíncrona local

storage/
  runtime local de banco, mídia, áudio e logs
```

O frontend não executa Python e não contém lógica de processamento de vídeo, IA ou credenciais.

## Pipeline

```text
IDEIA
-> ROTEIRO
-> APROVAÇÃO
-> CRIAÇÃO
-> MOTION
-> REVISÃO
-> APROVAÇÃO FINAL
-> AGENDAMENTO
-> PUBLICAÇÃO
-> PERFORMANCE
-> APRENDIZADO
```

## Requisitos

- Python 3.12+
- Node.js 22+
- Ollama
- npm

## 1. Backend Python

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env
ollama pull qwen3:8b

PYTHONPATH=backend alembic upgrade head
PYTHONPATH=backend python -m app.database
PYTHONPATH=backend uvicorn app.main:app --reload
```

FastAPI: `http://127.0.0.1:8000`  
Swagger: `http://127.0.0.1:8000/docs`

Worker, em outro terminal:

```bash
source .venv/bin/activate
PYTHONPATH=backend python -m app.workers.runner
```

## 2. Frontend React/Vite

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend: `http://localhost:5173`

O Vite usa proxy local para `/api`. Em ambientes externos, configure somente a URL pública:

```env
VITE_API_BASE_URL=https://seu-backend.example.com/api/v1
```

Nunca coloque tokens, senhas ou API keys em variáveis `VITE_*`.

## Build e validação

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
npm run preview
```

## APIs usadas pelo React

- `GET /api/v1/health`
- `GET /api/v1/ui/dashboard`
- `GET /api/v1/ui/channels`
- `GET /api/v1/ui/publications`
- `GET /api/v1/ui/learning`
- `GET /api/v1/ui/analytics`

A criação e execução dos jobs continua no backend:

- `POST /api/v1/jobs/from-topic`
- `POST /api/v1/jobs/{job_id}/run`
- `GET /api/v1/jobs/{job_id}`

## Segurança

O Git ignora:

- `.env`
- tokens, senhas e API keys
- `node_modules`
- `dist`
- ambientes Python
- bancos SQLite locais
- vídeos gerados
- áudios gerados
- logs e arquivos temporários

Somente arquivos `.env.example` são versionados.
