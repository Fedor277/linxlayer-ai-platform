#!/usr/bin/env bash
set -euo pipefail

: "${MODEL_ID:?MODEL_ID is required}"
: "${SERVED_MODEL_NAME:?SERVED_MODEL_NAME is required}"
: "${VLLM_API_KEY:?VLLM_API_KEY is required}"

export HF_HOME="${HF_HOME:-/workspace/huggingface-cache}"
export VLLM_CACHE_ROOT="${VLLM_CACHE_ROOT:-/workspace/vllm-cache}"

exec vllm serve "${MODEL_ID}" \
  --host 0.0.0.0 \
  --port "${PORT:-8000}" \
  --served-model-name "${SERVED_MODEL_NAME}" \
  --api-key "${VLLM_API_KEY}" \
  --dtype auto \
  --generation-config vllm \
  --enable-request-id-headers \
  --max-model-len "${MAX_MODEL_LEN:-8192}" \
  --gpu-memory-utilization "${GPU_MEMORY_UTILIZATION:-0.90}" \
  --tensor-parallel-size "${TENSOR_PARALLEL_SIZE:-1}"
