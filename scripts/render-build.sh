#!/usr/bin/env bash
set -e

echo "==> Installing dependencies (including newly added packages)..."
npm install --include=dev

echo "==> Building AIOSubs application..."
npm run build

echo "==> Setting up alignment binaries for Render Linux environment..."
mkdir -p bin

# 1. Download alass (precompiled standalone Rust binary for Linux x86_64)
if [ ! -f "bin/alass" ] || [ ! -s "bin/alass" ]; then
  echo "Fetching precompiled alass binary..."
  curl -fsSL https://github.com/kaegi/alass/releases/download/v2.0.0/alass-linux64 -o bin/alass || true
  if [ -s "bin/alass" ]; then
    chmod +x bin/alass
    echo "alass binary installed to bin/alass"
  else
    rm -f bin/alass
  fi
fi

# 2. Download ffmpeg static binary if system ffmpeg is missing
if ! command -v ffmpeg &> /dev/null && { [ ! -f "bin/ffmpeg" ] || [ ! -s "bin/ffmpeg" ]; }; then
  echo "System ffmpeg not found. Downloading precompiled static ffmpeg..."
  curl -fsSL https://github.com/eugeneware/ffmpeg-static/releases/download/b6.0/ffmpeg-linux-x64 -o bin/ffmpeg || true
  if [ -s "bin/ffmpeg" ]; then
    chmod +x bin/ffmpeg
    echo "ffmpeg binary installed to bin/ffmpeg"
  else
    rm -f bin/ffmpeg
  fi
fi

# 3. Setup ffsubsync in virtual environment or user site if python3 is available
if ! command -v ffsubsync &> /dev/null && [ ! -f "bin/ffsubsync" ] && [ ! -f "/opt/venv/bin/ffsubsync" ]; then
  if command -v python3 &> /dev/null; then
    echo "Checking for ffsubsync installation..."
    # 3a. Try project-level virtual environment
    python3 -m venv .venv 2>/dev/null || true
    if [ -f ".venv/bin/pip" ]; then
      .venv/bin/pip install --no-cache-dir ffsubsync 2>/dev/null || true
      if [ -f ".venv/bin/ffsubsync" ]; then
        ln -sf "$(pwd)/.venv/bin/ffsubsync" bin/ffsubsync 2>/dev/null || true
        echo "ffsubsync installed in .venv and linked to bin/ffsubsync"
      fi
    fi

    # 3b. Try user site pip install as fallback
    if [ ! -f "bin/ffsubsync" ]; then
      python3 -m pip install --no-cache-dir --user ffsubsync 2>/dev/null || pip3 install --no-cache-dir --user ffsubsync 2>/dev/null || true
      USER_BASE=$(python3 -m site --user-base 2>/dev/null || echo "$HOME/.local")
      if [ -f "$USER_BASE/bin/ffsubsync" ]; then
        ln -sf "$USER_BASE/bin/ffsubsync" bin/ffsubsync 2>/dev/null || true
        echo "ffsubsync linked from $USER_BASE/bin/ffsubsync"
      elif [ -f "$HOME/.local/bin/ffsubsync" ]; then
        ln -sf "$HOME/.local/bin/ffsubsync" bin/ffsubsync 2>/dev/null || true
        echo "ffsubsync linked from $HOME/.local/bin/ffsubsync"
      fi
    fi
  fi
fi

chmod +x bin/* 2>/dev/null || true

echo "==> Render build finished successfully!"
