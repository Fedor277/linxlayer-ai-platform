import { z } from 'zod';

const positiveInteger = z.coerce.number().int().positive();

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(8080),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  GATEWAY_API_KEYS: z.string().min(1),
  ALLOWED_TEXT_MODELS: z.string().min(1).default('portfolio-text-model'),
  REQUEST_TIMEOUT_MS: positiveInteger.default(45_000),
  MAX_COMPLETION_TOKENS: positiveInteger.default(2_048),
  RATE_LIMIT_WINDOW_MS: positiveInteger.default(60_000),
  RATE_LIMIT_MAX: positiveInteger.default(60),
  VLLM_BASE_URL: z.string().url(),
  VLLM_API_KEY: z.string().min(1),
  VLLM_MODEL_ID: z.string().min(1),
  IMAGE_WORKER_BASE_URL: z.string().url(),
  IMAGE_WORKER_API_KEY: z.string().min(1),
});

export interface AppConfig {
  nodeEnv: 'development' | 'test' | 'production';
  port: number;
  logLevel: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent';
  gatewayApiKeys: string[];
  allowedTextModels: string[];
  requestTimeoutMs: number;
  maxCompletionTokens: number;
  rateLimitWindowMs: number;
  rateLimitMax: number;
  vllmBaseUrl: string;
  vllmApiKey: string;
  vllmModelId: string;
  imageWorkerBaseUrl: string;
  imageWorkerApiKey: string;
}

function splitList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function loadConfig(environment: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = environmentSchema.parse(environment);
  return {
    nodeEnv: parsed.NODE_ENV,
    port: parsed.PORT,
    logLevel: parsed.LOG_LEVEL,
    gatewayApiKeys: splitList(parsed.GATEWAY_API_KEYS),
    allowedTextModels: splitList(parsed.ALLOWED_TEXT_MODELS),
    requestTimeoutMs: parsed.REQUEST_TIMEOUT_MS,
    maxCompletionTokens: parsed.MAX_COMPLETION_TOKENS,
    rateLimitWindowMs: parsed.RATE_LIMIT_WINDOW_MS,
    rateLimitMax: parsed.RATE_LIMIT_MAX,
    vllmBaseUrl: parsed.VLLM_BASE_URL.replace(/\/$/, ''),
    vllmApiKey: parsed.VLLM_API_KEY,
    vllmModelId: parsed.VLLM_MODEL_ID,
    imageWorkerBaseUrl: parsed.IMAGE_WORKER_BASE_URL.replace(/\/$/, ''),
    imageWorkerApiKey: parsed.IMAGE_WORKER_API_KEY,
  };
}
