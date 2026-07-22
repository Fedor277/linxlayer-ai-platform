# vLLM Serving Configuration

This directory contains a sanitized container and startup script for the text-generation Pod.

## Build

```bash
docker build -t your-registry.example/linxlayer-vllm:0.1.0 deploy/vllm
```

Pin the base image to the vLLM version that passed your model and GPU tests. Do not publish an unreviewed `latest` image to production.

## Required runtime values

```text
MODEL_ID=approved-org/approved-open-weight-model
SERVED_MODEL_NAME=portfolio-text-model
VLLM_API_KEY=<injected secret>
```

Optional tuning values:

```text
MAX_MODEL_LEN=8192
GPU_MEMORY_UTILIZATION=0.90
TENSOR_PARALLEL_SIZE=1
HF_HOME=/workspace/huggingface-cache
```

## Start command

The container entry point runs [`start-vllm.sh`](start-vllm.sh), which translates environment variables into a controlled `vllm serve` invocation.

The configuration enables an API key and request-ID headers, but the vLLM service should still remain private behind the secure gateway.

## Model aliases

`SERVED_MODEL_NAME` is the stable internal name exposed by vLLM. The gateway can expose a different public alias and map it to this name, allowing future model replacement without changing application code.
