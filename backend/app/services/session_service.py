"""Session management and guided question flow service."""
from __future__ import annotations

import uuid
from datetime import UTC, datetime, timedelta
from typing import Any

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.base import Need, Question, Scheme, UserSession
from app.schemas.api import (
    AnswerRequest,
    MatchesResponse,
    NextQuestionResponse,
    SchemeItemResponse,
    UndoAnswerResponse,
)
from app.schemas.eligibility import (
    EligibilityStatus,
    RuleInput,
    SchemeInput,
)
from app.services.eligibility import match_all, next_best_question


def localize(data: Any, lang: str = "en") -> str:
    """Extract localized text with fallback to English."""
    if isinstance(data, dict):
        val = data.get(lang) or data.get("en") or ""
        return str(val)
    return str(data or "")


def get_active_session(db: Session, session_id: uuid.UUID) -> UserSession:
    """Retrieve session or raise 404 / 410."""
    session = db.execute(select(UserSession).where(UserSession.id == session_id)).scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    now = datetime.now(UTC)
    if session.expires_at and session.expires_at < now:
        raise HTTPException(status_code=410, detail="Session has expired")

    return session


def create_session(db: Session, language: str = "en") -> UserSession:
    """Create a new anonymous session with 24h TTL."""
    now = datetime.now(UTC)
    user_session = UserSession(
        id=uuid.uuid4(),
        language=language,
        selected_need_ids=[],
        answers={},
        created_at=now,
        expires_at=now + timedelta(hours=24),
    )
    db.add(user_session)
    db.commit()
    db.refresh(user_session)
    return user_session


def update_session_needs(db: Session, session_id: uuid.UUID, need_ids: list[int]) -> UserSession:
    """Save selected needs into session."""
    user_session = get_active_session(db, session_id)
    user_session.selected_need_ids = need_ids
    db.commit()
    db.refresh(user_session)
    return user_session


def get_schemes_for_needs(db: Session, need_ids: list[int]) -> list[Scheme]:
    """Retrieve schemes tagged with any of the selected needs."""
    if not need_ids:
        return []
    schemes = (
        db.execute(
            select(Scheme).join(Scheme.needs).where(Need.id.in_(need_ids), Scheme.is_active.is_(True)).distinct()
        )
        .scalars()
        .all()
    )
    return list(schemes)


def scheme_to_input(scheme: Scheme) -> SchemeInput:
    """Convert DB Scheme to SchemeInput with only approved rules."""
    rules = [
        RuleInput(
            field=r.field,
            operator=r.operator,
            value=r.value,
            rule_group=r.rule_group,
            is_required=r.is_required,
            review_status=r.review_status,
        )
        for r in scheme.rules
        if r.review_status == "approved"
    ]
    return SchemeInput(id=scheme.id, name=scheme.name, rules=rules)


def get_next_question(db: Session, session_id: uuid.UUID, lang: str | None = None) -> NextQuestionResponse:
    """Identify the next best question for the user's selected needs."""
    user_session = get_active_session(db, session_id)
    active_lang = lang or user_session.language or "en"

    schemes = get_schemes_for_needs(db, user_session.selected_need_ids)
    scheme_inputs = [scheme_to_input(s) for s in schemes]

    answered_fields = set(user_session.answers.keys()) if user_session.answers else set()
    best_field = next_best_question(user_session.answers, scheme_inputs, answered_fields=answered_fields)

    if not best_field:
        return NextQuestionResponse(done=True)

    question = db.execute(select(Question).where(Question.profile_field == best_field)).scalar_one_or_none()
    if not question:
        return NextQuestionResponse(done=True)

    return NextQuestionResponse(
        done=False,
        profile_field=question.profile_field,
        input_type=question.input_type,
        options=question.options,
        label=localize(question.label, active_lang),
        help_text=localize(question.help_text, active_lang) if question.help_text else None,
        version=question.version,
    )


