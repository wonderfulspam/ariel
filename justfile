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

# Run pre-commit hooks
pre-commit:
    .venv/bin/python -m pre_commit run --all-files

# Install pre-commit hooks
pre-commit-install:
    .venv/bin/python -m pre_commit install

# Update pre-commit hooks
pre-commit-update:
    .venv/bin/python -m pre_commit autoupdate

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

# Jujutsu version control commands
jj-status:
    jj status

jj-log n="10":
    jj log -n {{n}}

jj-new desc="":
    jj new {{ if desc != "" { "-m '" + desc + "'" } else { "" } }}

jj-describe:
    jj describe

jj-commit msg:
    jj commit --message "{{msg}}"

# Frontend commands
frontend-install:
    cd frontend && bun install

# Install Playwright browsers and dependencies
frontend-install-browsers:
    cd frontend && bun run playwright install --with-deps

# Install just Playwright browsers (no system deps)
frontend-install-browsers-only:
    cd frontend && bun run playwright install

# Fix Tailwind PostCSS setup
frontend-fix-tailwind:
    cd frontend && bun add --dev @tailwindcss/postcss

frontend-dev:
    cd frontend && bun dev

frontend-build:
    cd frontend && bun build

frontend-test:
    cd frontend && bun run test

frontend-test-headed:
    cd frontend && bun run test:headed

frontend-test-ui:
    cd frontend && bun run test:ui

frontend-test-debug:
    cd frontend && bun run test:debug

frontend-lint:
    cd frontend && bun run lint

# Setup playwright-mcp
playwright-mcp-setup:
    cd frontend && bun run playwright-mcp setup

# Start both backend and frontend
dev-all:
    just web 8000 &
    just frontend-dev

# Start web server in background for testing
start-backend:
    .venv/bin/python -m uvicorn ariel.web.app:app --host 0.0.0.0 --port 8000 &

# Stop background processes
stop-backend:
    pkill -f "uvicorn ariel.web.app:app"

# Docker commands
docker-build:
    docker compose build

docker-up:
    docker compose up -d

docker-down:
    docker compose down

docker-logs:
    docker compose logs -f

# Development with hot reloading
dev-up:
    docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

dev-down:
    docker compose -f docker-compose.yml -f docker-compose.dev.yml down

dev-logs:
    docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f

# Test in containerized environment
test-containers:
    docker compose -f docker-compose.yml -f docker-compose.dev.yml --profile testing up --abort-on-container-exit

# Quick test - just verify services are running
test-quick:
    curl -f http://localhost:8000/health
    curl -f -I http://localhost:5173

# Clean up everything
docker-clean:
    docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v
    docker system prune -f

# Build and run development environment
dev: dev-up

# Build and run production environment
prod: docker-up

# View services status
status:
    docker compose -f docker-compose.yml -f docker-compose.dev.yml ps

# Restart services
restart: dev-down dev-up

# Follow logs for specific service
logs-backend:
    docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f backend

logs-frontend:
    docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f frontend

# Show help
help:
    @just --list
