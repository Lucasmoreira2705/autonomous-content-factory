# Autonomous Content Factory — Frontend

Dashboard operacional em Next.js para acompanhar toda a fábrica autônoma de conteúdo.

## Telas

- Dashboard executivo
- Pipeline por etapa/agente
- Conteúdos e detalhe do job
- Calendário de slots
- Canais
- Publicações
- Performance
- Aprendizado
- Configurações

## Desenvolvimento

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Validação

```bash
npm run typecheck
npm run lint
npm run build
```

Os dados ainda são mocks visuais. A próxima integração liga esses componentes à API FastAPI existente.
