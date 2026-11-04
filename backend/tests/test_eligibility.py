"""Tests for pure Python deterministic eligibility engine."""
from app.schemas.eligibility import (
    EligibilityStatus,
    RuleInput,
    SchemeInput,
    TriState,
)
from app.schemas.profile import UserProfile
from app.services.eligibility import (
    evaluate_rule,
    evaluate_scheme,
    match_all,
    next_best_question,
)

# ─── Operator Tests ──────────────────────────────────────────────────────────

def test_operator_eq_match() -> None:
    rule = RuleInput(field="state", operator="eq", value="Delhi")
    assert evaluate_rule(rule, "Delhi") == TriState.TRUE


def test_operator_eq_mismatch() -> None:
    rule = RuleInput(field="state", operator="eq", value="Delhi")
    assert evaluate_rule(rule, "Punjab") == TriState.FALSE


def test_operator_neq_match() -> None:
    rule = RuleInput(field="category", operator="neq", value="GEN")
    assert evaluate_rule(rule, "OBC") == TriState.TRUE


def test_operator_neq_mismatch() -> None:
    rule = RuleInput(field="category", operator="neq", value="GEN")
    assert evaluate_rule(rule, "GEN") == TriState.FALSE


def test_operator_gt_greater() -> None:
    rule = RuleInput(field="age", operator="gt", value=18)
    assert evaluate_rule(rule, 19) == TriState.TRUE


def test_operator_gt_boundary() -> None:
    rule = RuleInput(field="age", operator="gt", value=18)
    assert evaluate_rule(rule, 18) == TriState.FALSE


def test_operator_gt_less() -> None:
    rule = RuleInput(field="age", operator="gt", value=18)
    assert evaluate_rule(rule, 17) == TriState.FALSE


def test_operator_gte_greater() -> None:
    rule = RuleInput(field="age", operator="gte", value=18)
    assert evaluate_rule(rule, 19) == TriState.TRUE


def test_operator_gte_boundary() -> None:
    rule = RuleInput(field="age", operator="gte", value=18)
    assert evaluate_rule(rule, 18) == TriState.TRUE


def test_operator_gte_less() -> None:
    rule = RuleInput(field="age", operator="gte", value=18)
    assert evaluate_rule(rule, 17) == TriState.FALSE


def test_operator_lt_less() -> None:
    rule = RuleInput(field="annual_income", operator="lt", value=250000)
    assert evaluate_rule(rule, 200000) == TriState.TRUE


def test_operator_lt_boundary() -> None:
    rule = RuleInput(field="annual_income", operator="lt", value=250000)
    assert evaluate_rule(rule, 250000) == TriState.FALSE


def test_operator_lt_greater() -> None:
    rule = RuleInput(field="annual_income", operator="lt", value=250000)
    assert evaluate_rule(rule, 300000) == TriState.FALSE


def test_operator_lte_less() -> None:
    rule = RuleInput(field="annual_income", operator="lte", value=250000)
    assert evaluate_rule(rule, 200000) == TriState.TRUE


def test_operator_lte_boundary() -> None:
    rule = RuleInput(field="annual_income", operator="lte", value=250000)
    assert evaluate_rule(rule, 250000) == TriState.TRUE


def test_operator_lte_greater() -> None:
    rule = RuleInput(field="annual_income", operator="lte", value=250000)
    assert evaluate_rule(rule, 300000) == TriState.FALSE


def test_operator_in_present() -> None:
    rule = RuleInput(field="occupation", operator="in", value=["farmer", "artisan"])
    assert evaluate_rule(rule, "farmer") == TriState.TRUE


def test_operator_in_absent() -> None:
    rule = RuleInput(field="occupation", operator="in", value=["farmer", "artisan"])
    assert evaluate_rule(rule, "engineer") == TriState.FALSE


def test_operator_not_in_absent() -> None:
    rule = RuleInput(field="category", operator="not_in", value=["GEN"])
    assert evaluate_rule(rule, "SC") == TriState.TRUE


def test_operator_not_in_present() -> None:
    rule = RuleInput(field="category", operator="not_in", value=["GEN"])
    assert evaluate_rule(rule, "GEN") == TriState.FALSE


# ─── None and Unknown Handling ───────────────────────────────────────────────

def test_unknown_none_value() -> None:
    rule = RuleInput(field="age", operator="gte", value=18)
    assert evaluate_rule(rule, None) == TriState.UNKNOWN


