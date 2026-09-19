import asyncio
import json

import httpx

from app.schemas.agents import ReviewScores, ScriptReviewOutput
from app.services.ollama.client import OllamaClient


def test_ollama_structured_output(monkeypatch):
    expected = ScriptReviewOutput(
        decision="APROVADO",
        scores=ReviewScores(
            score_geral=90,
            score_gancho=90,
            score_retencao=90,
            score_originalidade=90,
            score_clareza=90,
            score_factualidade=100,
        ),
        reason="ok",
    )

    async def fake_post(self, url, json=None, **kwargs):
        request = httpx.Request("POST", url)
        return httpx.Response(
            200,
            request=request,
            json={"message": {"role": "assistant", "content": expected.model_dump_json()}},
        )

    monkeypatch.setattr(httpx.AsyncClient, "post", fake_post)
    client = OllamaClient(base_url="http://localhost:11434")
    result = asyncio.run(client.chat_structured(
        model="fake",
        system_prompt="system",
        user_prompt="user",
        output_model=ScriptReviewOutput,
    ))
    assert result.decision == "APROVADO"
    assert result.scores.score_geral == 90
