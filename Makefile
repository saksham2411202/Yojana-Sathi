.PHONY: test lint typecheck run

test:
	cd backend && pytest

lint:
	cd backend && ruff check .

typecheck:
	cd backend && mypy --strict app

run:
	cd backend && uvicorn app.main:app --reload

