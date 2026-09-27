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

# 2. Setup ffmpeg static binary
if [ -f "node_modules/ffmpeg-static/ffmpeg" ] && [ ! -f "bin/ffmpeg" ]; then
  ln -sf "$(pwd)/node_modules/ffmpeg-static/ffmpeg" bin/ffmpeg 2>/dev/null || cp "node_modules/ffmpeg-static/ffmpeg" bin/ffmpeg 2>/dev/null || true
  chmod +x bin/ffmpeg 2>/dev/null || true
  echo "ffmpeg linked from node_modules/ffmpeg-static to bin/ffmpeg"
fi

if [ ! -f "bin/ffmpeg" ] || [ ! -s "bin/ffmpeg" ]; then
  echo "Downloading precompiled static ffmpeg..."
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
    echo "Attempting ffsubsync installation..."
    # Install webrtcvad-wheels first to bypass C compiler requirements on Render
    python3 -m pip install --no-cache-dir --user webrtcvad-wheels ffsubsync 2>/dev/null || pip3 install --no-cache-dir --user webrtcvad-wheels ffsubsync 2>/dev/null || true
    USER_BASE=$(python3 -m site --user-base 2>/dev/null || echo "$HOME/.local")
    if [ -f "$USER_BASE/bin/ffsubsync" ]; then
      ln -sf "$USER_BASE/bin/ffsubsync" bin/ffsubsync 2>/dev/null || cp "$USER_BASE/bin/ffsubsync" bin/ffsubsync 2>/dev/null || true
      echo "ffsubsync installed and linked to bin/ffsubsync"
    elif [ -f "$HOME/.local/bin/ffsubsync" ]; then
      ln -sf "$HOME/.local/bin/ffsubsync" bin/ffsubsync 2>/dev/null || cp "$HOME/.local/bin/ffsubsync" bin/ffsubsync 2>/dev/null || true
      echo "ffsubsync linked from $HOME/.local/bin/ffsubsync"
    fi
  fi
fi

chmod +x bin/* 2>/dev/null || true

echo "==> Render build finished successfully!"
