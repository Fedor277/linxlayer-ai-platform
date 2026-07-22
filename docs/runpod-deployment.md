# RunPod Deployment

This document describes a sanitized deployment pattern. Replace model, GPU, region, volume, domain, and secret names with values approved for the actual environment.

## 1. Select the workload and GPU

Start with the model architecture, parameter count, numerical precision, maximum context length, concurrency target, and expected output length. GPU selection should be based on measured memory use rather than model file size alone.

Keep text and image workloads on separate Pods when they compete for memory, require different software stacks, or need independent scaling.

## 2. Prepare persistent storage

Use persistent storage for model weights and caches that should survive Pod replacement. RunPod storage types have different persistence and performance characteristics, so validate startup and inference behavior with the chosen tier.

Recommended layout:

```text
/workspace/
├── models/
├── huggingface-cache/
├── vllm-cache/
└── startup-state/
```

Do not treat the GPU volume as the permanent source of generated user assets. Move durable outputs to object storage and back up critical data independently.

## 3. Create runtime secrets

Create secrets for values such as:

- `VLLM_API_KEY`
- `HUGGING_FACE_HUB_TOKEN` when the selected model requires it
- `GATEWAY_UPSTREAM_KEY`
- image-worker credentials
- object-storage credentials

A sanitized RunPod template entry can reference a secret without containing its value:

```text
VLLM_API_KEY={{ RUNPOD_SECRET_vllm_api_key }}
```

Never place real secrets in this repository, Docker build arguments, shell history, or model download URLs.

## 4. Deploy the vLLM Pod

Use the files in [`deploy/vllm`](../deploy/vllm/) as a starting point. The startup script:

- validates required environment variables;
- binds the service on port `8000`;
- applies an API key;
- enables request-ID propagation;
- sets a public served-model alias;
- uses bounded context and GPU-memory settings;
- avoids silently inheriting model-repository sampling defaults.

Attach storage during Pod creation and place model caches under `/workspace`.

## 5. Keep inference private

Where the deployment uses multiple RunPod Pods, private networking can connect the gateway and inference services without exposing internal ports publicly. Use the internal Pod DNS name supplied by RunPod and retain application-layer authentication between services.

If the gateway runs outside RunPod, use a controlled private connection or tightly restricted ingress. Avoid publishing an unrestricted vLLM endpoint directly to the internet.

## 6. Deploy the image worker separately

The image worker should have its own:

- container and dependency lock;
- approved model and license review;
- GPU sizing and concurrency limit;
- prompt and output policy controls;
- storage upload path;
- timeout and cancellation behavior;
- health endpoint and metrics.

The worker’s internal response is normalized by the gateway into a stable application-facing schema.

## 7. Deploy the gateway

The gateway can run on conventional CPU infrastructure or a small Pod. It should be independently scalable and should not share the inference container.

Required production additions beyond this sample include:

- managed authentication and tenant identity;
- distributed rate limiting;
- request and cost quotas;
- content moderation and abuse detection;
- centralized logs, metrics, traces, and alerts;
- encrypted application data stores;
- key rotation and incident procedures.

## 8. Validate before traffic

Run these checks before enabling client access:

1. `/health` succeeds without checking dependencies.
2. `/ready` confirms the required inference services.
3. An unauthorized request receives `401` without revealing upstream details.
4. An unknown model alias is rejected by the gateway.
5. A valid chat request reaches vLLM and returns a request ID.
6. An image request reaches only the image worker.
7. Secrets and prompt bodies are absent from normal logs.
8. Timeout, Pod restart, storage remount, and model reload behavior are tested.
9. The selected model’s license and intended use are approved.
10. Capacity and cost alerts are configured.

## RunPod-specific operational notes

- Updating Pod environment variables restarts the Pod, so persistent files must be placed in the mounted storage path.
- Network volumes persist independently of an individual Pod and can support shared model data, but storage latency should be benchmarked for the workload.
- Private networking reduces public exposure, but internal services should still authenticate one another.

Refer to the current official RunPod documentation before deployment because console options, supported regions, storage behavior, and networking capabilities can change.
