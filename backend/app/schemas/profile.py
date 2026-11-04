"""Profile schema and recognized field definitions."""
from __future__ import annotations

from typing import Literal

from pydantic import BaseModel


class UserProfile(BaseModel):
    age: int | None = None
    gender: str | None = None
    marital_status: str | None = None
    state: str | None = None
    occupation: str | None = None
    annual_income: float | None = None
    category: Literal["GEN", "OBC", "SC", "ST"] | None = None
    has_bpl_card: bool | None = None
    is_disabled: bool | None = None
    is_student: bool | None = None
    education_level: str | None = None
    land_holding_hectares: float | None = None


PROFILE_FIELDS: list[str] = list(UserProfile.model_fields.keys())
