"""Needs endpoints."""
from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.base import Need
from app.schemas.api import NeedResponse
from app.services.session_service import localize

router = APIRouter(prefix="/needs", tags=["needs"])


@router.get("", response_model=list[NeedResponse])
def get_needs(
    lang: Annotated[str, Query()] = "en",
    db: Annotated[Session, Depends(get_db)] = None,  # type: ignore[assignment]
) -> list[NeedResponse]:
    """List all available needs with localized labels."""
    needs = db.execute(select(Need).order_by(Need.id)).scalars().all()
    return [
        NeedResponse(
            id=n.id,
            slug=n.slug,
            icon=n.icon,
            label=localize(n.label, lang),
        )
        for n in needs
    ]
