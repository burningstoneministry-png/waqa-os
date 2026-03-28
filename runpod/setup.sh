#!/bin/bash
# =============================================================================
# setup.sh — One-time full install for RunPod + Ollama + Open WebUI
# =============================================================================
# Run ONCE inside the RunPod web terminal.
# Usage:  chmod +x setup.sh && ./setup.sh
#
# Pod ID: hzyc826450y9h7
# =============================================================================

set -e

POD_ID="hzyc826450y9h7"

echo "=== STEP 1: Installing Ollama ==="
curl -fsSL https://ollama.ai/install.sh | sh

echo ""
echo "=== STEP 2: Starting Ollama server ==="
OLLAMA_HOST=0.0.0.0 nohup ollama serve > /tmp/ollama.log 2>&1 &
echo "Waiting 5 seconds for Ollama to initialize..."
sleep 5

echo ""
echo "=== STEP 3: Pulling Qwen 2.5 Coder 32B (~20GB — this will take a while) ==="
echo "If you have an RTX 3090 or less than 24GB VRAM, Ctrl+C and run:"
echo "  ollama pull qwen2.5-coder:14b"
echo ""
ollama pull qwen2.5-coder:32b

echo ""
echo "=== STEP 4: Verifying model downloaded ==="
ollama list

echo ""
echo "=== STEP 5: Running quick model test ==="
echo "Write a Python function that adds two numbers" | ollama run qwen2.5-coder:32b --nowordwrap

echo ""
echo "=== STEP 6: Installing Open WebUI via Docker ==="
docker run -d -p 3000:8080 \
  -e OLLAMA_BASE_URL=http://host.docker.internal:11434 \
  -v open-webui:/app/backend/data \
  --add-host=host.docker.internal:host-gateway \
  --name open-webui \
  --restart always \
  ghcr.io/open-webui/open-webui:main

echo ""
echo "=== STEP 7: Waiting for Open WebUI to start (10 seconds) ==="
sleep 10

echo ""
echo "=== STEP 8: Confirming everything is running ==="
echo ""
echo "Ollama models installed:"
ollama list
echo ""
echo "Docker containers:"
docker ps --format 'table {{.Names}}\t{{.Status}}'

echo ""
echo "=============================================="
echo "           SETUP COMPLETE"
echo "=============================================="
echo ""
echo "Open WebUI:  https://${POD_ID}-3000.proxy.runpod.net"
echo "Ollama API:  https://${POD_ID}-11434.proxy.runpod.net/v1"
echo ""
echo "Next time you start a session, just run:"
echo "  ./start_session.sh"
echo ""
