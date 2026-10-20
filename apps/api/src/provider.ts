import Anthropic from '@anthropic-ai/sdk';

export const DEFAULT_ANTHROPIC_MODEL = 'claude-haiku-5-5';

export type ProviderMessage = { role: 'user' | 'assistant'; content: string };
export interface ChatProvider { stream(messages: ProviderMessage[], signal: AbortSignal): AsyncIterable<string> }

export class DemoProvider implements ChatProvider {
  async *stream(messages: ProviderMessage[], signal: AbortSignal): AsyncIterable<string> {
    const question = messages.at(-1)?.content.toLocaleLowerCase('pt-BR') ?? '';
    const topic = question.includes('curso') ? 'cursos' : question.includes('projeto') ? 'projetos' : question.includes('edital') ? 'editais' : question.includes('contato') ? 'canais de contato' : 'esse assunto';
    const response = `Ainda não tenho uma fonte oficial conectada para consultar informações atualizadas sobre ${topic}.\n\nEsta é uma versão demonstrativa da Néia. Para receber uma resposta confiável, consulte os canais oficiais da FUNEP. Quando as fontes institucionais forem integradas, poderei ajudar por aqui.`;
    for (let offset = 0; offset < response.length; offset += 28) {
      if (signal.aborted) return;
      await new Promise((resolve) => setTimeout(resolve, 18));
      yield response.slice(offset, offset + 28);
    }
  }
}

export class AnthropicProvider implements ChatProvider {
  private readonly client: Anthropic;
  private readonly model: string;
  constructor(apiKey: string, model: string, fetcher: typeof fetch = fetch) { this.client = new Anthropic({ apiKey, fetch: fetcher }); this.model = model; }
  async *stream(messages: ProviderMessage[], signal: AbortSignal): AsyncIterable<string> {
    const stream = this.client.messages.stream({
      model: this.model, max_tokens: 700,
      system: 'Você é a Néia, assistente virtual da FUNEP. Responda em português brasileiro, com clareza e cordialidade. Não invente informações, serviços, datas ou contatos institucionais. Use somente fontes oficiais presentes no contexto da resposta; se não houver informação suficiente, diga isso com clareza e recomende consultar os canais oficiais da FUNEP. Não afirme conexão com sistemas ou acesso a dados em tempo real.',
      messages: messages.map(({ role, content }) => ({ role, content })),
    }, { signal });
    for await (const event of stream) if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') yield event.delta.text;
  }
}

export function createProvider(): ChatProvider {
  if ((process.env.AI_PROVIDER ?? 'demo') === 'anthropic') {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const model = process.env.ANTHROPIC_MODEL ?? DEFAULT_ANTHROPIC_MODEL;
    if (!apiKey) throw new Error('AI_PROVIDER=anthropic requer ANTHROPIC_API_KEY no servidor.');
    return new AnthropicProvider(apiKey, model);
  }
  return new DemoProvider();
}
