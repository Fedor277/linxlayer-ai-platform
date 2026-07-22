# Deployment Lessons

## Persist model data deliberately

Container-local files are convenient during experimentation but fragile across Pod changes. Model downloads and cache warm-up can dominate recovery time, so persistent storage paths should be defined before deployment.

## Pin the complete serving stack

Pin the container image, vLLM version, CUDA assumptions, model revision, tokenizer revision, and gateway contract. “Latest” tags make an environment difficult to reproduce and can introduce behavior changes without an application release.

## Separate public and private model names

Applications should depend on stable aliases rather than upstream repository names. The gateway can move an alias to a new model after evaluation without forcing every client to change.

## Do not expose the model server as the policy layer

An inference API key is useful defense in depth, but it does not replace tenant authorization, quotas, input validation, abuse controls, or audit logging. Those policies belong in the gateway.

## Treat model start-up as an operational state

A running container is not necessarily ready to serve. Readiness should reflect model loading, cache state, and dependency health. Traffic should not be sent until the model endpoint responds successfully.

## Benchmark realistic traffic

Single-prompt latency does not predict multi-user performance. Test representative prompt lengths, output lengths, concurrent requests, image sizes, and mixed workloads.

## Bound every expensive dimension

Limit context length, completion tokens, image count, pixel dimensions, concurrent jobs, request duration, and queue depth. Unbounded inputs become reliability and cost incidents.

## Keep text and image capacity independent

A large image generation job should not evict or delay the text model. Separate workers make performance, scaling, upgrades, and failure recovery easier to reason about.

## Design observability before debugging

Request IDs, queue time, model time, token counts, GPU utilization, errors, and restart events are most useful when they are present from the first deployment—not added after an outage.

## Test the recovery path

Restart Pods, rotate secrets, simulate an unavailable upstream, fill the queue, force timeouts, and verify that persistent data survives. A deployment is not complete until failure behavior is understood.
