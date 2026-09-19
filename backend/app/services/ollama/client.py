from __future__ import annotations

import json
from typing import TypeVar

import httpx
from pydantic import BaseModel, ValidationError

from app.core.config import get_settings

T = TypeVar("T", bound=BaseModel)


class OllamaError(RuntimeError):
    pass


class OllamaClient:
    def __init__(self, base_url: str | None = None, timeout: float | None = None) -> None:
        settings = get_settings()
        self.base_url = (base_url or settings.ollama_base_url).rstrip("/")
        self.timeout = timeout or settings.ollama_timeout_seconds

    async def health(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                return response.is_success
        except httpx.HTTPError:
            return False

    async def chat_structured(
        self,
        *,
        model: str,
        system_prompt: str,
        user_prompt: str,
        output_model: type[T],
        temperature: float = 0.2,
    ) -> T:
        schema = output_model.model_json_schema()
        payload = {
            "model": model,
            "stream": False,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "format": schema,
            "options": {"temperature": temperature},
        }
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(f"{self.base_url}/api/chat", json=payload)
                response.raise_for_status()
                data = response.json()
        except (httpx.HTTPError, ValueError) as exc:
            raise OllamaError(f"Ollama request failed: {exc}") from exc

        content = ((data.get("message") or {}).get("content") or "").strip()
        if not content:
            raise OllamaError("Ollama returned an empty message")

        try:
            return output_model.model_validate_json(content)
        except ValidationError as exc:
            try:
                parsed = json.loads(content)
                return output_model.model_validate(parsed)
            except (json.JSONDecodeError, ValidationError) as inner_exc:
                raise OllamaError(f"Invalid structured output from Ollama: {inner_exc}") from exc
