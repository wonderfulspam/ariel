# Aleph - Audiobook Generator
# Common development commands

# Install dependencies
install:
    uv sync

# Install with dev dependencies
install-dev:
    uv sync --group dev

# Run the CLI
run *args:
    uv run aleph {{args}}

# Run linting
lint:
    uv run ruff check .

# Fix linting issues
lint-fix:
    uv run ruff check --fix .

# Format code
format:
    uv run ruff format .

# Run type checking
typecheck:
    uv run mypy src/

# Run tests
test:
    uv run pytest

# Run tests with coverage
test-cov:
    uv run pytest --cov=aleph

# Run all checks (lint, typecheck, test)
check: lint typecheck test

# Clean build artifacts
clean:
    rm -rf build/ dist/ *.egg-info/ __pycache__/ .pytest_cache/ .mypy_cache/ .ruff_cache/

# Build the package
build:
    uv build

# Convert text to audiobook (example usage)
convert file="test_input.txt":
    uv run aleph convert {{file}}

# Show help
help:
    @just --list