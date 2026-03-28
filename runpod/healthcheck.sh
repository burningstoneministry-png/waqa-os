#!/bin/bash
# =============================================================================
# healthcheck.sh — Diagnose problems with the Ollama + Open WebUI stack
# =============================================================================
# Usage:  ./healthcheck.sh
# =============================================================================

PASS=0
FAIL=0

echo "=== HEALTH CHECK ==="
echo ""

# Check 1: Ollama process running
if pgrep -x ollama > /dev/null; then
  echo "✓ Ollama process:   RUNNING"
  PASS=$((PASS + 1))
else
  echo "✗ Ollama process:   NOT RUNNING — fix: ./start_session.sh"
  FAIL=$((FAIL + 1))
fi

# Check 2: Ollama API responding
if curl -s --max-time 3 http://localhost:11434/api/tags > /dev/null 2>&1; then
  echo "✓ Ollama API:       RESPONDING on port 11434"
  PASS=$((PASS + 1))
else
  echo "✗ Ollama API:       NOT RESPONDING — fix: OLLAMA_HOST=0.0.0.0 ollama serve &"
  FAIL=$((FAIL + 1))
fi

# Check 3: Models installed
MODEL_COUNT=$(ollama list 2>/dev/null | tail -n +2 | wc -l | tr -d ' ')
if [ "$MODEL_COUNT" -gt 0 ]; then
  echo "✓ Models:           $MODEL_COUNT model(s) installed"
  PASS=$((PASS + 1))
else
  echo "✗ Models:           NONE FOUND — fix: ollama pull qwen2.5-coder:32b"
  FAIL=$((FAIL + 1))
fi

# Check 4: Open WebUI Docker container
if docker ps 2>/dev/null | grep -q open-webui; then
  echo "✓ Open WebUI:       RUNNING"
  PASS=$((PASS + 1))
else
  if docker ps -a 2>/dev/null | grep -q open-webui; then
    echo "✗ Open WebUI:       STOPPED — fix: docker start open-webui"
  else
    echo "✗ Open WebUI:       NOT INSTALLED — fix: run setup.sh"
  fi
  FAIL=$((FAIL + 1))
fi

# Check 5: GPU status
if command -v nvidia-smi > /dev/null 2>&1; then
  echo ""
  echo "GPU status:"
  nvidia-smi --query-gpu=name,memory.used,memory.total,utilization.gpu \
    --format=csv,noheader 2>/dev/null | while IFS=',' read name mem_used mem_total util; do
    echo "  ✓ GPU: $name |$mem_used used /$mem_total total | Util:$util"
  done
  PASS=$((PASS + 1))
else
  echo "✗ nvidia-smi:       NOT FOUND — GPU may not be attached"
  FAIL=$((FAIL + 1))
fi

# Check 6: Disk space
echo ""
DISK_FREE=$(df -h / | tail -1 | awk '{print $4}')
DISK_TOTAL=$(df -h / | tail -1 | awk '{print $2}')
DISK_PCT=$(df / | tail -1 | awk '{print $5}')
echo "ℹ Disk:             $DISK_FREE free of $DISK_TOTAL ($DISK_PCT used)"

# Check 7: Memory
MEM_INFO=$(free -h | awk '/^Mem:/ {print $3 " used of " $2 " total"}')
echo "ℹ RAM:              $MEM_INFO"

echo ""
echo "=== RESULTS: $PASS passed, $FAIL failed ==="

if [ "$FAIL" -gt 0 ]; then
  echo ""
  echo "Fix the items marked ✗ above, then re-run ./healthcheck.sh"
  exit 1
else
  echo ""
  echo "All checks passed. Your environment is healthy."
  exit 0
fi
