# Ariel - Audiobook Generator
# Common development commands
#
# NOTE: Always use these 'just' commands instead of running 'uv' directly
# for consistency and to ensure proper environment setup.

# Install dependencies
install:
    uv sync

# Install with dev dependencies
install-dev:
    uv sync --extra dev

# Run the CLI
run *args:
    uv run ariel {{args}}

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
    uv run pytest --cov=ariel

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
    uv run ariel convert {{file}}

# Show help
help:
    @just --list