import { describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config.js';

describe('configuration', () => {
  it('parses comma-separated API keys and model aliases', () => {
    const config = loadConfig({
      NODE_ENV: 'test',
      GATEWAY_API_KEYS: 'key-one, key-two',
      ALLOWED_TEXT_MODELS: 'model-a,model-b',
      VLLM_BASE_URL: 'https://vllm.example.com/v1/',
      VLLM_API_KEY: 'secret',
      VLLM_MODEL_ID: 'org/model',
      IMAGE_WORKER_BASE_URL: 'https://images.example.com/',
      IMAGE_WORKER_API_KEY: 'secret',
    });

    expect(config.gatewayApiKeys).toEqual(['key-one', 'key-two']);
    expect(config.allowedTextModels).toEqual(['model-a', 'model-b']);
    expect(config.vllmBaseUrl).toBe('https://vllm.example.com/v1');
  });
});
