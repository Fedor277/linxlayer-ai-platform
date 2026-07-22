import { Router } from 'express';
import type { VllmClient } from '../clients/vllmClient.js';
import { chatCompletionRequestSchema } from '../schemas/generation.js';
import { HttpError } from '../utils/errors.js';

export function createTextRouter(
  vllmClient: VllmClient,
  allowedModels: string[],
  maxCompletionTokens: number,
): Router {
  const router = Router();

  router.post('/v1/chat/completions', async (request, response, next) => {
    try {
      const payload = chatCompletionRequestSchema.parse(request.body);
      if (!allowedModels.includes(payload.model)) {
        throw new HttpError(400, 'The requested model is not allowed.', 'MODEL_NOT_ALLOWED');
      }
      if ((payload.max_tokens ?? 0) > maxCompletionTokens) {
        throw new HttpError(
          400,
          `max_tokens cannot exceed ${maxCompletionTokens}.`,
          'TOKEN_LIMIT_EXCEEDED',
        );
      }

      const result = await vllmClient.createChatCompletion(
        payload,
        String(response.locals.requestId),
      );
      response.json(result);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
