# Yojana Saathi

> Guided, multilingual Government Scheme Matcher for India.

## Quick Start (Local Dev)

### Prerequisites
- Python 3.11+
- Docker + Docker Compose
- Node.js 20+ (Phase 3)

### 1. Start the database
```bash
docker compose up db -d
```

### 2. Install backend dependencies
```bash
cd backend
pip install -e ".[dev]"
```

### 3. Run database migrations
```bash
cd backend
DATABASE_URL=postgresql+psycopg2://yojana:yojana_dev@localhost:5432/yojana_saathi \
  alembic upgrade head
```

### 4. Seed the database
```bash
cd ..
python -m scripts.seed_db
```

### 5. Start the backend
```bash
cd backend
uvicorn app.main:app --reload
# API docs at http://localhost:8000/docs
```

### 6. Run tests
```bash
cd backend
pytest -v
```

### 7. Lint & type-check
```bash
ruff check .
mypy app/
```

## Project Structure

```
yojana-saathi/
├── backend/          # FastAPI app (Python 3.11)
├── frontend/         # Next.js app (Phase 3)
├── scripts/          # Offline CLI scripts only
├── data/
│   ├── schemes/      # Scheme JSON files (source of truth)
│   └── questions/    # Question bank YAML files
└── docker-compose.yml
```

## Phase Status

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Scaffold + DB models + Rule engine | ✅ Complete |
| 2 | Session API + Question flow API | 🔜 Next |
| 3 | Next.js frontend + PWA | 🔜 Planned |
| 4 | Content expansion + TTS | 🔜 Planned |
| 5 | Hardening + Accessibility | 🔜 Planned |

## Non-Negotiable Design Decisions

- **No LLM in runtime**: All eligibility is deterministic rules.
- **Anonymous sessions**: No accounts, no PII, 24h expiry.
- **Zero-cost**: Every dependency is free/open-source, locally runnable.
- **Versioned question bank**: All translations are human-reviewed data files.
