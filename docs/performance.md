# Performance Considerations

## Primary measurements

Track at least:

- time to first token;
- end-to-end request latency;
- tokens per second;
- prompt and completion token counts;
- queue wait time;
- active and pending sequences;
- GPU memory utilization;
- image generation duration by size and step count;
- error, timeout, and cancellation rates;
- cold-start and model-load duration.

Percentiles such as p50, p95, and p99 are more useful than averages for application experience.

## vLLM sizing variables

Performance depends on model size, precision, context length, output length, GPU type, tensor parallelism, KV-cache capacity, batching, and concurrency. Tune one workload profile at a time and record the exact configuration used for every benchmark.

## Context and output limits

Long contexts consume KV-cache memory and can reduce concurrency. Large output limits also increase latency and cost. The gateway therefore enforces an application-level maximum even when the upstream server supports a larger value.

## Warm-up

After loading the model, run controlled warm-up requests before accepting production traffic. Warm-up should exercise representative sequence lengths without polluting user-visible metrics.

## Backpressure

When the inference service reaches its concurrency target, reject, queue, or shed work intentionally. Allowing unlimited requests to accumulate produces timeouts and unpredictable recovery.

## Image workloads

Image generation should be measured by model, resolution, step count, batch size, scheduler, and GPU. Pixel area is a better quota dimension than request count alone.

## Caching

Cache only when the product semantics and privacy policy permit it. Exact prompt-response caching can expose sensitive content or return stale answers. Model files and tokenizer assets are safer cache candidates than user generations.

## Cost controls

Connect technical limits to business controls:

- tenant token budgets;
- maximum image pixels per period;
- concurrency tiers;
- idle GPU shutdown policies;
- alerts for abnormal queue growth or utilization;
- model routing by task complexity.
