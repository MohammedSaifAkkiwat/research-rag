# Dockerfile

# Base image — starts from an official Python 3.11 image
# "slim" = minimal OS, smaller image size
FROM python:3.11-slim

# Set working directory inside the container
WORKDIR /app

# ============================================================
# CONCEPT: Layer Caching
# ============================================================
# Docker builds images in layers. Each instruction is a layer.
# If a layer hasn't changed, Docker reuses the cached version.
# 
# CRITICAL OPTIMIZATION: Copy requirements.txt BEFORE copying code.
# Requirements change rarely; code changes constantly.
# If we copied code first, changing one line of code would
# invalidate the "pip install" layer and reinstall everything.
# This way: code changes → only copy layer reruns (fast)
#           requirements change → pip install reruns (acceptable)

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create directories the app needs
RUN mkdir -p chroma_db uploads

# ============================================================
# CONCEPT: Non-root User
# ============================================================
# Running as root inside a container is a security risk.
# If someone exploits your app, they'd have root access.
# Create a non-root user and run as them.

RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# The port your app listens on (documentation only — doesn't actually expose it)
EXPOSE 8000

# The command that runs when the container starts
# gunicorn is a production-grade process manager for uvicorn workers
# -w 2 = 2 worker processes (for concurrency)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]