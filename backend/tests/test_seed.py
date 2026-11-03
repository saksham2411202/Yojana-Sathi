"""Tests for Alembic migrations and idempotency of database seeding."""
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from alembic import command
from alembic.config import Config
from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.base import Need, Question, Scheme
from scripts.seed_dev import seed


def test_migration_up_and_down() -> None:
    backend_dir = Path(__file__).resolve().parent.parent
    alembic_cfg = Config(str(backend_dir / "alembic.ini"))
    alembic_cfg.set_main_option("script_location", str(backend_dir / "alembic"))

    # Test downgrade to base then upgrade back to head
    command.downgrade(alembic_cfg, "base")
    command.upgrade(alembic_cfg, "head")


def test_seed_twice_has_no_duplicates() -> None:
    seed()
    seed()

    session = SessionLocal()
    try:
        needs = session.execute(select(Need)).scalars().all()
        schemes = session.execute(select(Scheme)).scalars().all()
        questions = session.execute(select(Question)).scalars().all()

        assert len(needs) == 3
        assert len(schemes) == 3
        assert len(questions) == 8
    finally:
        session.close()
