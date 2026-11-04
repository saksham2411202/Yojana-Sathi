"""Schemes endpoints."""
from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.base import Scheme
from app.schemas.api import DocumentResponse, SchemeDetailResponse
from app.services.session_service import localize

router = APIRouter(prefix="/schemes", tags=["schemes"])


@router.get("/{scheme_id}", response_model=SchemeDetailResponse)
def get_scheme_detail(
    scheme_id: int,
    lang: Annotated[str, Query()] = "en",
    db: Annotated[Session, Depends(get_db)] = None,  # type: ignore[assignment]
) -> SchemeDetailResponse:
    """Retrieve details and localized documents for a scheme."""
    scheme = db.execute(select(Scheme).where(Scheme.id == scheme_id)).scalar_one_or_none()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    docs = [
        DocumentResponse(
            id=d.id,
            document_name=localize(d.document_name, lang),
            where_to_obtain=localize(d.where_to_obtain, lang),
            is_mandatory=d.is_mandatory,
        )
        for d in scheme.documents
    ]

    return SchemeDetailResponse(
        id=scheme.id,
        name=localize(scheme.name_local, lang) or scheme.name,
        ministry=scheme.ministry,
        level=scheme.level,
        state=scheme.state,
        benefit_summary=localize(scheme.benefit_summary, lang),
        source_url=scheme.source_url,
        last_verified=scheme.last_verified,
        is_active=scheme.is_active,
        documents=docs,
    )
