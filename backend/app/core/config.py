from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Autonomous Content Factory"
    app_env: str = "development"
    database_url: str = "sqlite:///./storage/content_factory.db"
    ollama_base_url: str = "http://127.0.0.1:11434"
    ollama_script_model: str = "qwen3:8b"
    ollama_review_model: str = "qwen3:8b"
    ollama_timeout_seconds: float = 180.0
    max_script_revisions: int = 5
    default_language: str = "pt-BR"
    default_timezone: str = "America/Sao_Paulo"
    frontend_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    log_level: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
