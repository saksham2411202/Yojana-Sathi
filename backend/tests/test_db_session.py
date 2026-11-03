"""Verify DB session is synchronous."""
from __future__ import annotations

import contextlib

from sqlalchemy.orm import Session

from app.db.session import SessionLocal, get_db


def test_session_local_is_sync() -> None:
    """SessionLocal must produce sync Session objects, not AsyncSession."""
    session = SessionLocal()
    try:
        assert isinstance(session, Session)
    finally:
        session.close()


def test_get_db_yields_sync_session() -> None:
    """get_db dependency must be a sync generator."""
    gen = get_db()
    session = next(gen)
    try:
        assert isinstance(session, Session)
    finally:
        with contextlib.suppress(StopIteration):
            next(gen)

