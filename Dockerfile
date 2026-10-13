# syntax=docker/dockerfile:1.7
#
# Production image for the Kasra Boutique Next.js frontend.
# Multi-stage: install → build (standalone output) → minimal non-root runtime.
#
#   docker build \
#     --build-arg NEXT_PUBLIC_SITE_URL=https://kasra.example \
#     --build-arg APP_VERSION=$(git rev-parse --short HEAD) \
#     -t kasra-frontend:$(git rev-parse --short HEAD) .
#
# NEXT_PUBLIC_* values are inlined into the client bundle at build time, so
# they are build arguments. Never pass secrets as build arguments.

# Debian slim (glibc) rather than Alpine (musl): in our measurements the same
# app served ~24 % more server-rendered requests per second on glibc, at the
# cost of a larger image (see docs/performance-report.md).
ARG NODE_IMAGE=node:22-bookworm-slim

# ── 1. Dependencies ──────────────────────────────────────────────────────────
FROM ${NODE_IMAGE} AS deps
WORKDIR /app
# Optional npm mirror (useful where registry.npmjs.org is slow or filtered).
ARG NPM_REGISTRY=https://registry.npmjs.org/
COPY package.json package-lock.json ./
# An extra CA bundle for TLS-inspecting networks can be supplied as a build
# secret (never stored in a layer):  --secret id=npm_ca,src=/path/ca.pem
RUN --mount=type=cache,target=/root/.npm \
    --mount=type=secret,id=npm_ca,required=false \
    if [ -s /run/secrets/npm_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/npm_ca; fi; \
    npm ci --no-audit --no-fund --registry="${NPM_REGISTRY}"

# ── 2. Build ─────────────────────────────────────────────────────────────────
FROM ${NODE_IMAGE} AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NEXT_PUBLIC_ALLOW_INDEXING=false
ARG APP_VERSION=dev
ENV NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    NEXT_PUBLIC_ALLOW_INDEXING=${NEXT_PUBLIC_ALLOW_INDEXING} \
    APP_VERSION=${APP_VERSION}
RUN npm run build

# ── 3. Runtime ───────────────────────────────────────────────────────────────
FROM ${NODE_IMAGE} AS runner
WORKDIR /app
# No OS packages are installed, so the image builds without access to the
# distribution package mirrors. Run with `--init` (Compose: `init: true`) so a tiny
# init process forwards SIGTERM to Node and reaps zombies; the Next.js server
# drains in-flight requests on SIGTERM.

ARG APP_VERSION=dev
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000 \
    APP_VERSION=${APP_VERSION}

# Only the standalone server, static assets and public files — no dev
# dependencies, sources or build caches end up in the runtime image.
# The official image ships an unprivileged `node` user (uid 1000).
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
RUN mkdir -p .next/cache && chown -R node:node .next/cache

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

STOPSIGNAL SIGTERM
CMD ["node", "server.js"]
