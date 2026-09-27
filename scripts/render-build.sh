#!/usr/bin/env bash
set -e

echo "==> Installing dependencies (including newly added packages)..."
npm install --include=dev

echo "==> Building AIOSubs application..."
npm run build

echo "==> Setting up alignment binaries for Render Linux environment..."
mkdir -p bin

# 1. Download alass (precompiled standalone Rust binary for Linux x86_64)
if [ ! -f "bin/alass" ]; then
  echo "Fetching precompiled alass binary..."
  curl -sSL https://github.com/kaegi/alass/releases/download/v2.0.0/alass-linux64 -o bin/alass || true
  if [ -f "bin/alass" ]; then
    chmod +x bin/alass
    echo "alass binary installed to bin/alass"
  fi
fi

# 2. Download ffmpeg static binary if system ffmpeg is missing
if ! command -v ffmpeg &> /dev/null && [ ! -f "bin/ffmpeg" ]; then
  echo "System ffmpeg not found. Downloading static ffmpeg..."
  curl -sSL https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz -o /tmp/ffmpeg.tar.xz || true
  if [ -f "/tmp/ffmpeg.tar.xz" ]; then
    tar -xf /tmp/ffmpeg.tar.xz -C /tmp/ --wildcards '*/ffmpeg' || true
    find /tmp -name ffmpeg -type f -exec mv {} bin/ffmpeg \; || true
    chmod +x bin/ffmpeg 2>/dev/null || true
    rm -rf /tmp/ffmpeg*
    echo "Static ffmpeg installed to bin/ffmpeg"
  fi
fi

echo "==> Render build finished successfully!"

