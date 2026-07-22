#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8080}"
API_KEY="${API_KEY:-local-demo-key}"

curl --fail-with-body --silent --show-error \
  "${BASE_URL}/v1/chat/completions" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -H "X-Request-Id: example-text-001" \
  -d '{
    "model": "portfolio-text-model",
    "messages": [
      {"role": "system", "content": "You are a concise technical assistant."},
      {"role": "user", "content": "What problem does an AI gateway solve?"}
    ],
    "temperature": 0.2,
    "max_tokens": 300
  }'
