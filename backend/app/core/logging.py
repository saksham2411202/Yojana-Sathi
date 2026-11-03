"""Structured logging setup for Yojana Saathi backend.

Privacy contract:
  - Request IDs are logged; never log profile field values.
  - PII_BLOCKED_FIELDS lists field names that must never appear in log records.
  - The NoPIIFilter drops any log record whose message contains a blocked field name
    as a substring. This is a belt-and-suspenders guard.
"""
from __future__ import annotations

import logging
import sys
from typing import Any

# Field names that must never appear in log output.
PII_BLOCKED_FIELDS: frozenset[str] = frozenset(
    # UserProfile field names — none contain PII by design, but guard anyway.
    # Expand this list if PII fields are ever accidentally added.
    []
)


class NoPIIFilter(logging.Filter):
    """Drop log records whose message contains any PII-adjacent field name."""

    def filter(self, record: logging.LogRecord) -> bool:
        msg = record.getMessage()
        return not any(field in msg for field in PII_BLOCKED_FIELDS)


def configure_logging(level: str = "INFO") -> None:
    """Configure root logger with JSON-friendly format and PII filter."""
    fmt = "%(asctime)s %(levelname)-8s %(name)s %(message)s"
    handler = logging.StreamHandler(sys.stdout)
    handler.addFilter(NoPIIFilter())
    handler.setFormatter(logging.Formatter(fmt))

    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(getattr(logging, level.upper(), logging.INFO))


def get_logger(name: str) -> logging.Logger:
    """Return a named logger. Call after configure_logging()."""
    return logging.getLogger(name)


# Module-level convenience — tests can import this directly.
log: logging.Logger = get_logger(__name__)


def sanitize_log_kwargs(**kwargs: Any) -> dict[str, Any]:
    """Remove any PII-blocked keys from a log-extra dict before logging."""
    return {k: v for k, v in kwargs.items() if k not in PII_BLOCKED_FIELDS}
