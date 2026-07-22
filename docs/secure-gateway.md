# Secure Gateway Design

## Why use a gateway

An inference server is optimized to run models. A gateway is optimized to enforce application policy. Keeping these responsibilities separate prevents clients from obtaining direct control over sensitive model-server parameters and infrastructure addresses.

## Implemented controls

### Authentication

The demonstration accepts bearer tokens and uses constant-time comparison. Production systems should replace static keys with a managed identity service, scoped tokens, expiration, rotation, and revocation.

### Model allowlisting

Clients request `portfolio-text-model`; the gateway maps that alias to the private model identifier. This prevents internal model repository names from becoming a permanent client contract and supports controlled model replacement.

### Schema validation

Zod schemas constrain message roles, content lengths, image sizes, image counts, sampling parameters, and completion-token limits. The gateway does not behave as a transparent arbitrary JSON proxy.

### Rate limiting and quotas

The sample uses per-instance rate limiting. Production deployments should use a distributed limiter and enforce separate limits for requests, input tokens, output tokens, image count, pixel area, concurrency, and spend.

### Request IDs

The gateway preserves a safe incoming `x-request-id` or generates one. It passes the ID to vLLM and image workers so logs can be correlated without logging prompt content.

### Timeouts

Every upstream request has a deadline. Timeouts are returned as a normalized `504` rather than allowing sockets to remain open indefinitely.

### Logging

Authorization headers, prompts, messages, tokens, and key-like fields are redacted. Production observability should capture route, tenant, model alias, duration, status, token counts, queue time, and GPU service identity without storing sensitive content by default.

### Error normalization

Upstream status codes and bodies are not returned directly to clients. The gateway returns stable error codes and a request ID while preserving deeper diagnostic details only in protected logs.

## Recommended production extensions

- OAuth 2.0/OIDC or signed short-lived service tokens
- tenant-scoped model and feature permissions
- policy engine for prompt and output checks
- distributed rate limiting and concurrency control
- token and image-cost accounting
- streaming response support with disconnect cancellation
- idempotency keys for asynchronous image jobs
- malware checks for uploaded inputs
- data-loss-prevention rules
- audit event retention and administrator review
- key-management service integration
