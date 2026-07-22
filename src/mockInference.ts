import express from 'express';

const app = express();
app.use(express.json());

app.get('/v1/models', (_request, response) => {
  response.json({ object: 'list', data: [{ id: 'local-demo-model', object: 'model' }] });
});

app.post('/v1/chat/completions', (request, response) => {
  const messages = Array.isArray(request.body?.messages) ? request.body.messages : [];
  const lastMessage = messages.at(-1)?.content ?? 'No prompt provided.';
  response.json({
    id: `chatcmpl-demo-${Date.now()}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1_000),
    model: request.body?.model ?? 'local-demo-model',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: `Synthetic local response to: ${String(lastMessage).slice(0, 120)}`,
        },
        finish_reason: 'stop',
      },
    ],
    usage: { prompt_tokens: 12, completion_tokens: 18, total_tokens: 30 },
  });
});

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.post('/generate', (request, response) => {
  const count = Math.max(1, Math.min(Number(request.body?.count ?? 1), 4));
  response.json({
    images: Array.from({ length: count }, (_, index) => ({
      url: `https://example.invalid/synthetic-image-${index + 1}.png`,
      revised_prompt: String(request.body?.prompt ?? ''),
    })),
  });
});

const port = Number(process.env.MOCK_PORT ?? 9001);
app.listen(port, () => {
  console.log(`Synthetic inference services listening on http://localhost:${port}`);
});
