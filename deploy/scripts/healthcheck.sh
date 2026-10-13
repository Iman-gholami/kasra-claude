#!/usr/bin/env bash
# Lightweight external probe for cron or an uptime monitor.
#   */1 * * * * /opt/kasra/deploy/scripts/healthcheck.sh https://kasra.example || <alert command>
set -euo pipefail
BASE="${1:-http://127.0.0.1:3001}"
curl -fsS --max-time 5 "$BASE/api/health" >/dev/null
curl -fsS --max-time 10 -o /dev/null "$BASE/"
