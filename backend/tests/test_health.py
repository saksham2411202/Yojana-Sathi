"""Health-check endpoint tests."""
from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_plain_health() -> None:
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert "version" in data
    assert "env" in data


def test_health_returns_200() -> None:
    resp = client.get("/api/health")
    assert resp.status_code == 200


def test_health_body() -> None:
    data = client.get("/api/health").json()
    assert data["status"] == "ok"
    assert "version" in data
    assert "env" in data
