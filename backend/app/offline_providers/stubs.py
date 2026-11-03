"""Stub implementations of offline providers.

Each stub raises NotImplementedError so that scripts fail fast if they forget
to inject a real provider. Replace stubs with concrete classes in Phase 4.

These stubs are ONLY for use in offline scripts and tests of the provider
contract. They must never be imported from runtime code.
"""
from __future__ import annotations

from app.offline_providers.base import (
    BaseEmbeddingProvider,
    BaseLLMProvider,
    BaseTTSProvider,
)


class StubLLMProvider(BaseLLMProvider):
    """Placeholder LLM — raises NotImplementedError on every call."""

    async def complete(self, prompt: str, *, max_tokens: int = 512) -> str:
        raise NotImplementedError(
            "StubLLMProvider is a placeholder. "
            "Set OFFLINE_LLM_PROVIDER in .env and instantiate a real provider."
        )

    async def health_check(self) -> bool:
        return False


class StubEmbeddingProvider(BaseEmbeddingProvider):
    """Placeholder embedding provider — raises NotImplementedError on every call."""

    async def embed(self, texts: list[str]) -> list[list[float]]:
        raise NotImplementedError(
            "StubEmbeddingProvider is a placeholder. "
            "Install sentence-transformers and use a real provider."
        )

    @property
    def dimension(self) -> int:
        return 384  # MiniLM-L12-v2 default


class StubTTSProvider(BaseTTSProvider):
    """Placeholder TTS — raises NotImplementedError on every call."""

    async def synthesize(
        self,
        text: str,
        language_code: str,
        *,
        output_path: str,
    ) -> None:
        raise NotImplementedError(
            "StubTTSProvider is a placeholder. "
            "Set TTS_ENGINE in .env and use a real provider."
        )

    @property
    def supported_languages(self) -> list[str]:
        return []
