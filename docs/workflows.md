# Text and Image Workflows

## Text-generation workflow

```mermaid
sequenceDiagram
    participant App
    participant Gateway
    participant vLLM
    App->>Gateway: POST /v1/chat/completions
    Gateway->>Gateway: Authenticate, validate, limit, map model
    Gateway->>vLLM: OpenAI-compatible request + private key
    vLLM-->>Gateway: Completion response
    Gateway-->>App: Normalized response + request ID
```

### Request example

```json
{
  "model": "portfolio-text-model",
  "messages": [
    { "role": "system", "content": "Answer clearly and concisely." },
    { "role": "user", "content": "Explain the purpose of a secure AI gateway." }
  ],
  "temperature": 0.3,
  "max_tokens": 300
}
```

The gateway replaces the public model alias with the private vLLM model identifier before forwarding the request.

## Image-generation workflow

```mermaid
sequenceDiagram
    participant App
    participant Gateway
    participant Worker as Image worker
    participant Store as Object storage
    App->>Gateway: POST /v1/images/generations
    Gateway->>Gateway: Authenticate, validate prompt, size, count
    Gateway->>Worker: Internal generation request
    Worker->>Store: Upload generated result
    Store-->>Worker: Asset URL
    Worker-->>Gateway: URL or base64 payload
    Gateway-->>App: Normalized image response
```

### Request example

```json
{
  "prompt": "A calm abstract landscape for a meditation application",
  "size": "1024x1024",
  "n": 1,
  "response_format": "url"
}
```

### Why it is separate from vLLM

Text and image generation differ in model architecture, dependencies, memory behavior, execution time, queuing needs, and output storage. The gateway unifies client access without incorrectly treating both workloads as one model server.

## Synchronous versus asynchronous images

The sample uses a synchronous endpoint for clarity. Production image workloads often benefit from:

1. accepting a job and returning `202 Accepted`;
2. storing job state in a durable queue;
3. processing with bounded GPU concurrency;
4. uploading results to object storage;
5. notifying the application or allowing status polling;
6. expiring temporary assets according to retention policy.
