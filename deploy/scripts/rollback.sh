#!/usr/bin/env bash
# Roll both frontend replicas back to a previously built image.
#
#   deploy/scripts/rollback.sh            # to the tag recorded before the last deploy
#   deploy/scripts/rollback.sh <tag>      # to a specific tag (see: docker images kasra-frontend)
set -Eeuo pipefail
cd "$(dirname "$0")/../.."

TAG="${1:-$(cat .previous-tag 2>/dev/null || true)}"
[[ -n "$TAG" ]] || { echo "No previous tag recorded; pass one explicitly."; exit 1; }
docker image inspect "kasra-frontend:$TAG" >/dev/null 2>&1 || { echo "Image kasra-frontend:$TAG not found locally."; exit 1; }

for svc in web-1 web-2; do
  echo "[rollback] $svc → kasra-frontend:$TAG"
  KASRA_TAG="$TAG" docker compose up -d --no-deps --no-build "$svc"
  for _ in $(seq 1 40); do
    status="$(docker inspect --format '{{.State.Health.Status}}' "$(docker compose ps -q "$svc")")"
    [[ "$status" == "healthy" ]] && break
    sleep 3
  done
  [[ "$status" == "healthy" ]] || { echo "[rollback] $svc is not healthy — investigate: docker compose logs $svc"; exit 1; }
done
echo "$TAG" > .current-tag
sed -i "s/^KASRA_TAG=.*/KASRA_TAG=$TAG/" .env.production 2>/dev/null || true
echo "[rollback] now serving kasra-frontend:$TAG"
