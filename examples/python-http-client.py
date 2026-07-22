"""Dependency-free Python example using urllib."""

import json
import os
import urllib.request

base_url = os.getenv("AI_BASE_URL", "http://localhost:8080")
api_key = os.getenv("AI_API_KEY", "local-demo-key")

payload = json.dumps(
    {
        "model": "portfolio-text-model",
        "messages": [{"role": "user", "content": "Describe request-ID propagation."}],
        "max_tokens": 250,
    }
).encode("utf-8")

request = urllib.request.Request(
    f"{base_url}/v1/chat/completions",
    data=payload,
    method="POST",
    headers={
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    },
)

with urllib.request.urlopen(request, timeout=60) as response:
    print(json.dumps(json.load(response), indent=2))
