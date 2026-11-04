"""Central API router registry."""
from __future__ import annotations

from fastapi import APIRouter

from app.api.health import router as health_router
from app.api.needs import router as needs_router
from app.api.schemes import router as schemes_router
from app.api.sessions import router as sessions_router

api_router = APIRouter(prefix="/api")
api_router.include_router(health_router)
api_router.include_router(needs_router)
api_router.include_router(sessions_router)
api_router.include_router(schemes_router)
