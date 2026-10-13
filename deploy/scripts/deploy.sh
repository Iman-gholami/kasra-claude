#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Zero-downtime rolling deploy of the Kasra frontend on a single server.
#
#   deploy/scripts/deploy.sh [git-ref]      # default: origin/main
#
# 1. checks out the ref and builds an image tagged with the commit SHA
# 2. replaces web-1, waits until it is healthy, then replaces web-2
#    (Nginx keeps routing to the healthy replica in the meantime)
# 3. on any failure, rolls both replicas back to the previously running tag
# ─────────────────────────────────────────────────────────────────────────────
set -Eeuo pipefail

cd "$(dirname "$0")/../.."
REF="${1:-origin/main}"
KEEP_IMAGES="${KEEP_IMAGES:-5}"
HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-120}"

log() { printf '\033[1m[deploy]\033[0m %s\n' "$*"; }

wait_healthy() {
  local container="$1" waited=0 status
  while (( waited < HEALTH_TIMEOUT )); do
    status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$container" 2>/dev/null || echo missing)"
    [[ "$status" == "healthy" ]] && return 0
    sleep 3; waited=$(( waited + 3 ))
  done
  log "container $container did not become healthy (last status: $status)"
  return 1
}

container_of() { docker compose ps -q "$1"; }

current_tag() {
  local id; id="$(container_of web-1 || true)"
  [[ -n "$id" ]] && docker inspect --format '{{.Config.Image}}' "$id" | sed 's/.*://' || true
}

roll_to() {
  local tag="$1"
  for svc in web-1 web-2; do
    log "updating $svc → kasra-frontend:$tag"
    KASRA_TAG="$tag" docker compose up -d --no-deps --no-build "$svc"
    wait_healthy "$(container_of "$svc")"
  done
}

[[ -f .env.production ]] || { log "missing .env.production (copy .env.example)"; exit 1; }
set -a; source .env.production; set +a

PREVIOUS_TAG="$(current_tag)"
log "fetching $REF"
git fetch --quiet --all --prune
git checkout --quiet --detach "$REF"
TAG="$(git rev-parse --short HEAD)"

if [[ "$TAG" == "$PREVIOUS_TAG" ]]; then
  log "kasra-frontend:$TAG is already running — nothing to do"
  exit 0
fi

log "building kasra-frontend:$TAG"
KASRA_TAG="$TAG" docker compose build web-1

if ! roll_to "$TAG"; then
  if [[ -n "$PREVIOUS_TAG" ]]; then
    log "deploy failed — rolling back to $PREVIOUS_TAG"
    roll_to "$PREVIOUS_TAG"
  fi
  exit 1
fi

echo "$PREVIOUS_TAG" > .previous-tag
echo "$TAG" > .current-tag
sed -i "s/^KASRA_TAG=.*/KASRA_TAG=$TAG/" .env.production || true

# Keep the newest images for fast rollbacks; remove older ones.
docker images kasra-frontend --format '{{.CreatedAt}}\t{{.Tag}}' | sort -r | tail -n +$(( KEEP_IMAGES + 1 )) | cut -f2 |
  while read -r old; do [[ -n "$old" ]] && docker rmi "kasra-frontend:$old" >/dev/null 2>&1 || true; done
docker image prune -f >/dev/null

log "deployed kasra-frontend:$TAG (previous: ${PREVIOUS_TAG:-none})"
