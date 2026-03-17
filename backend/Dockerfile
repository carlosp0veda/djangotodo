# Stage 1: Build
FROM python:3.12-slim AS builder

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt


# Stage 2: Final Runner
FROM python:3.12-slim AS runner

# Security: Create a non-root user
RUN addgroup --system appgroup && \
    adduser --system --ingroup appgroup appuser

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install only runtime shared libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy the venv from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy project files and set ownership
COPY --chown=appuser:appgroup . .

# Ensure appuser is used for the process
USER appuser

# Healthcheck (Added curl to apt-get above to make this work)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000

# Gunicorn setup for Docker:
# --timeout 60: Allow more time for workers to boot/respond
# --worker-tmp-dir /dev/shm: Avoid blocking on disk I/O in Docker
# --access-logfile - --error-logfile -: Send logs to stdout/stderr
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "60", "--worker-tmp-dir", "/dev/shm", "--access-logfile", "-", "--error-logfile", "-", "server.wsgi:application"]