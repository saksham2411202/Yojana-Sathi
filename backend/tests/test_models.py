"""Model validation and integrity tests."""
import pytest
from app.models.base import Question, SchemeRule
from app.schemas.profile import PROFILE_FIELDS


def test_scheme_rule_valid_field() -> None:
    rule = SchemeRule(
        scheme_id=1,
        field="age",
        operator="gte",
        value=18,
    )
    assert rule.field == "age"


def test_scheme_rule_invalid_field_rejected() -> None:
    with pytest.raises(ValueError, match="Invalid scheme rule field"):
        SchemeRule(
            scheme_id=1,
            field="non_existent_field_123",
            operator="eq",
            value="test",
        )


def test_question_valid_profile_field() -> None:
    q = Question(
        profile_field="annual_income",
        input_type="number",
        label={"en": "Income"},
    )
    assert q.profile_field == "annual_income"


def test_question_invalid_profile_field_rejected() -> None:
    with pytest.raises(ValueError, match="Invalid question profile_field"):
        Question(
            profile_field="fake_profile_field",
            input_type="number",
            label={"en": "Fake"},
        )


def test_profile_fields_exported() -> None:
    assert "age" in PROFILE_FIELDS
    assert "annual_income" in PROFILE_FIELDS
    assert "category" in PROFILE_FIELDS
    assert "occupation" in PROFILE_FIELDS

