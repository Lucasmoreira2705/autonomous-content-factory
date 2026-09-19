# Frontend — React + TypeScript + Vite

Camada visual da Autonomous Content Factory.

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui-compatible local components
- Lucide Icons
- Recharts
- React Router

Nenhum processamento de IA, vídeo, TTS ou credencial sensível roda no frontend.

## Configuração

```bash
cp .env.example .env
npm install
npm run dev
```

Abra `http://localhost:5173`.

Por padrão, o Vite encaminha `/api` para o FastAPI em `http://127.0.0.1:8000`.

Para apontar para outro backend:

```env
VITE_API_BASE_URL=https://api.exemplo.com/api/v1
```

Somente variáveis públicas podem usar o prefixo `VITE_`.

## Build

```bash
npm run typecheck
npm run lint
npm run build
npm run preview
```

O bundle de produção é gerado em `dist/`.

## Estrutura

```text
src/
  components/
    ui/             componentes shadcn/ui locais
  hooks/
  lib/
    api.ts          cliente HTTP do FastAPI
    pipeline.ts     apresentação dos estados
  pages/
  App.tsx
  main.tsx
  index.css
```

O projeto foi mantido como SPA Vite para ser simples de importar em ferramentas compatíveis com React/Vite, incluindo Lovable.