def validate_answer_value(question: Question, value: Any) -> None:
    """Validate submitted value against question type and rules."""
    itype = question.input_type

    if itype == "yes_no":
        if not isinstance(value, bool):
            raise HTTPException(status_code=422, detail="Value must be a boolean for yes_no input.")
    elif itype == "number":
        if not isinstance(value, int | float) or isinstance(value, bool):
            raise HTTPException(status_code=422, detail="Value must be numeric.")
        if question.validation and isinstance(question.validation, dict):
            min_val = question.validation.get("min")
            max_val = question.validation.get("max")
            if min_val is not None and value < min_val:
                raise HTTPException(status_code=422, detail=f"Value must be >= {min_val}")
            if max_val is not None and value > max_val:
                raise HTTPException(status_code=422, detail=f"Value must be <= {max_val}")
    elif itype == "single_choice" and question.options and isinstance(question.options, list) and value not in question.options:
        raise HTTPException(status_code=422, detail=f"Value must be one of {question.options}")
    elif itype == "state_picker" and (not isinstance(value, str) or not value.strip()):
        raise HTTPException(status_code=422, detail="Value must be a non-empty state name.")


def submit_answer(db: Session, session_id: uuid.UUID, answer: AnswerRequest) -> UserSession:
    """Validate and record an answer."""
    user_session = get_active_session(db, session_id)
    question = db.execute(select(Question).where(Question.profile_field == answer.profile_field)).scalar_one_or_none()
    if not question:
        raise HTTPException(status_code=404, detail=f"Question for field '{answer.profile_field}' not found.")

    if answer.unknown:
        stored_val: Any = "unknown"
    else:
        validate_answer_value(question, answer.value)
        stored_val = answer.value

    current_answers = dict(user_session.answers or {})
    current_answers[answer.profile_field] = stored_val
    user_session.answers = current_answers

    db.commit()
    db.refresh(user_session)
    return user_session


def undo_last_answer(db: Session, session_id: uuid.UUID) -> UndoAnswerResponse:
    """Remove the most recently added answer."""
    user_session = get_active_session(db, session_id)
    current_answers = dict(user_session.answers or {})

    if not current_answers:
        return UndoAnswerResponse(removed_field=None, remaining_answers={})

    removed_key = list(current_answers.keys())[-1]
    del current_answers[removed_key]
    user_session.answers = current_answers

    db.commit()
    db.refresh(user_session)
    return UndoAnswerResponse(removed_field=removed_key, remaining_answers=current_answers)


def get_session_matches(db: Session, session_id: uuid.UUID, lang: str | None = None) -> MatchesResponse:
    """Evaluate matched schemes for session and categorize by eligibility."""
    user_session = get_active_session(db, session_id)
    active_lang = lang or user_session.language or "en"

    schemes = get_schemes_for_needs(db, user_session.selected_need_ids)
    scheme_inputs = [scheme_to_input(s) for s in schemes]
    results = match_all(user_session.answers or {}, scheme_inputs)

    schemes_by_id = {s.id: s for s in schemes}

    eligible_list: list[SchemeItemResponse] = []
    needs_info_list: list[SchemeItemResponse] = []
    not_eligible_list: list[SchemeItemResponse] = []

    for r in results:
        orig = schemes_by_id.get(r.scheme_id)  # type: ignore[arg-type]
        if not orig:
            continue
        item = SchemeItemResponse(
            id=orig.id,
            name=localize(orig.name_local, active_lang) or orig.name,
            benefit_summary=localize(orig.benefit_summary, active_lang),
            source_url=orig.source_url,
            last_verified=orig.last_verified,
        )
        if r.status == EligibilityStatus.ELIGIBLE:
            eligible_list.append(item)
        elif r.status == EligibilityStatus.NEEDS_INFO:
            needs_info_list.append(item)
        else:
            not_eligible_list.append(item)

    return MatchesResponse(
        eligible=eligible_list,
        needs_info=needs_info_list,
        not_eligible=not_eligible_list,
    )
