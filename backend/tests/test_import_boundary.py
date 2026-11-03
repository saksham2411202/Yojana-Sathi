"""Verify the import boundary: runtime code must not import offline_providers."""
from __future__ import annotations

import ast
import pathlib

# Modules that must NEVER import from app.offline_providers
RUNTIME_PACKAGES = {"api", "core", "db", "models", "schemas", "services"}
FORBIDDEN_IMPORT = "app.offline_providers"


def _collect_imports(filepath: pathlib.Path) -> list[str]:
    """Return all import source strings from a Python file."""
    source = filepath.read_text(encoding="utf-8")
    tree = ast.parse(source, filename=str(filepath))
    imports: list[str] = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                imports.append(alias.name)
        elif isinstance(node, ast.ImportFrom) and node.module:
            imports.append(node.module)
    return imports


def test_runtime_does_not_import_offline_providers() -> None:
    app_root = pathlib.Path(__file__).resolve().parent.parent / "app"
    violations: list[str] = []
    for pkg in RUNTIME_PACKAGES:
        pkg_dir = app_root / pkg
        if not pkg_dir.exists():
            continue
        for py_file in pkg_dir.rglob("*.py"):
            for imp in _collect_imports(py_file):
                if imp.startswith(FORBIDDEN_IMPORT):
                    violations.append(f"{py_file.relative_to(app_root)}: imports {imp}")
    assert violations == [], "Runtime code imports offline_providers:\n" + "\n".join(violations)

