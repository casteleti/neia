import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AnthropicProvider, DemoProvider } from './provider.js';

async function collect(stream: AsyncIterable<string>): Promise<string[]> { const chunks: string[] = []; for await (const chunk of stream) chunks.push(chunk); return chunks; }

test('provider demo não inventa fontes oficiais e pode ser interrompido', async () => {
  const provider = new DemoProvider(); const controller = new AbortController();
  const response = await collect(provider.stream([{ role: 'user', content: 'Quais cursos existem?' }], controller.signal));
  assert.match(response.join(''), /não tenho uma fonte oficial conectada/);
  const aborted = new AbortController(); aborted.abort();
  assert.deepEqual(await collect(provider.stream([{ role: 'user', content: 'Olá' }], aborted.signal)), []);
});

test('provider Anthropic usa transporte injetável e entrega deltas SSE', async () => {
  let receivedBody: Record<string, unknown> | undefined;
  const fakeFetch: typeof fetch = async (_input, init) => {
    receivedBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
    const events = [
      { type: 'message_start', message: { id: 'msg_test', type: 'message', role: 'assistant', model: 'test-model', content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 1, output_tokens: 1 } } },
      { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } },
      { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'Olá' } },
      { type: 'content_block_stop', index: 0 },
      { type: 'message_delta', delta: { stop_reason: 'end_turn', stop_sequence: null }, usage: { output_tokens: 1 } },
      { type: 'message_stop' },
    ];
    const body = events.map((event) => `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`).join('');
    return new Response(body, { status: 200, headers: { 'content-type': 'text/event-stream' } });
  };
  const provider = new AnthropicProvider('test-key-not-real', 'test-model', fakeFetch);
  const chunks = await collect(provider.stream([{ role: 'user', content: 'Olá' }], new AbortController().signal));
  assert.deepEqual(chunks, ['Olá']);
  assert.equal(receivedBody?.model, 'test-model');
});
