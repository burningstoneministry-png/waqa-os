#!/bin/bash
# =============================================================================
# mount_volume.sh — Link Ollama models to a RunPod Network Volume
# =============================================================================
# Only needed if you created a Network Volume in RunPod.
# Run this ONCE per pod (after setup.sh, before pulling models).
#
# Why use this: Ollama models are ~20GB. Without a network volume,
# you re-download them every time you create a new pod ($$ and time).
# With a network volume, models persist and load instantly.
#
# Usage:  ./mount_volume.sh
# =============================================================================

VOLUME_PATH="/runpod-volume"
OLLAMA_DATA_DIR="/root/.ollama"
VOLUME_OLLAMA_DIR="$VOLUME_PATH/ollama"

echo "=== Network Volume Mount ==="
echo ""

# Check if network volume is mounted
if [ ! -d "$VOLUME_PATH" ]; then
  echo "No network volume found at $VOLUME_PATH."
  echo "Skipping. (This is fine if you don't have a network volume.)"
  exit 0
fi

echo "Network volume detected at $VOLUME_PATH"
echo ""

# Create ollama directory on volume if it doesn't exist
if [ ! -d "$VOLUME_OLLAMA_DIR" ]; then
  echo "Creating ollama directory on volume..."
  mkdir -p "$VOLUME_OLLAMA_DIR"
fi

# Copy existing models to volume if they exist locally and aren't already there
if [ -d "$OLLAMA_DATA_DIR/models" ] && [ ! -d "$VOLUME_OLLAMA_DIR/models" ]; then
  echo "Copying existing models to network volume..."
  echo "(This may take a few minutes for large models)"
  cp -r "$OLLAMA_DATA_DIR/models" "$VOLUME_OLLAMA_DIR/"
  echo "Copy complete."
elif [ -d "$VOLUME_OLLAMA_DIR/models" ]; then
  echo "Models already exist on volume — skipping copy."
fi

# Remove local .ollama dir and replace with symlink to volume
if [ -L "$OLLAMA_DATA_DIR" ]; then
  echo "Symlink already exists at $OLLAMA_DATA_DIR — nothing to do."
else
  echo "Linking $OLLAMA_DATA_DIR → $VOLUME_OLLAMA_DIR"
  rm -rf "$OLLAMA_DATA_DIR"
  ln -s "$VOLUME_OLLAMA_DIR" "$OLLAMA_DATA_DIR"
  echo "Symlink created."
fi

echo ""
echo "=== DONE ==="
echo "Ollama models directory is now linked to the network volume."
echo "Models will persist between pod sessions — no re-downloading needed."
echo ""
echo "Verify with:  ls -la $OLLAMA_DATA_DIR"
echo "Then run:     ./start_session.sh"
echo ""
