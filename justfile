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
    .venv/bin/python -m mypy src/

# Run tests
test:
    .venv/bin/python -m pytest

# Run tests with coverage
test-cov:
    .venv/bin/python -m pytest --cov=ariel

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

# Start the web server
web port="8000":
    .venv/bin/python -m uvicorn ariel.web.app:app --host 0.0.0.0 --port {{port}} --reload

# Frontend commands
frontend-install:
    cd frontend && bun install

frontend-dev:
    cd frontend && bun dev

frontend-build:
    cd frontend && bun build

frontend-lint:
    cd frontend && bun run lint

# Start both backend and frontend
dev-all:
    just web 8000 &
    just frontend-dev

docker-logs-last:
    docker compose logs --tail 100

# Run BDD tests against running containers
test-bdd:
    cd frontend && bun run test

# Quick test - just verify services are running
test-quick:
    curl -f http://localhost:8000/health
    curl -f -I http://localhost:5173

# Comprehensive integration test
test-integration:
    ./tests/integration_test.sh

# Show help
help:
    @just --list
