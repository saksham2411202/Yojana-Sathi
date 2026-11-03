"""Health check router — GET /health."""
from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

from app.core.config import settings

router = APIRouter(tags=["health"])


class HealthResponse(BaseModel):
    status: str
    version: str
    env: str


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
    description="Returns service status and current app version. Used by Docker health checks.",
)
async def health() -> HealthResponse:
    """Liveness probe — no DB call, always fast."""
    return HealthResponse(
        status="ok",
        version=settings.APP_VERSION,
        env=settings.ENV,
    )
