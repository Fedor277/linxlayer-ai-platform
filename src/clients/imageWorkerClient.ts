import { z } from 'zod';
import type { ImageGenerationRequest } from '../schemas/generation.js';
import { UpstreamError } from '../utils/errors.js';
import { fetchWithTimeout } from '../utils/fetchWithTimeout.js';

const workerResponseSchema = z.object({
  images: z.array(
    z.object({
      url: z.string().url().optional(),
      b64_json: z.string().min(1).optional(),
      revised_prompt: z.string().optional(),
    }).refine((item) => Boolean(item.url ?? item.b64_json), {
      message: 'Each image must contain a URL or base64 payload.',
    }),
  ),
});

export interface ImageWorkerClientOptions {
  baseUrl: string;
  apiKey: string;
  timeoutMs: number;
  fetchImpl?: typeof fetch;
}

export class ImageWorkerClient {
  private readonly fetchImpl: typeof fetch;

  public constructor(private readonly options: ImageWorkerClientOptions) {
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  public async generate(request: ImageGenerationRequest, requestId: string): Promise<unknown> {
    const [width, height] = request.size.split('x').map(Number) as [number, number];
    const response = await fetchWithTimeout(
      this.fetchImpl,
      `${this.options.baseUrl}/generate`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${this.options.apiKey}`,
          'x-request-id': requestId,
        },
        body: JSON.stringify({
          prompt: request.prompt,
          width,
          height,
          count: request.n,
          output: request.response_format,
          ...(request.seed === undefined ? {} : { seed: request.seed }),
        }),
      },
      this.options.timeoutMs,
    );

    const body = await response.json().catch(() => undefined);
    if (!response.ok) {
      throw new UpstreamError('Image generation failed.', {
        upstreamStatus: response.status,
      });
    }

    const parsed = workerResponseSchema.parse(body);
    return {
      created: Math.floor(Date.now() / 1_000),
      data: parsed.images,
    };
  }

  public async isReady(): Promise<boolean> {
    try {
      const response = await fetchWithTimeout(
        this.fetchImpl,
        `${this.options.baseUrl}/health`,
        { headers: { authorization: `Bearer ${this.options.apiKey}` } },
        Math.min(this.options.timeoutMs, 3_000),
      );
      return response.ok;
    } catch {
      return false;
    }
  }
}
