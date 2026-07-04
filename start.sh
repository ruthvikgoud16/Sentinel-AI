#!/bin/bash

# Define cleanup function for graceful exit
cleanup() {
  echo ""
  echo "---------------------------------------------"
  echo "Teardown: Stopping all dev services..."
  if [ -n "$FASTAPI_PID" ]; then
    echo "Stopping FastAPI ML service (PID: $FASTAPI_PID)..."
    kill "$FASTAPI_PID" 2>/dev/null || true
  fi
  if [ -n "$NEXT_PID" ]; then
    echo "Stopping Next.js dev server (PID: $NEXT_PID)..."
    kill "$NEXT_PID" 2>/dev/null || true
  fi
  echo "All services stopped cleanly."
  echo "---------------------------------------------"
  exit 0
}

# Trap Ctrl+C (SIGINT) and termination signals (SIGTERM)
trap cleanup SIGINT SIGTERM

echo "=========================================================="
echo "      Sentinel AI - Unified Dev Stack Startup Runner     "
echo "=========================================================="

# 1. Start FastAPI ML Service in background
if [ -d ".venv" ]; then
  echo "[1/3] Starting FastAPI ML service in background..."
  .venv/bin/uvicorn ml_service.main:app --host 127.0.0.1 --port 8000 > fastapi.log 2>&1 &
  FASTAPI_PID=$!
  
  # 2. Poll FastAPI Health endpoint
  echo "[2/3] Waiting for FastAPI ML service to be ready..."
  READY=0
  TIMEOUT=20 # 20 attempts of 0.5 seconds = 10s timeout
  for ((i=1; i<=TIMEOUT; i++)); do
    if curl -s http://127.0.0.1:8000/health | grep -q "healthy"; then
      echo "  -> FastAPI ready on http://127.0.0.1:8000 :8000"
      READY=1
      break
    fi
    sleep 0.5
  done

  if [ $READY -eq 0 ]; then
    echo "  -> WARNING: FastAPI startup timed out or failed. Check fastapi.log"
    echo "     Next.js will fall back to local offline mock scoring."
  fi
else
  echo "[1/3] WARNING: Python virtual environment (.venv) not found."
  echo "      Next.js will run using local fallback mock scoring mode."
fi

# 3. Start Next.js App
echo "[3/3] Starting Next.js dev server..."
npm run dev &
NEXT_PID=$!
echo "  -> Next.js ready on http://localhost:3000 :3000"

# Keep script alive and wait for services to complete
wait
