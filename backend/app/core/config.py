"""Application configuration via pydantic-settings.

All values come from environment variables or .env file.
No business logic lives here — this is pure configuration.
"""
from __future__ import annotations

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── App ──────────────────────────────────────────────────────────────────
    APP_VERSION: str = Field(default="0.1.0")
    ENV: str = Field(default="development")

    # ── Database ─────────────────────────────────────────────────────────────
    DATABASE_URL: str = Field(
        default="postgresql+psycopg2://yojana:yojana_dev@localhost:5432/yojana_saathi"
    )

    # ── CORS ─────────────────────────────────────────────────────────────────
    CORS_ORIGINS: list[str] = Field(default=["http://localhost:3000"])

    # ── Localisation ─────────────────────────────────────────────────────────
    DEFAULT_LANGUAGE: str = Field(default="en")
    ENABLED_LANGUAGES: list[str] = Field(default=["en", "hi", "ta"])

    # ── Offline providers (scripts only — never imported at runtime) ──────────
    OFFLINE_LLM_PROVIDER: str = Field(
        default="ollama_local",
        description="gemini_free | groq_free | ollama_local",
    )
    OFFLINE_LLM_API_KEY: str = Field(default="")
    EMBEDDING_MODEL: str = Field(
        default="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    )
    TTS_ENGINE: str = Field(
        default="none",
        description="piper | bhashini | none",
    )

    # ── Sessions ─────────────────────────────────────────────────────────────
    SESSION_TTL_HOURS: int = Field(default=24)


settings = Settings()
