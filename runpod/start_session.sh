#!/bin/bash
# =============================================================================
# start_session.sh — Run this at the start of EVERY RunPod session
# =============================================================================
# Usage:  ./start_session.sh
#
# Pod ID: ulouw42pw9tdki
# =============================================================================

POD_ID="ulouw42pw9tdki"

echo "=== Installing Ollama (if not present) ==="
if ! command -v ollama &> /dev/null; then
  apt-get update -qq && apt-get install -y zstd -qq
  curl -fsSL https://ollama.ai/install.sh | sh
else
  echo "Ollama already installed."
fi

echo ""
echo "=== Installing Open WebUI (if not present) ==="
if ! command -v open-webui &> /dev/null; then
  pip install open-webui -q
else
  echo "Open WebUI already installed."
fi

echo ""
echo "=== Linking model volume ==="
rm -rf /root/.ollama 2>/dev/null
ln -sf /workspace/ollama /root/.ollama
echo "Volume linked."

echo ""
echo "=== Starting Ollama server ==="
OLLAMA_HOST=0.0.0.0 nohup ollama serve > /tmp/ollama.log 2>&1 &
echo "Waiting 5 seconds for Ollama to initialize..."
sleep 5

echo ""
echo "=== Starting Open WebUI ==="
nohup open-webui serve --host 0.0.0.0 --port 3000 > /tmp/webui.log 2>&1 &

echo ""
echo "=== Checking Ollama models ==="
MODEL_INFO=$(curl -s http://localhost:11434/api/tags | python3 -c 'import sys,json; d=json.load(sys.stdin); print(str(len(d["models"])) + " model(s) loaded")' 2>/dev/null || echo "API not yet responding — try again in a few seconds")
echo "Ollama: $MODEL_INFO"

echo ""
echo "=============================================="
echo "           SESSION READY"
echo "=============================================="
echo ""
echo "Open WebUI:  https://${POD_ID}-3000.proxy.runpod.net"
echo "Ollama API:  https://${POD_ID}-11434.proxy.runpod.net/v1"
echo ""
echo "Wait 30 seconds then open the Open WebUI URL."
echo ""
