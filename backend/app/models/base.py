"""SQLAlchemy Base and ORM models."""
from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Any

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, validates

from app.schemas.profile import PROFILE_FIELDS


class Base(DeclarativeBase):
    pass


class Need(Base):
    __tablename__ = "needs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    icon: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    label: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)

    schemes: Mapped[list[Scheme]] = relationship(
        "Scheme", secondary="scheme_needs", back_populates="needs"
    )


class Scheme(Base):
    __tablename__ = "schemes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    name_local: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)
    ministry: Mapped[str | None] = mapped_column(String(255), nullable=True)
    level: Mapped[str] = mapped_column(String(20), nullable=False, default="central")  # central | state
    state: Mapped[str | None] = mapped_column(String(100), nullable=True)
    benefit_summary: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)
    source_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    last_verified: Mapped[date | None] = mapped_column(Date, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    needs: Mapped[list[Need]] = relationship(
        "Need", secondary="scheme_needs", back_populates="schemes"
    )
    rules: Mapped[list[SchemeRule]] = relationship(
        "SchemeRule", back_populates="scheme", cascade="all, delete-orphan"
    )
    documents: Mapped[list[SchemeDocument]] = relationship(
        "SchemeDocument", back_populates="scheme", cascade="all, delete-orphan"
    )


class SchemeNeed(Base):
    __tablename__ = "scheme_needs"

    scheme_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("schemes.id", ondelete="CASCADE"), primary_key=True
    )
    need_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("needs.id", ondelete="CASCADE"), primary_key=True
    )


class SchemeRule(Base):
    __tablename__ = "scheme_rules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    scheme_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    field: Mapped[str] = mapped_column(String(100), nullable=False)
    operator: Mapped[str] = mapped_column(String(20), nullable=False)  # eq|neq|gt|gte|lt|lte|in|not_in
    value: Mapped[Any] = mapped_column(JSONB, nullable=False)
    rule_group: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_required: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    review_status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")  # pending|approved|rejected

    scheme: Mapped[Scheme] = relationship("Scheme", back_populates="rules")

    @validates("field")
    def validate_field(self, key: str, value: str) -> str:
        if value not in PROFILE_FIELDS:
            raise ValueError(f"Invalid scheme rule field '{value}'. Must be in PROFILE_FIELDS: {PROFILE_FIELDS}")
        return value


class SchemeDocument(Base):
    __tablename__ = "scheme_documents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    scheme_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    document_name: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    where_to_obtain: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)
    is_mandatory: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    scheme: Mapped[Scheme] = relationship("Scheme", back_populates="documents")


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    profile_field: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    input_type: Mapped[str] = mapped_column(String(50), nullable=False)  # single_choice|number|yes_no|state_picker
    options: Mapped[Any | None] = mapped_column(JSONB, nullable=True)
    validation: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    label: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    help_text: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    @validates("profile_field")
    def validate_profile_field(self, key: str, value: str) -> str:
        if value not in PROFILE_FIELDS:
            raise ValueError(f"Invalid question profile_field '{value}'. Must be in PROFILE_FIELDS: {PROFILE_FIELDS}")
        return value


class UserSession(Base):
    __tablename__ = "user_sessions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    language: Mapped[str] = mapped_column(String(10), nullable=False, default="en")
    selected_need_ids: Mapped[list[int]] = mapped_column(JSONB, nullable=False, default=list)
    answers: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=func.now())
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

