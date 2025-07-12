# Frontend Dockerfile with Bun and multi-stage build
FROM oven/bun:1.2.18-slim as base

# Set working directory
WORKDIR /app

# Development stage
FROM base as development

# Copy package files first for better caching
COPY package.json bun.lock* ./

# Install dependencies
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Command for development with hot reloading
CMD ["bun", "run", "dev", "--host", "0.0.0.0"]

# Build stage
FROM base as build

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM nginx:alpine as production

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# Test stage (for running tests in CI)
FROM development as test

# Run tests
CMD ["bun", "run", "test"]