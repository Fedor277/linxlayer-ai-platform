# Operations Checklist

## Before deployment

- [ ] Model license and intended use approved
- [ ] Model and tokenizer revisions pinned
- [ ] vLLM and CUDA-compatible image pinned
- [ ] GPU memory profile measured
- [ ] Context, token, image-size, and concurrency limits defined
- [ ] Persistent model/cache storage configured
- [ ] Secrets created outside Git
- [ ] Gateway is the only public inference entry point
- [ ] Private service authentication enabled
- [ ] Log redaction verified
- [ ] Backup and asset-retention policies defined

## Release validation

- [ ] Lint, tests, and TypeScript build pass
- [ ] Container image scan passes
- [ ] `/health` and `/ready` behave correctly
- [ ] Unauthorized requests return `401`
- [ ] Unknown models are rejected
- [ ] Text requests route only to vLLM
- [ ] Image requests route only to the image worker
- [ ] Timeouts return a normalized error
- [ ] Request IDs appear across gateway and upstream logs
- [ ] Prompt content and secrets do not appear in standard logs

## Monitoring

- [ ] Request rate and error rate dashboard
- [ ] p50/p95/p99 latency dashboard
- [ ] Time-to-first-token and tokens-per-second metrics
- [ ] Queue depth and wait-time alerts
- [ ] GPU utilization and memory alerts
- [ ] Pod restart and model-load alerts
- [ ] Storage capacity alerts
- [ ] Cost and quota alerts

## Recovery exercises

- [ ] Restart gateway without interrupting loaded models
- [ ] Restart inference Pod and verify readiness gating
- [ ] Rotate gateway and upstream credentials
- [ ] Restore model cache or persistent volume
- [ ] Simulate image-worker failure while text remains available
- [ ] Simulate upstream timeout and overload
- [ ] Confirm client error messages reveal no internal details
