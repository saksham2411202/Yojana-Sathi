"""Schemas and data structures for the deterministic eligibility engine."""
from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class TriState(str, Enum):
    TRUE = "TRUE"
    FALSE = "FALSE"
    UNKNOWN = "UNKNOWN"


class EligibilityStatus(str, Enum):
    ELIGIBLE = "ELIGIBLE"
    NOT_ELIGIBLE = "NOT_ELIGIBLE"
    NEEDS_INFO = "NEEDS_INFO"


class RuleInput(BaseModel):
    field: str
    operator: str  # eq, neq, gt, gte, lt, lte, in, not_in
    value: Any
    rule_group: int = 0
    is_required: bool = True
    review_status: str = "approved"  # pending, approved, rejected


class SchemeInput(BaseModel):
    id: int | str
    name: str = ""
    rules: list[RuleInput] = Field(default_factory=list)


class EligibilityResult(BaseModel):
    scheme_id: int | str
    status: EligibilityStatus
    passed_rules: list[RuleInput] = Field(default_factory=list)
    failed_rules: list[RuleInput] = Field(default_factory=list)
    missing_fields: list[str] = Field(default_factory=list)
    no_rules: bool = False
