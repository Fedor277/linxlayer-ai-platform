import type { ChatCompletionRequest } from '../schemas/generation.js';
import { UpstreamError } from '../utils/errors.js';
import { fetchWithTimeout } from '../utils/fetchWithTimeout.js';

export interface VllmClientOptions {
  baseUrl: string;
  apiKey: string;
  upstreamModelId: string;
  timeoutMs: number;
  fetchImpl?: typeof fetch;
}

export class VllmClient {
  private readonly fetchImpl: typeof fetch;

  public constructor(private readonly options: VllmClientOptions) {
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  public async createChatCompletion(
    request: ChatCompletionRequest,
    requestId: string,
  ): Promise<unknown> {
    const response = await fetchWithTimeout(
      this.fetchImpl,
      `${this.options.baseUrl}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${this.options.apiKey}`,
          'x-request-id': requestId,
        },
        body: JSON.stringify({ ...request, model: this.options.upstreamModelId }),
      },
      this.options.timeoutMs,
    );

    const body = await response.json().catch(() => undefined);
    if (!response.ok) {
      throw new UpstreamError('Text generation failed.', {
        upstreamStatus: response.status,
      });
    }
    return body;
  }

  public async isReady(): Promise<boolean> {
    try {
      const response = await fetchWithTimeout(
        this.fetchImpl,
        `${this.options.baseUrl}/models`,
        {
          headers: { authorization: `Bearer ${this.options.apiKey}` },
        },
        Math.min(this.options.timeoutMs, 3_000),
      );
      return response.ok;
    } catch {
      return false;
    }
  }
}
