const baseUrl = process.env.AI_BASE_URL ?? 'http://localhost:8080';
const apiKey = process.env.AI_API_KEY ?? 'local-demo-key';

interface ChatCompletion {
  choices: Array<{ message: { content: string } }>;
}

async function main(): Promise<void> {
  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
      'x-request-id': crypto.randomUUID(),
    },
    body: JSON.stringify({
      model: 'portfolio-text-model',
      messages: [{ role: 'user', content: 'Explain model allowlisting.' }],
      max_tokens: 250,
    }),
  });

  if (!response.ok) {
    throw new Error(`Gateway returned ${response.status}: ${await response.text()}`);
  }

  const completion = (await response.json()) as ChatCompletion;
  console.log(completion.choices[0]?.message.content);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
