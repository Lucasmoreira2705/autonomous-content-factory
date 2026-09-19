from __future__ import annotations

import json

from sqlalchemy.orm import Session

from app.agents.base import AgentBase
from app.core.config import get_settings
from app.schemas.agents import ScriptAgentInput, ScriptAgentOutput
from app.services.ollama.client import OllamaClient


SYSTEM_PROMPT = """Você é o AGENTE DE ROTEIRO de uma fábrica autônoma de vídeos verticais.
Sua responsabilidade é criar roteiro ORIGINAL, transformativo, claro, visualmente executável e otimizado para retenção.

REGRAS OBRIGATÓRIAS:
- Responda somente no schema JSON solicitado pela aplicação.
- Formato do vídeo: 9:16, 1080x1920.
- Duração alvo: use o valor fornecido, normalmente 60-90 segundos.
- Comece direto na parte interessante. Evite 'Você sabia que...' quando houver gancho mais forte.
- Estruture aproximadamente: 0-3s gancho; 3-15s contexto; 15-50s desenvolvimento; 50-70s virada; final curto.
- A narração deve soar natural quando convertida em TTS.
- As cenas devem cobrir todo o vídeo, sem intervalos negativos ou sobreposição proposital.
- Sugestões visuais precisam estar relacionadas à fala de cada cena.
- Não copie roteiros, narrações, posts ou vídeos existentes.
- Não sugira uso de material com watermark ou conteúdo protegido sem licença.
- FATOS: não invente dados. Se factual_sources estiver vazio ou não sustentar um fato específico, não apresente números, datas, nomes ou afirmações verificáveis como certeza.
- factual_claims deve listar cada afirmação factual importante e a fonte que a sustenta. Se não houver fonte, reformule para não depender daquele fato.
- Se mandatory_corrections existir, todas devem ser incorporadas.
"""


class ScriptAgent(AgentBase[ScriptAgentInput, ScriptAgentOutput]):
    name = "script_agent"

    def __init__(self, db: Session, client: OllamaClient | None = None, model: str | None = None) -> None:
        super().__init__(db)
        settings = get_settings()
        self.client = client or OllamaClient()
        self.model = model or settings.ollama_script_model

    async def execute(self, payload: ScriptAgentInput) -> ScriptAgentOutput:
        user_prompt = f"""Crie o roteiro com base nesta entrada estruturada:
{json.dumps(payload.model_dump(mode='json'), ensure_ascii=False, indent=2)}

Critérios adicionais:
- Cada cena deve ter scene_id único como scene_01, scene_02...
- start_time da primeira cena deve ser 0.
- end_time final deve ficar próximo de target_duration_seconds.
- on_screen_text deve ser curto e legível em celular.
- visual_keywords devem ajudar busca futura de assets royalty-free.
- Não inclua markdown fora do JSON.
"""
        return await self.client.chat_structured(
            model=self.model,
            system_prompt=SYSTEM_PROMPT,
            user_prompt=user_prompt,
            output_model=ScriptAgentOutput,
            temperature=0.45,
        )
