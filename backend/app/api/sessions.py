"""Sessions endpoints."""
from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.api import (
    AnswerRequest,
    CreateSessionRequest,
    MatchesResponse,
    NextQuestionResponse,
    SessionResponse,
    UndoAnswerResponse,
    UpdateNeedsRequest,
)
from app.services.session_service import (
    create_session,
    get_next_question,
    get_session_matches,
    submit_answer,
    undo_last_answer,
    update_session_needs,
)

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("", response_model=SessionResponse, status_code=201)
def create_new_session(
    payload: CreateSessionRequest,
    db: Annotated[Session, Depends(get_db)] = None,  # type: ignore[assignment]
) -> SessionResponse:
    """Create an anonymous session."""
    session = create_session(db, language=payload.language)
    return SessionResponse(
        id=session.id,
        language=session.language,
        selected_need_ids=session.selected_need_ids,
        answers=session.answers,
        created_at=session.created_at,
        expires_at=session.expires_at,
    )


@router.put("/{session_id}/needs", response_model=SessionResponse)
def set_session_needs(
    session_id: uuid.UUID,
    payload: UpdateNeedsRequest,
    db: Annotated[Session, Depends(get_db)] = None,  # type: ignore[assignment]
) -> SessionResponse:
    """Save selected needs for the session."""
    session = update_session_needs(db, session_id, payload.need_ids)
    return SessionResponse(
        id=session.id,
        language=session.language,
        selected_need_ids=session.selected_need_ids,
        answers=session.answers,
        created_at=session.created_at,
        expires_at=session.expires_at,
    )


@router.get("/{session_id}/next-question", response_model=NextQuestionResponse)
def fetch_next_question(
    session_id: uuid.UUID,
    lang: Annotated[str | None, Query()] = None,
    db: Annotated[Session, Depends(get_db)] = None,  # type: ignore[assignment]
) -> NextQuestionResponse:
    """Get the next best question for the user's needs."""
    return get_next_question(db, session_id, lang=lang)


@router.post("/{session_id}/answers", response_model=SessionResponse)
def post_answer(
    session_id: uuid.UUID,
    payload: AnswerRequest,
    db: Annotated[Session, Depends(get_db)] = None,  # type: ignore[assignment]
) -> SessionResponse:
    """Record an answer for the session."""
    session = submit_answer(db, session_id, payload)
    return SessionResponse(
        id=session.id,
        language=session.language,
        selected_need_ids=session.selected_need_ids,
        answers=session.answers,
        created_at=session.created_at,
        expires_at=session.expires_at,
    )


@router.post("/{session_id}/answers/undo", response_model=UndoAnswerResponse)
def undo_answer(
    session_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)] = None,  # type: ignore[assignment]
) -> UndoAnswerResponse:
    """Undo the last recorded answer."""
    return undo_last_answer(db, session_id)


@router.get("/{session_id}/matches", response_model=MatchesResponse)
def fetch_matches(
    session_id: uuid.UUID,
    lang: Annotated[str | None, Query()] = None,
    db: Annotated[Session, Depends(get_db)] = None,  # type: ignore[assignment]
) -> MatchesResponse:
    """Categorized matching schemes for the current session."""
    return get_session_matches(db, session_id, lang=lang)
