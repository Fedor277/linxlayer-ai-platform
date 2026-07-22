#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8080}"
API_KEY="${API_KEY:-local-demo-key}"

curl --fail-with-body --silent --show-error \
  "${BASE_URL}/v1/images/generations" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -H "X-Request-Id: example-image-001" \
  -d '{
    "prompt": "A calm abstract landscape for a meditation application",
    "size": "1024x1024",
    "n": 1,
    "response_format": "url"
  }'
