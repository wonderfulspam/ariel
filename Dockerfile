# Backend Dockerfile with multi-stage build and optimal caching
FROM python:3.12-slim as base

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_CACHE_DIR=/tmp/uv-cache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Create app directory
WORKDIR /app

# Development stage
FROM base as development

# Copy dependency files first for better caching
COPY pyproject.toml uv.lock README.md ./

# Install dependencies with dev extras
RUN --mount=type=cache,target=/tmp/uv-cache \
    uv sync --extra dev --frozen

# Copy source code
COPY . .

# Install the package in editable mode
RUN --mount=type=cache,target=/tmp/uv-cache \
    uv pip install -e .

# Expose port
EXPOSE 8000

# Command for development with auto-reload
CMD ["uv", "run", "uvicorn", "ariel.web.app:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# Production stage
FROM base as production

# Copy dependency files first for better caching
COPY pyproject.toml uv.lock ./

# Install production dependencies only
RUN --mount=type=cache,target=/tmp/uv-cache \
    uv sync --frozen --no-dev

# Copy source code
COPY src/ ./src/
COPY README.md LICENSE ./

# Install the package
RUN --mount=type=cache,target=/tmp/uv-cache \
    uv pip install .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app
USER app

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl --fail http://localhost:8000/health || exit 1

# Command for production
CMD ["uv", "run", "uvicorn", "ariel.web.app:app", "--host", "0.0.0.0", "--port", "8000"]