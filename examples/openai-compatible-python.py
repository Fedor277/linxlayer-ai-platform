"""Use the official OpenAI Python client with the self-hosted gateway.

Install separately for this example:
    pip install openai
"""

import os
from openai import OpenAI

client = OpenAI(
    base_url=os.getenv("AI_BASE_URL", "http://localhost:8080/v1"),
    api_key=os.getenv("AI_API_KEY", "local-demo-key"),
)

completion = client.chat.completions.create(
    model="portfolio-text-model",
    messages=[
        {"role": "system", "content": "You are a concise technical assistant."},
        {"role": "user", "content": "Explain why inference services should stay private."},
    ],
    max_tokens=300,
)

print(completion.choices[0].message.content)
