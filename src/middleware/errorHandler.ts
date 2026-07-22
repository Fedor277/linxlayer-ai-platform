import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import type { Logger } from 'pino';
import { HttpError } from '../utils/errors.js';

export function createErrorHandler(logger: Logger): ErrorRequestHandler {
  return (error: unknown, _request, response, _next): void => {
    void _next;
    const requestId = String(response.locals.requestId ?? 'unknown');

    if (error instanceof ZodError) {
      response.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'The request payload is invalid.',
          details: error.flatten(),
          request_id: requestId,
        },
      });
      return;
    }

    if (error instanceof HttpError) {
      logger.warn({ requestId, code: error.code, details: error.details }, error.message);
      response.status(error.statusCode).json({
        error: {
          code: error.code,
          message: error.message,
          request_id: requestId,
        },
      });
      return;
    }

    logger.error({ requestId, error }, 'Unhandled gateway error');
    response.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred.',
        request_id: requestId,
      },
    });
  };
}
