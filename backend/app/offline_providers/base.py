"""Abstract base classes for offline providers.

These ABCs define the contracts that concrete offline implementations must satisfy.

IMPORTANT: This module must ONLY be imported from:
  - scripts/          (offline scripts)
  - app/offline_providers/stubs.py  (stub implementations)
  - tests/ that explicitly test provider contracts

It must NEVER be imported from:
  - app/api/
  - app/services/
  - app/main.py
  - app/core/
  - app/db/
  - app/models/

The import-boundary test enforces this at CI time.
"""
from __future__ import annotations

from abc import ABC, abstractmethod


class BaseLLMProvider(ABC):
    """Contract for offline LLM providers (translation validation, rule extraction).

    Used only by offline scripts. Never called at request time.
    """

    @abstractmethod
    async def complete(self, prompt: str, *, max_tokens: int = 512) -> str:
        """Send a prompt and return the completion text."""
        ...

    @abstractmethod
    async def health_check(self) -> bool:
        """Return True if the provider is reachable and healthy."""
        ...


class BaseEmbeddingProvider(ABC):
    """Contract for offline embedding providers.

    Used only by offline scripts for semantic search index building.
    """

    @abstractmethod
    async def embed(self, texts: list[str]) -> list[list[float]]:
        """Return embeddings for a list of texts."""
        ...

    @property
    @abstractmethod
    def dimension(self) -> int:
        """Embedding vector dimension."""
        ...


class BaseTTSProvider(ABC):
    """Contract for offline TTS providers.

    Used only by the generate_audio script to produce static .mp3/.wav files.
    The generated files are committed as data and served statically at runtime.
    """

    @abstractmethod
    async def synthesize(
        self,
        text: str,
        language_code: str,
        *,
        output_path: str,
    ) -> None:
        """Synthesize speech and write to output_path."""
        ...

    @property
    @abstractmethod
    def supported_languages(self) -> list[str]:
        """List of BCP-47 language codes supported by this provider."""
        ...
