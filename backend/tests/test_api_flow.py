"""End-to-end guided flow API tests using TestClient."""
from __future__ import annotations

import sys
import uuid
from datetime import UTC, datetime, timedelta
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from fastapi.testclient import TestClient  # noqa: E402
from scripts.seed_dev import seed  # noqa: E402
from sqlalchemy import select  # noqa: E402

from app.db.session import SessionLocal  # noqa: E402
from app.main import app  # noqa: E402
from app.models.base import Need, Scheme, UserSession  # noqa: E402

client = TestClient(app)


def setup_module() -> None:
    """Ensure database has the sample seed data."""
    seed()


def test_get_needs_localized() -> None:
    # Hindi
    resp = client.get("/api/needs?lang=hi")
    assert resp.status_code == 200
    needs_hi = resp.json()
    assert len(needs_hi) == 3
    health_need = next(n for n in needs_hi if n["slug"] == "health")
    assert "स्वास्थ्य" in health_need["label"]

    # English fallback
    resp_en = client.get("/api/needs?lang=en")
    assert resp_en.status_code == 200
    health_need_en = next(n for n in resp_en.json() if n["slug"] == "health")
    assert "Healthcare" in health_need_en["label"]


# ─── Persona 1: Student Persona ──────────────────────────────────────────────

def test_persona_student_walkthrough() -> None:
    session_db = SessionLocal()
    education_need = session_db.execute(select(Need).where(Need.slug == "education")).scalar_one()
    session_db.close()

    # 1. Create session with Hindi
    s_resp = client.post("/api/sessions", json={"language": "hi"})
    assert s_resp.status_code == 201
    s_id = s_resp.json()["id"]

    # 2. Select education need
    put_resp = client.put(f"/api/sessions/{s_id}/needs", json={"need_ids": [education_need.id]})
    assert put_resp.status_code == 200
    assert put_resp.json()["selected_need_ids"] == [education_need.id]

    # 3. Answer questions until done
    for _ in range(10):
        q_resp = client.get(f"/api/sessions/{s_id}/next-question")
        assert q_resp.status_code == 200
        q_data = q_resp.json()
        if q_data["done"]:
            break

        field = q_data["profile_field"]
        if field == "is_student":
            ans_resp = client.post(f"/api/sessions/{s_id}/answers", json={"profile_field": field, "value": True})
        elif field == "age":
            ans_resp = client.post(f"/api/sessions/{s_id}/answers", json={"profile_field": field, "value": 20})
        else:
            ans_resp = client.post(f"/api/sessions/{s_id}/answers", json={"profile_field": field, "unknown": True})
        assert ans_resp.status_code == 200

    # 4. Check matches: National Merit Scholarship should be eligible
    matches_resp = client.get(f"/api/sessions/{s_id}/matches?lang=hi")
    assert matches_resp.status_code == 200
    matches = matches_resp.json()
    assert len(matches["eligible"]) >= 1
    eligible_names = [s["name"] for s in matches["eligible"]]
    assert any("राष्ट्रीय मेधा" in name for name in eligible_names)


# ─── Persona 2: Farmer Persona ───────────────────────────────────────────────

def test_persona_farmer_walkthrough() -> None:
    session_db = SessionLocal()
    farming_need = session_db.execute(select(Need).where(Need.slug == "farming")).scalar_one()
    session_db.close()

    s_resp = client.post("/api/sessions", json={"language": "en"})
    s_id = s_resp.json()["id"]

    client.put(f"/api/sessions/{s_id}/needs", json={"need_ids": [farming_need.id]})

    # Answer occupation and land_holding_hectares
    client.post(f"/api/sessions/{s_id}/answers", json={"profile_field": "occupation", "value": "farmer"})
    client.post(f"/api/sessions/{s_id}/answers", json={"profile_field": "land_holding_hectares", "value": 1.5})

    q_resp = client.get(f"/api/sessions/{s_id}/next-question")
    assert q_resp.json()["done"] is True

    matches_resp = client.get(f"/api/sessions/{s_id}/matches")
    matches = matches_resp.json()
    assert len(matches["eligible"]) >= 1
    assert any("Farmer Income Guarantee" in s["name"] for s in matches["eligible"])


