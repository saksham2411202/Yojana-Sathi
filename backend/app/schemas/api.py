"""Pydantic schemas for guided-flow API."""
from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, Field


class NeedResponse(BaseModel):
    id: int
    slug: str
    icon: str
    label: str


class CreateSessionRequest(BaseModel):
    language: str = "en"


class SessionResponse(BaseModel):
    id: uuid.UUID
    language: str
    selected_need_ids: list[int] = Field(default_factory=list)
    answers: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime
    expires_at: datetime | None


class UpdateNeedsRequest(BaseModel):
    need_ids: list[int]


class NextQuestionResponse(BaseModel):
    done: bool
    profile_field: str | None = None
    input_type: str | None = None
    options: Any | None = None
    label: str | None = None
    help_text: str | None = None
    version: int | None = None


class AnswerRequest(BaseModel):
    profile_field: str
    value: Any | None = None
    unknown: bool = False


class UndoAnswerResponse(BaseModel):
    removed_field: str | None
    remaining_answers: dict[str, Any]


class SchemeItemResponse(BaseModel):
    id: int
    name: str
    benefit_summary: str
    source_url: str | None
    last_verified: date | None


class MatchesResponse(BaseModel):
    eligible: list[SchemeItemResponse] = Field(default_factory=list)
    needs_info: list[SchemeItemResponse] = Field(default_factory=list)
    not_eligible: list[SchemeItemResponse] = Field(default_factory=list)


class DocumentResponse(BaseModel):
    id: int
    document_name: str
    where_to_obtain: str
    is_mandatory: bool


class SchemeDetailResponse(BaseModel):
    id: int
    name: str
    ministry: str | None
    level: str
    state: str | None
    benefit_summary: str
    source_url: str | None
    last_verified: date | None
    is_active: bool
    documents: list[DocumentResponse] = Field(default_factory=list)

