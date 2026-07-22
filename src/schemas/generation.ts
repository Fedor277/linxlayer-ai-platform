import { z } from 'zod';

const textContentSchema = z.string().min(1).max(30_000);

export const chatCompletionRequestSchema = z.object({
  model: z.string().min(1),
  messages: z
    .array(
      z.object({
        role: z.enum(['system', 'user', 'assistant']),
        content: textContentSchema,
      }),
    )
    .min(1)
    .max(100),
  temperature: z.number().min(0).max(2).optional(),
  top_p: z.number().min(0).max(1).optional(),
  max_tokens: z.number().int().positive().optional(),
  stream: z.literal(false).optional().default(false),
});

export const imageGenerationRequestSchema = z.object({
  prompt: z.string().min(1).max(4_000),
  size: z.enum(['512x512', '768x768', '1024x1024', '1024x1536', '1536x1024']).default('1024x1024'),
  n: z.number().int().min(1).max(4).default(1),
  response_format: z.enum(['url', 'b64_json']).default('url'),
  seed: z.number().int().nonnegative().optional(),
});

export type ChatCompletionRequest = z.infer<typeof chatCompletionRequestSchema>;
export type ImageGenerationRequest = z.infer<typeof imageGenerationRequestSchema>;
