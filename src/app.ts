import express, { type Express, type Request, type Response } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { pinoHttp } from 'pino-http';
import type { AppConfig } from './config.js';
import { ImageWorkerClient } from './clients/imageWorkerClient.js';
import { VllmClient } from './clients/vllmClient.js';
import { requireApiKey } from './middleware/auth.js';
import { createErrorHandler } from './middleware/errorHandler.js';
import { requestContext } from './middleware/requestContext.js';
import { createHealthRouter } from './routes/health.js';
import { createImageRouter } from './routes/images.js';
import { createTextRouter } from './routes/text.js';
import { createLogger } from './utils/logger.js';
import { HttpError } from './utils/errors.js';

export interface CreateAppOptions {
  config: AppConfig;
  fetchImpl?: typeof fetch;
}

export function createApp({ config, fetchImpl }: CreateAppOptions): Express {
  const logger = createLogger(config.logLevel);
  const vllmClient = new VllmClient({
    baseUrl: config.vllmBaseUrl,
    apiKey: config.vllmApiKey,
    upstreamModelId: config.vllmModelId,
    timeoutMs: config.requestTimeoutMs,
    ...(fetchImpl ? { fetchImpl } : {}),
  });
  const imageClient = new ImageWorkerClient({
    baseUrl: config.imageWorkerBaseUrl,
    apiKey: config.imageWorkerApiKey,
    timeoutMs: config.requestTimeoutMs,
    ...(fetchImpl ? { fetchImpl } : {}),
  });

  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(express.json({ limit: '128kb' }));
  app.use(requestContext);
  app.use(
    pinoHttp<Request, Response>({
      logger,
      customProps: (_request, response) => ({ requestId: response.locals.requestId }),
      serializers: {
        req(request) {
          return { method: request.method, url: request.url };
        },
      },
    }),
  );

  app.use(createHealthRouter(vllmClient, imageClient));
  app.use(
    rateLimit({
      windowMs: config.rateLimitWindowMs,
      limit: config.rateLimitMax,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
    }),
  );
  app.use(requireApiKey(config.gatewayApiKeys));
  app.use(createTextRouter(vllmClient, config.allowedTextModels, config.maxCompletionTokens));
  app.use(createImageRouter(imageClient));

  app.use((_request, _response, next) => {
    next(new HttpError(404, 'Route not found.', 'NOT_FOUND'));
  });
  app.use(createErrorHandler(logger));
  return app;
}
