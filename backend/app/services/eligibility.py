"""Deterministic eligibility rule evaluation engine.

Pure Python — no DB dependencies, no network calls, no external side-effects.
"""
from __future__ import annotations

import operator
from collections import Counter
from collections.abc import Callable, Mapping
from typing import Any

from pydantic import BaseModel

from app.schemas.eligibility import (
    EligibilityResult,
    EligibilityStatus,
    RuleInput,
    SchemeInput,
    TriState,
)

UNKNOWN_VALUES = {"unknown", "UNKNOWN", "dont_know", "don't know", "skip"}

OPERATORS: dict[str, Callable[[Any, Any], bool]] = {
    "eq": operator.eq,
    "neq": operator.ne,
    "gt": operator.gt,
    "gte": operator.ge,
    "lt": operator.lt,
    "lte": operator.le,
    "in": lambda p, t: bool(p in t),
    "not_in": lambda p, t: bool(p not in t),
}


def is_unknown(val: Any) -> bool:
    """Check if a profile value is considered unknown or unanswered."""
    if val is None:
        return True
    if isinstance(val, str):
        return val in UNKNOWN_VALUES
    return False


def evaluate_rule(rule: RuleInput, profile_val: Any) -> TriState:
    """Evaluate a single rule against a profile field value."""
    if is_unknown(profile_val):
        return TriState.UNKNOWN

    fn = OPERATORS.get(rule.operator.lower())
    if fn is None:
        return TriState.UNKNOWN

    try:
        matched = fn(profile_val, rule.value)
        return TriState.TRUE if matched else TriState.FALSE
    except (TypeError, ValueError):
        return TriState.UNKNOWN


def get_profile_value(profile: Any, field_name: str) -> Any:
    """Extract field value from Pydantic model, dataclass, dict or object."""
    if isinstance(profile, BaseModel):
        return getattr(profile, field_name, None)
    elif isinstance(profile, Mapping):
        return profile.get(field_name, None)
    elif hasattr(profile, field_name):
        return getattr(profile, field_name, None)
    return None


def evaluate_scheme(profile: Any, scheme: SchemeInput) -> EligibilityResult:
    """Evaluate eligibility for a single scheme against a user profile."""
    approved_rules = [r for r in scheme.rules if r.review_status == "approved"]

    if not approved_rules:
        return EligibilityResult(
            scheme_id=scheme.id,
            status=EligibilityStatus.NEEDS_INFO,
            passed_rules=[],
            failed_rules=[],
            missing_fields=[],
            no_rules=True,
        )

    # Group rules by rule_group
    groups: dict[int, list[RuleInput]] = {}
    for rule in approved_rules:
        groups.setdefault(rule.rule_group, []).append(rule)

    passed_rules: list[RuleInput] = []
    failed_rules: list[RuleInput] = []
    missing_fields_set: list[str] = []

    group_evaluations: list[TriState] = []
    group_candidates_missing: list[list[str]] = []

    for group_rules in groups.values():
        has_false = False
        has_unknown = False
        group_missing: list[str] = []

        for rule in group_rules:
            val = get_profile_value(profile, rule.field)
            res = evaluate_rule(rule, val)

            if res == TriState.TRUE:
                if rule not in passed_rules:
                    passed_rules.append(rule)
            elif res == TriState.FALSE:
                if rule not in failed_rules:
                    failed_rules.append(rule)
                has_false = True
            elif res == TriState.UNKNOWN:
                has_unknown = True
                if rule.field not in group_missing:
                    group_missing.append(rule.field)

        if has_false:
            group_evaluations.append(TriState.FALSE)
        elif has_unknown:
            group_evaluations.append(TriState.UNKNOWN)
            group_candidates_missing.append(group_missing)
        else:
            group_evaluations.append(TriState.TRUE)

    # Groups are ORed
    if any(g == TriState.TRUE for g in group_evaluations):
        status = EligibilityStatus.ELIGIBLE
    elif all(g == TriState.FALSE for g in group_evaluations):
        status = EligibilityStatus.NOT_ELIGIBLE
    else:
        status = EligibilityStatus.NEEDS_INFO
        # Collect missing fields from groups that could still pass (i.e. groups without FALSE)
        for g_missing in group_candidates_missing:
            for field in g_missing:
                if field not in missing_fields_set:
                    missing_fields_set.append(field)

    return EligibilityResult(
        scheme_id=scheme.id,
        status=status,
        passed_rules=passed_rules,
        failed_rules=failed_rules,
        missing_fields=missing_fields_set,
        no_rules=False,
    )


def match_all(profile: Any, schemes: list[SchemeInput]) -> list[EligibilityResult]:
    """Evaluate and rank all schemes for a profile.

    Ranking order:
    1. ELIGIBLE schemes
    2. NEEDS_INFO schemes (ordered by fewest missing fields)
    3. NOT_ELIGIBLE schemes
    """
    results = [evaluate_scheme(profile, scheme) for scheme in schemes]

    def rank_key(res: EligibilityResult) -> tuple[int, int]:
        if res.status == EligibilityStatus.ELIGIBLE:
            return (0, 0)
        elif res.status == EligibilityStatus.NEEDS_INFO:
            return (1, len(res.missing_fields))
        else:
            return (2, 0)

    return sorted(results, key=rank_key)


def next_best_question(
    profile: Any,
    schemes: list[SchemeInput],
    answered_fields: set[str] | list[str],
) -> str | None:
    """Find the unanswered profile field appearing in most NEEDS_INFO schemes."""
    answered = set(answered_fields)
    results = [evaluate_scheme(profile, s) for s in schemes]

    field_counts: Counter[str] = Counter()
    for res in results:
        if res.status == EligibilityStatus.NEEDS_INFO:
            for f in res.missing_fields:
                if f not in answered:
                    field_counts[f] += 1

    if not field_counts:
        return None

    # Pick field with highest count, tie-breaker alphabetical
    best_field, _ = sorted(field_counts.items(), key=lambda item: (-item[1], item[0]))[0]
    return best_field
