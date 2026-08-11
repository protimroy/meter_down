#!/usr/bin/env bash
set -euo pipefail
uv sync
exec uv run uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
