from __future__ import annotations

import json

from sqlalchemy.orm import Session

from app.agents.base import AgentBase
from app.core.config import get_settings
from app.schemas.agents import ScriptReviewInput, ScriptReviewOutput
from app.services.ollama.client import OllamaClient


SYSTEM_PROMPT = """Você é o AGENTE DE APROVAÇÃO DE ROTEIRO.
Você NÃO reescreve o roteiro. Você apenas avalia e decide APROVADO ou REPROVADO.

Avalie objetivamente:
- força do gancho
- clareza
- ritmo
- retenção
- coerência
- originalidade
- duração
- factualidade
- adequação a vídeo vertical
- risco de copyright
- facilidade de criação visual
- linguagem
- potencial de monetização

REGRAS:
- Responda somente no schema JSON solicitado.
- Se score_geral ficar abaixo de minimum_score, decision deve ser REPROVADO.
- Se houver afirmação factual importante sem suporte em idea.source_facts/suggested_sources, REPROVE por factualidade.
- Se houver risco claro de copiar conteúdo protegido ou de usar mídia sem licença, REPROVE.
- Se REPROVADO, mandatory_corrections deve ser específica, acionável e suficiente para o agente de roteiro produzir uma nova versão.
- Se APROVADO, mandatory_corrections deve ser vazio.
- Não suavize problemas para aprovar. Também não reprove por preferência estética subjetiva quando os critérios objetivos forem atendidos.
"""


class ScriptReviewerAgent(AgentBase[ScriptReviewInput, ScriptReviewOutput]):
    name = "script_reviewer"

    def __init__(self, db: Session, client: OllamaClient | None = None, model: str | None = None) -> None:
        super().__init__(db)
        settings = get_settings()
        self.client = client or OllamaClient()
        self.model = model or settings.ollama_review_model

    async def execute(self, payload: ScriptReviewInput) -> ScriptReviewOutput:
        user_prompt = f"""Avalie esta entrada sem reescrever o roteiro:
{json.dumps(payload.model_dump(mode='json'), ensure_ascii=False, indent=2)}

A decisão precisa ser consistente com os scores e com as regras de factualidade/copyright.
Não inclua markdown fora do JSON.
"""
        return await self.client.chat_structured(
            model=self.model,
            system_prompt=SYSTEM_PROMPT,
            user_prompt=user_prompt,
            output_model=ScriptReviewOutput,
            temperature=0.1,
        )