def test_unknown_string_unknown() -> None:
    rule = RuleInput(field="occupation", operator="eq", value="farmer")
    assert evaluate_rule(rule, "unknown") == TriState.UNKNOWN
    assert evaluate_rule(rule, "UNKNOWN") == TriState.UNKNOWN


def test_unknown_string_dont_know() -> None:
    rule = RuleInput(field="has_bpl_card", operator="eq", value=True)
    assert evaluate_rule(rule, "don't know") == TriState.UNKNOWN
    assert evaluate_rule(rule, "dont_know") == TriState.UNKNOWN


# ─── Group Semantics (AND / OR) ──────────────────────────────────────────────

def test_group_and_all_true() -> None:
    scheme = SchemeInput(
        id=1,
        rules=[
            RuleInput(field="age", operator="gte", value=18, rule_group=0),
            RuleInput(field="is_student", operator="eq", value=True, rule_group=0),
        ],
    )
    res = evaluate_scheme({"age": 20, "is_student": True}, scheme)
    assert res.status == EligibilityStatus.ELIGIBLE
    assert len(res.passed_rules) == 2
    assert len(res.failed_rules) == 0


def test_group_and_one_false() -> None:
    scheme = SchemeInput(
        id=1,
        rules=[
            RuleInput(field="age", operator="gte", value=18, rule_group=0),
            RuleInput(field="is_student", operator="eq", value=True, rule_group=0),
        ],
    )
    res = evaluate_scheme({"age": 20, "is_student": False}, scheme)
    assert res.status == EligibilityStatus.NOT_ELIGIBLE
    assert len(res.passed_rules) == 1
    assert len(res.failed_rules) == 1


def test_group_and_one_unknown_needs_info() -> None:
    scheme = SchemeInput(
        id=1,
        rules=[
            RuleInput(field="age", operator="gte", value=18, rule_group=0),
            RuleInput(field="is_student", operator="eq", value=True, rule_group=0),
        ],
    )
    res = evaluate_scheme({"age": 20, "is_student": None}, scheme)
    assert res.status == EligibilityStatus.NEEDS_INFO
    assert res.missing_fields == ["is_student"]


def test_group_or_one_group_passes() -> None:
    scheme = SchemeInput(
        id=2,
        rules=[
            RuleInput(field="occupation", operator="eq", value="farmer", rule_group=0),
            RuleInput(field="land_holding_hectares", operator="lte", value=2.0, rule_group=0),
            RuleInput(field="is_student", operator="eq", value=True, rule_group=1),
        ],
    )
    res = evaluate_scheme({"occupation": "salaried", "land_holding_hectares": 5.0, "is_student": True}, scheme)
    assert res.status == EligibilityStatus.ELIGIBLE


def test_group_or_all_groups_fail() -> None:
    scheme = SchemeInput(
        id=2,
        rules=[
            RuleInput(field="occupation", operator="eq", value="farmer", rule_group=0),
            RuleInput(field="is_student", operator="eq", value=True, rule_group=1),
        ],
    )
    res = evaluate_scheme({"occupation": "salaried", "is_student": False}, scheme)
    assert res.status == EligibilityStatus.NOT_ELIGIBLE


def test_missing_fields_only_from_viable_groups() -> None:
    scheme = SchemeInput(
        id=3,
        rules=[
            RuleInput(field="age", operator="gte", value=18, rule_group=0),
            RuleInput(field="state", operator="eq", value="Bihar", rule_group=0),
            RuleInput(field="occupation", operator="eq", value="farmer", rule_group=1),
            RuleInput(field="land_holding_hectares", operator="lte", value=2.0, rule_group=1),
        ],
    )
    profile = {"age": 15, "state": None, "occupation": "farmer", "land_holding_hectares": None}
    res = evaluate_scheme(profile, scheme)
    assert res.status == EligibilityStatus.NEEDS_INFO
    assert res.missing_fields == ["land_holding_hectares"]


# ─── Unapproved and Empty Rules ──────────────────────────────────────────────

def test_unapproved_rules_ignored() -> None:
    scheme = SchemeInput(
        id=4,
        rules=[
            RuleInput(field="age", operator="gte", value=18, review_status="approved"),
            RuleInput(field="state", operator="eq", value="Delhi", review_status="pending"),
            RuleInput(field="has_bpl_card", operator="eq", value=True, review_status="rejected"),
        ],
    )
    res = evaluate_scheme({"age": 25}, scheme)
    assert res.status == EligibilityStatus.ELIGIBLE


