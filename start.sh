#!/bin/bash

# Define cleanup function for graceful exit
cleanup() {
  echo ""
  echo "Stopping all services..."
  if [ -n "$FASTAPI_PID" ]; then
    echo "Stopping FastAPI ML service (PID: $FASTAPI_PID)..."
    kill "$FASTAPI_PID" 2>/dev/null || true
  fi
  if [ -n "$NEXT_PID" ]; then
    echo "Stopping Next.js dev server (PID: $NEXT_PID)..."
    kill "$NEXT_PID" 2>/dev/null || true
  fi
  exit 0
}

# Trap Ctrl+C (SIGINT) and termination signals (SIGTERM)
trap cleanup SIGINT SIGTERM

echo "============================================="
echo "   Sentinel AI - Unified Dev Stack Runner   "
echo "============================================="

# 1. Start FastAPI Service
if [ -d ".venv" ]; then
  echo "Starting FastAPI ML service in background..."
  .venv/bin/uvicorn ml_service.main:app --host 127.0.0.1 --port 8000 > fastapi.log 2>&1 &
  FASTAPI_PID=$!
  echo "FastAPI started with PID: $FASTAPI_PID. Logs routed to fastapi.log"
else
  echo "WARNING: Python virtual environment (.venv) not found. FastAPI service cannot be started."
  echo "Next.js will run using local fallback mock scoring mode."
fi

# 2. Start Next.js App
echo "Starting Next.js dev server..."
npm run dev &
NEXT_PID=$!
echo "Next.js dev server started with PID: $NEXT_PID"

# Wait for background processes to keep script alive
wait
