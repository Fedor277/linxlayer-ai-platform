import { Router } from 'express';
import type { ImageWorkerClient } from '../clients/imageWorkerClient.js';
import type { VllmClient } from '../clients/vllmClient.js';

export function createHealthRouter(vllmClient: VllmClient, imageClient: ImageWorkerClient): Router {
  const router = Router();

  router.get('/health', (_request, response) => {
    response.json({ status: 'ok', service: 'linxlayer-ai-gateway' });
  });

  router.get('/ready', async (_request, response) => {
    const [textReady, imageReady] = await Promise.all([
      vllmClient.isReady(),
      imageClient.isReady(),
    ]);
    const ready = textReady && imageReady;
    response.status(ready ? 200 : 503).json({
      status: ready ? 'ready' : 'degraded',
      dependencies: { text_inference: textReady, image_inference: imageReady },
    });
  });

  return router;
}
