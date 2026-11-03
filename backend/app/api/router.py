"""Central API router registry.

All routers are registered here and included in main.py.
Phase 2+ routers will be added to this file.
"""
from __future__ import annotations

from fastapi import APIRouter

from app.api.health import router as health_router

api_router = APIRouter(prefix="/api")
api_router.include_router(health_router)

# Phase 2+: add session, questions, eligibility, checklist routers here.
