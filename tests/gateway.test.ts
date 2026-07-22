import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app.js';
import type { AppConfig } from '../src/config.js';

const config: AppConfig = {
  nodeEnv: 'test',
  port: 8080,
  logLevel: 'silent',
  gatewayApiKeys: ['test-client-key'],
  allowedTextModels: ['portfolio-text-model'],
  requestTimeoutMs: 1_000,
  maxCompletionTokens: 512,
  rateLimitWindowMs: 60_000,
  rateLimitMax: 100,
  vllmBaseUrl: 'https://text.internal/v1',
  vllmApiKey: 'private-text-key',
  vllmModelId: 'internal/model-id',
  imageWorkerBaseUrl: 'https://images.internal',
  imageWorkerApiKey: 'private-image-key',
};

function createMockFetch(): typeof fetch {
  return vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
    const url = String(input);
    if (url.endsWith('/models')) {
      return new Response(JSON.stringify({ data: [{ id: 'internal/model-id' }] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
    if (url.endsWith('/health')) {
      return new Response(JSON.stringify({ status: 'ok' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
    if (url.endsWith('/chat/completions')) {
      const body = JSON.parse(String(init?.body)) as { model: string };
      return new Response(
        JSON.stringify({
          id: 'chatcmpl-test',
          object: 'chat.completion',
          model: body.model,
          choices: [{ index: 0, message: { role: 'assistant', content: 'Hello.' } }],
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    }
    if (url.endsWith('/generate')) {
      return new Response(
        JSON.stringify({ images: [{ url: 'https://cdn.example.com/image.png' }] }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    }
    return new Response('Not found', { status: 404 });
  }) as typeof fetch;
}

describe('secure AI gateway', () => {
  it('exposes an unauthenticated liveness endpoint', async () => {
    const response = await request(createApp({ config, fetchImpl: createMockFetch() })).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.headers['x-request-id']).toBeTruthy();
  });

  it('protects inference endpoints with bearer authentication', async () => {
    const response = await request(createApp({ config, fetchImpl: createMockFetch() }))
      .post('/v1/chat/completions')
      .send({ model: 'portfolio-text-model', messages: [{ role: 'user', content: 'Hello' }] });
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects models outside the public allowlist', async () => {
    const response = await request(createApp({ config, fetchImpl: createMockFetch() }))
      .post('/v1/chat/completions')
      .set('authorization', 'Bearer test-client-key')
      .send({ model: 'unapproved-model', messages: [{ role: 'user', content: 'Hello' }] });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('MODEL_NOT_ALLOWED');
  });

  it('maps the public model alias to the private vLLM model identifier', async () => {
    const fetchImpl = createMockFetch();
    const response = await request(createApp({ config, fetchImpl }))
      .post('/v1/chat/completions')
      .set('authorization', 'Bearer test-client-key')
      .set('x-request-id', 'portfolio-test-001')
      .send({
        model: 'portfolio-text-model',
        messages: [{ role: 'user', content: 'Explain retrieval augmentation.' }],
        max_tokens: 128,
      });

    expect(response.status).toBe(200);
    expect(response.body.model).toBe('internal/model-id');
    expect(fetchImpl).toHaveBeenCalledOnce();
    const call = vi.mocked(fetchImpl).mock.calls[0];
    const init = call?.[1];
    expect(init?.headers).toMatchObject({
      authorization: 'Bearer private-text-key',
      'x-request-id': 'portfolio-test-001',
    });
  });

  it('normalizes the separate image worker response', async () => {
    const response = await request(createApp({ config, fetchImpl: createMockFetch() }))
      .post('/v1/images/generations')
      .set('authorization', 'Bearer test-client-key')
      .send({ prompt: 'A calm abstract landscape', size: '1024x1024', n: 1 });

    expect(response.status).toBe(200);
    expect(response.body.data[0].url).toBe('https://cdn.example.com/image.png');
  });

  it('reports readiness for both private inference dependencies', async () => {
    const response = await request(createApp({ config, fetchImpl: createMockFetch() })).get('/ready');
    expect(response.status).toBe(200);
    expect(response.body.dependencies).toEqual({ text_inference: true, image_inference: true });
  });
});
