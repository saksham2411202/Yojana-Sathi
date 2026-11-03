"""Development seed script — populates sample needs, schemes, and questions.

Idempotent: safe to run multiple times.
"""
from __future__ import annotations

import os
import sys
from datetime import date
from pathlib import Path

# Ensure backend is on PYTHONPATH
ROOT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT_DIR / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from sqlalchemy import select
from app.db.session import SessionLocal
from app.models.base import Need, Question, Scheme, SchemeDocument, SchemeNeed, SchemeRule


def seed() -> None:
    session = SessionLocal()
    try:
        # 1. Needs (health, education, farming)
        needs_data = [
            {
                "slug": "health",
                "icon": "heart-pulse",
                "label": {"en": "SAMPLE - Healthcare & Medical", "hi": "SAMPLE - स्वास्थ्य एवं चिकित्सा"},
            },
            {
                "slug": "education",
                "icon": "graduation-cap",
                "label": {"en": "SAMPLE - Education & Scholarships", "hi": "SAMPLE - शिक्षा एवं छात्रवृत्ति"},
            },
            {
                "slug": "farming",
                "icon": "tractor",
                "label": {"en": "SAMPLE - Agriculture & Farming", "hi": "SAMPLE - कृषि एवं किसानी"},
            },
        ]

        needs_by_slug: dict[str, Need] = {}
        for nd in needs_data:
            need = session.execute(select(Need).where(Need.slug == nd["slug"])).scalar_one_or_none()
            if not need:
                need = Need(slug=nd["slug"], icon=nd["icon"], label=nd["label"])
                session.add(need)
                session.flush()
            else:
                need.icon = nd["icon"]
                need.label = nd["label"]
            needs_by_slug[nd["slug"]] = need

        # 2. Schemes
        schemes_data = [
            {
                "name": "SAMPLE - Ayushman Health Support",
                "name_local": {"en": "SAMPLE - Ayushman Health Support", "hi": "SAMPLE - आयुष्मान स्वास्थ्य सहायता"},
                "ministry": "Ministry of Health and Family Welfare",
                "level": "central",
                "state": None,
                "benefit_summary": {"en": "SAMPLE - Free medical care up to 5 Lakhs", "hi": "SAMPLE - 5 लाख तक मुफ्त चिकित्सा"},
                "source_url": "https://example.gov.in/health",
                "last_verified": date(2026, 1, 1),
                "is_active": True,
                "need_slugs": ["health"],
                "rules": [
                    {"field": "has_bpl_card", "operator": "eq", "value": True, "rule_group": 0, "is_required": True, "review_status": "approved"},
                    {"field": "annual_income", "operator": "lte", "value": 250000, "rule_group": 0, "is_required": True, "review_status": "approved"},
                ],
                "documents": [
                    {
                        "document_name": {"en": "SAMPLE - Ration Card", "hi": "SAMPLE - राशन कार्ड"},
                        "where_to_obtain": {"en": "Food & Civil Supplies Dept", "hi": "खाद्य एवं नागरिक आपूर्ति विभाग"},
                        "is_mandatory": True,
                    }
                ],
            },
            {
                "name": "SAMPLE - National Merit Scholarship",
                "name_local": {"en": "SAMPLE - National Merit Scholarship", "hi": "SAMPLE - राष्ट्रीय मेधा छात्रवृत्ति"},
                "ministry": "Ministry of Education",
                "level": "central",
                "state": None,
                "benefit_summary": {"en": "SAMPLE - Annual scholarship for higher studies", "hi": "SAMPLE - उच्च शिक्षा हेतु वार्षिक छात्रवृत्ति"},
                "source_url": "https://example.gov.in/scholarship",
                "last_verified": date(2026, 1, 1),
                "is_active": True,
                "need_slugs": ["education"],
                "rules": [
                    {"field": "is_student", "operator": "eq", "value": True, "rule_group": 0, "is_required": True, "review_status": "approved"},
                    {"field": "age", "operator": "lte", "value": 25, "rule_group": 0, "is_required": True, "review_status": "approved"},
                ],
                "documents": [
                    {
                        "document_name": {"en": "SAMPLE - Student Identity Card", "hi": "SAMPLE - छात्र पहचान पत्र"},
                        "where_to_obtain": {"en": "Educational Institution", "hi": "शिक्षण संस्थान"},
                        "is_mandatory": True,
                    }
                ],
            },
            {
                "name": "SAMPLE - Farmer Income Guarantee",
                "name_local": {"en": "SAMPLE - Farmer Income Guarantee", "hi": "SAMPLE - किसान आय गारंटी"},
                "ministry": "Ministry of Agriculture",
                "level": "central",
                "state": None,
                "benefit_summary": {"en": "SAMPLE - Direct benefit transfer for small farmers", "hi": "SAMPLE - छोटे किसानों के लिए प्रत्यक्ष लाभ"},
                "source_url": "https://example.gov.in/farming",
                "last_verified": date(2026, 1, 1),
                "is_active": True,
                "need_slugs": ["farming"],
                "rules": [
                    {"field": "occupation", "operator": "eq", "value": "farmer", "rule_group": 0, "is_required": True, "review_status": "approved"},
                    {"field": "land_holding_hectares", "operator": "lte", "value": 2.0, "rule_group": 0, "is_required": True, "review_status": "approved"},
                ],
                "documents": [
                    {
                        "document_name": {"en": "SAMPLE - Land Holding Certificate", "hi": "SAMPLE - भू-अभिलेख प्रमाण पत्र"},
                        "where_to_obtain": {"en": "Tehsil Office", "hi": "तहसील कार्यालय"},
                        "is_mandatory": True,
                    }
                ],
            },
        ]

        for sd in schemes_data:
            scheme = session.execute(select(Scheme).where(Scheme.name == sd["name"])).scalar_one_or_none()
            if not scheme:
                scheme = Scheme(
                    name=sd["name"],
                    name_local=sd["name_local"],
                    ministry=sd["ministry"],
                    level=sd["level"],
                    state=sd["state"],
                    benefit_summary=sd["benefit_summary"],
                    source_url=sd["source_url"],
                    last_verified=sd["last_verified"],
                    is_active=sd["is_active"],
                )
                session.add(scheme)
                session.flush()
            else:
                scheme.name_local = sd["name_local"]
                scheme.ministry = sd["ministry"]
                scheme.level = sd["level"]
                scheme.state = sd["state"]
                scheme.benefit_summary = sd["benefit_summary"]
                scheme.source_url = sd["source_url"]
                scheme.last_verified = sd["last_verified"]
                scheme.is_active = sd["is_active"]
                session.flush()

            # Associations
            for slug in sd["need_slugs"]:
                need = needs_by_slug[slug]
                link = session.execute(
                    select(SchemeNeed).where(SchemeNeed.scheme_id == scheme.id, SchemeNeed.need_id == need.id)
                ).scalar_one_or_none()
                if not link:
                    session.add(SchemeNeed(scheme_id=scheme.id, need_id=need.id))

            # Rules
            for rd in sd["rules"]:
                rule = session.execute(
                    select(SchemeRule).where(SchemeRule.scheme_id == scheme.id, SchemeRule.field == rd["field"])
                ).scalar_one_or_none()
                if not rule:
                    session.add(
                        SchemeRule(
                            scheme_id=scheme.id,
                            field=rd["field"],
                            operator=rd["operator"],
                            value=rd["value"],
                            rule_group=rd["rule_group"],
                            is_required=rd["is_required"],
                            review_status=rd["review_status"],
                        )
                    )
                else:
                    rule.operator = rd["operator"]
                    rule.value = rd["value"]
                    rule.rule_group = rd["rule_group"]
                    rule.is_required = rd["is_required"]
                    rule.review_status = rd["review_status"]

            # Documents
            for doc in sd["documents"]:
                doc_record = session.execute(
                    select(SchemeDocument).where(
                        SchemeDocument.scheme_id == scheme.id,
                        SchemeDocument.document_name["en"].astext == doc["document_name"]["en"],
                    )
                ).scalar_one_or_none()
                if not doc_record:
                    session.add(
                        SchemeDocument(
                            scheme_id=scheme.id,
                            document_name=doc["document_name"],
                            where_to_obtain=doc["where_to_obtain"],
                            is_mandatory=doc["is_mandatory"],
                        )
                    )

        # 3. Eight Questions
        questions_data = [
            {
                "profile_field": "age",
                "input_type": "number",
                "options": None,
                "validation": {"min": 0, "max": 120},
                "label": {"en": "SAMPLE - What is your age?", "hi": "SAMPLE - आपकी आयु क्या है?"},
                "help_text": {"en": "Enter completed years", "hi": "पूर्ण वर्ष दर्ज करें"},
            },
            {
                "profile_field": "state",
                "input_type": "state_picker",
                "options": None,
                "validation": None,
                "label": {"en": "SAMPLE - Which state do you live in?", "hi": "SAMPLE - आप किस राज्य में रहते हैं?"},
                "help_text": {"en": "Select your domicile state", "hi": "अपना मूल राज्य चुनें"},
            },
            {
                "profile_field": "annual_income",
                "input_type": "number",
                "options": None,
                "validation": {"min": 0},
                "label": {"en": "SAMPLE - What is your annual family income (in INR)?", "hi": "SAMPLE - आपकी वार्षिक पारिवारिक आय कितनी है?"},
                "help_text": {"en": "Approximate total yearly income", "hi": "अनुमानित कुल वार्षिक आय"},
            },
            {
                "profile_field": "category",
                "input_type": "single_choice",
                "options": ["GEN", "OBC", "SC", "ST"],
                "validation": None,
                "label": {"en": "SAMPLE - Select your social category", "hi": "SAMPLE - अपना सामाजिक वर्ग चुनें"},
                "help_text": None,
            },
            {
                "profile_field": "occupation",
                "input_type": "single_choice",
                "options": ["farmer", "student", "salaried", "self_employed", "unemployed", "other"],
                "validation": None,
                "label": {"en": "SAMPLE - What is your occupation?", "hi": "SAMPLE - आपका व्यवसाय क्या है?"},
                "help_text": None,
            },
            {
                "profile_field": "has_bpl_card",
                "input_type": "yes_no",
                "options": None,
                "validation": None,
                "label": {"en": "SAMPLE - Do you hold a BPL (Below Poverty Line) card?", "hi": "SAMPLE - क्या आपके पास बीपीएल कार्ड है?"},
                "help_text": None,
            },
            {
                "profile_field": "is_student",
                "input_type": "yes_no",
                "options": None,
                "validation": None,
                "label": {"en": "SAMPLE - Are you currently a student?", "hi": "SAMPLE - क्या आप वर्तमान में छात्र हैं?"},
                "help_text": None,
            },
            {
                "profile_field": "land_holding_hectares",
                "input_type": "number",
                "options": None,
                "validation": {"min": 0.0},
                "label": {"en": "SAMPLE - How many hectares of agricultural land do you own?", "hi": "SAMPLE - आपके पास कितने हेक्टेयर कृषि भूमि है?"},
                "help_text": None,
            },
        ]

        for qd in questions_data:
            q = session.execute(select(Question).where(Question.profile_field == qd["profile_field"])).scalar_one_or_none()
            if not q:
                q = Question(
                    profile_field=qd["profile_field"],
                    input_type=qd["input_type"],
                    options=qd["options"],
                    validation=qd["validation"],
                    label=qd["label"],
                    help_text=qd["help_text"],
                    version=1,
                )
                session.add(q)
            else:
                q.input_type = qd["input_type"]
                q.options = qd["options"]
                q.validation = qd["validation"]
                q.label = qd["label"]
                q.help_text = qd["help_text"]

        session.commit()
        print("Dev seed completed successfully.")
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


if __name__ == "__main__":
    seed()

