"""Profile schema and recognized field definitions."""
from __future__ import annotations

from typing import Literal, Optional
from pydantic import BaseModel, Field


class UserProfile(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    marital_status: Optional[str] = None
    state: Optional[str] = None
    occupation: Optional[str] = None
    annual_income: Optional[float] = None
    category: Optional[Literal["GEN", "OBC", "SC", "ST"]] = None
    has_bpl_card: Optional[bool] = None
    is_disabled: Optional[bool] = None
    is_student: Optional[bool] = None
    education_level: Optional[str] = None
    land_holding_hectares: Optional[float] = None


PROFILE_FIELDS: list[str] = list(UserProfile.model_fields.keys())

