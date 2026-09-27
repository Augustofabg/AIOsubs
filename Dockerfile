# Stage 1: Build TypeScript application
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Install dependencies
COPY package*.json tsconfig.json ./
RUN npm ci

# Copy source code and build
COPY scripts ./scripts
COPY src ./src
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# Stage 2: Production runtime
FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=7000
ENV HOST=0.0.0.0

# Install runtime dependencies: ffmpeg, curl, ca-certificates, python3, python3-venv, python3-pip
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    curl \
    ca-certificates \
    python3 \
    python3-venv \
    python3-pip \
  && rm -rf /var/lib/apt/lists/*

# Set up Python virtual environment for ffsubsync
RUN python3 -m venv /opt/venv \
  && /opt/venv/bin/pip install --no-cache-dir ffsubsync \
  && ln -sf /opt/venv/bin/ffsubsync /usr/local/bin/ffsubsync || true

# Install precompiled alass binary
RUN curl -sSL https://github.com/kaegi/alass/releases/download/v2.0.0/alass-linux64 -o /usr/local/bin/alass \
  && chmod +x /usr/local/bin/alass

# Configure PATH with virtualenv and system binary locations
ENV PATH="/opt/venv/bin:/usr/local/bin:/usr/bin:$PATH"

# Ensure virtualenv is readable/executable by unprivileged node user
RUN chown -R node:node /opt/venv || true

# Create unprivileged user for security
USER node

# Copy production node_modules and built dist
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist

EXPOSE 7000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://127.0.0.1:7000/health || exit 1

CMD ["node", "dist/index.js"]
