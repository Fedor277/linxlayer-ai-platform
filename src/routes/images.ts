import { Router } from 'express';
import type { ImageWorkerClient } from '../clients/imageWorkerClient.js';
import { imageGenerationRequestSchema } from '../schemas/generation.js';

export function createImageRouter(imageClient: ImageWorkerClient): Router {
  const router = Router();

  router.post('/v1/images/generations', async (request, response, next) => {
    try {
      const payload = imageGenerationRequestSchema.parse(request.body);
      const result = await imageClient.generate(payload, String(response.locals.requestId));
      response.json(result);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
