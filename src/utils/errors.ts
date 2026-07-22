export class HttpError extends Error {
  public constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export class UpstreamError extends HttpError {
  public constructor(message: string, details?: unknown) {
    super(502, message, 'UPSTREAM_ERROR', details);
    this.name = 'UpstreamError';
  }
}

export class UpstreamTimeoutError extends HttpError {
  public constructor(message = 'The inference service timed out.') {
    super(504, message, 'UPSTREAM_TIMEOUT');
    this.name = 'UpstreamTimeoutError';
  }
}