def test_scheme_with_no_approved_rules() -> None:
    scheme = SchemeInput(
        id=5,
        rules=[
            RuleInput(field="age", operator="gte", value=18, review_status="pending"),
        ],
    )
    res = evaluate_scheme({"age": 25}, scheme)
    assert res.status == EligibilityStatus.NEEDS_INFO
    assert res.no_rules is True


def test_scheme_with_empty_rules() -> None:
    scheme = SchemeInput(id=6, rules=[])
    res = evaluate_scheme({"age": 25}, scheme)
    assert res.status == EligibilityStatus.NEEDS_INFO
    assert res.no_rules is True


# ─── Pydantic UserProfile Input Support ──────────────────────────────────────

def test_with_pydantic_user_profile() -> None:
    profile = UserProfile(age=22, occupation="farmer", land_holding_hectares=1.5)
    scheme = SchemeInput(
        id=7,
        rules=[
            RuleInput(field="occupation", operator="eq", value="farmer", rule_group=0),
            RuleInput(field="land_holding_hectares", operator="lte", value=2.0, rule_group=0),
        ],
    )
    res = evaluate_scheme(profile, scheme)
    assert res.status == EligibilityStatus.ELIGIBLE


# ─── Ranking in match_all ────────────────────────────────────────────────────

def test_match_all_ranking_order() -> None:
    scheme_eligible = SchemeInput(
        id="s_eligible",
        rules=[RuleInput(field="age", operator="gte", value=18)],
    )
    scheme_needs_info_1 = SchemeInput(
        id="s_info_1",
        rules=[
            RuleInput(field="age", operator="gte", value=18),
            RuleInput(field="state", operator="eq", value="Delhi"),
        ],
    )
    scheme_needs_info_2 = SchemeInput(
        id="s_info_2",
        rules=[
            RuleInput(field="age", operator="gte", value=18),
            RuleInput(field="state", operator="eq", value="Delhi"),
            RuleInput(field="occupation", operator="eq", value="farmer"),
        ],
    )
    scheme_not_eligible = SchemeInput(
        id="s_not_eligible",
        rules=[RuleInput(field="age", operator="lt", value=10)],
    )

    profile = {"age": 25, "state": None, "occupation": None}
    schemes = [scheme_not_eligible, scheme_needs_info_2, scheme_eligible, scheme_needs_info_1]

    results = match_all(profile, schemes)
    ids = [r.scheme_id for r in results]
    assert ids == ["s_eligible", "s_info_1", "s_info_2", "s_not_eligible"]


# ─── next_best_question Selection ───────────────────────────────────────────

def test_next_best_question_picks_most_frequent_field() -> None:
    s1 = SchemeInput(
        id=1,
        rules=[
            RuleInput(field="age", operator="gte", value=18),
            RuleInput(field="state", operator="eq", value="Delhi"),
        ],
    )
    s2 = SchemeInput(
        id=2,
        rules=[
            RuleInput(field="age", operator="gte", value=18),
            RuleInput(field="annual_income", operator="lte", value=100000),
        ],
    )
    profile = {"age": None, "state": None, "annual_income": None}
    best = next_best_question(profile, [s1, s2], answered_fields=[])
    assert best == "age"


def test_next_best_question_skips_answered_fields() -> None:
    s1 = SchemeInput(
        id=1,
        rules=[
            RuleInput(field="age", operator="gte", value=18),
            RuleInput(field="state", operator="eq", value="Delhi"),
        ],
    )
    s2 = SchemeInput(
        id=2,
        rules=[
            RuleInput(field="age", operator="gte", value=18),
            RuleInput(field="state", operator="eq", value="Punjab"),
        ],
    )
    profile = {"age": "don't know", "state": None}
    best = next_best_question(profile, [s1, s2], answered_fields=["age"])
    assert best == "state"


def test_next_best_question_returns_none_when_complete() -> None:
    s1 = SchemeInput(
        id=1,
        rules=[RuleInput(field="age", operator="gte", value=18)],
    )
    profile = {"age": 20}
    best = next_best_question(profile, [s1], answered_fields=["age"])
    assert best is None


def test_list_valued_profile_value_does_not_crash() -> None:
    rule = RuleInput(field="interests", operator="eq", value="sports")
    assert evaluate_rule(rule, ["sports", "music"]) == TriState.FALSE


def test_unknown_operator_returns_unknown() -> None:
    rule = RuleInput(field="age", operator="unsupported_op", value=18)
    assert evaluate_rule(rule, 20) == TriState.UNKNOWN


def test_type_mismatch_returns_unknown() -> None:
    rule = RuleInput(field="age", operator="gt", value=18)
    assert evaluate_rule(rule, "twenty") == TriState.UNKNOWN