# ─── Persona 3: Ineligible Health Persona ────────────────────────────────────

def test_persona_ineligible_health_walkthrough() -> None:
    session_db = SessionLocal()
    health_need = session_db.execute(select(Need).where(Need.slug == "health")).scalar_one()
    session_db.close()

    s_resp = client.post("/api/sessions", json={"language": "en"})
    s_id = s_resp.json()["id"]

    client.put(f"/api/sessions/{s_id}/needs", json={"need_ids": [health_need.id]})

    # Answer has_bpl_card=False -> fails eligibility
    client.post(f"/api/sessions/{s_id}/answers", json={"profile_field": "has_bpl_card", "value": False})

    matches_resp = client.get(f"/api/sessions/{s_id}/matches")
    matches = matches_resp.json()
    assert len(matches["not_eligible"]) >= 1
    assert any("Ayushman Health Support" in s["name"] for s in matches["not_eligible"])


# ─── Validation Rejection ────────────────────────────────────────────────────

def test_answer_validation_rejection() -> None:
    s_resp = client.post("/api/sessions", json={"language": "en"})
    s_id = s_resp.json()["id"]

    # Age must be numeric >= 0
    resp_invalid_type = client.post(
        f"/api/sessions/{s_id}/answers",
        json={"profile_field": "age", "value": "twenty"},
    )
    assert resp_invalid_type.status_code == 422

    # Category must be one of options
    resp_invalid_choice = client.post(
        f"/api/sessions/{s_id}/answers",
        json={"profile_field": "category", "value": "INVALID_CAT"},
    )
    assert resp_invalid_choice.status_code == 422

    # Yes/no must be boolean
    resp_invalid_bool = client.post(
        f"/api/sessions/{s_id}/answers",
        json={"profile_field": "is_student", "value": "yes"},
    )
    assert resp_invalid_bool.status_code == 422


# ─── Undo Flow ───────────────────────────────────────────────────────────────

def test_answer_undo_flow() -> None:
    s_resp = client.post("/api/sessions", json={"language": "en"})
    s_id = s_resp.json()["id"]

    client.post(f"/api/sessions/{s_id}/answers", json={"profile_field": "age", "value": 25})
    client.post(f"/api/sessions/{s_id}/answers", json={"profile_field": "occupation", "value": "student"})

    # Undo last answer
    undo_resp = client.post(f"/api/sessions/{s_id}/answers/undo")
    assert undo_resp.status_code == 200
    data = undo_resp.json()
    assert data["removed_field"] == "occupation"
    assert "occupation" not in data["remaining_answers"]
    assert data["remaining_answers"]["age"] == 25


# ─── Expired and Not Found Sessions ──────────────────────────────────────────

def test_session_not_found() -> None:
    fake_id = uuid.uuid4()
    resp = client.get(f"/api/sessions/{fake_id}/next-question")
    assert resp.status_code == 404


def test_session_expired() -> None:
    db = SessionLocal()
    past = datetime.now(UTC) - timedelta(hours=1)
    expired_sess = UserSession(
        id=uuid.uuid4(),
        language="en",
        selected_need_ids=[],
        answers={},
        created_at=past - timedelta(hours=24),
        expires_at=past,
    )
    db.add(expired_sess)
    db.commit()
    expired_id = expired_sess.id
    db.close()

    resp = client.get(f"/api/sessions/{expired_id}/next-question")
    assert resp.status_code == 410


# ─── Scheme Details and Localization Fallback ────────────────────────────────

def test_scheme_detail_and_fallback() -> None:
    db = SessionLocal()
    scheme = db.execute(select(Scheme)).scalars().first()
    assert scheme is not None
    s_id = scheme.id
    db.close()

    # Query with unsupported language code -> should fallback to English
    resp = client.get(f"/api/schemes/{s_id}?lang=fr")
    assert resp.status_code == 200
    data = resp.json()
    assert "SAMPLE -" in data["name"]
    assert len(data["documents"]) >= 1
