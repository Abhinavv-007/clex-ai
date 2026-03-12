import { ChatMessage } from '../../types';

interface AnthropicChatParams {
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  temperature: number;
  max_tokens: number;
  stream: boolean;
  signal?: AbortSignal;
}

export async function anthropicChat(params: AnthropicChatParams): Promise<Response> {
  const system = params.messages
    .filter(m => m.role === 'system')
    .map(m => m.content)
    .join('\n\n') || undefined;

  const messages = params.messages
    .filter(m => m.role !== 'system')
    .map(m => ({ role: m.role, content: m.content }));

  return fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': params.apiKey,
      'anthropic-version': '2023-06-01',
    },
    signal: params.signal,
    body: JSON.stringify({
      model: params.model,
      system,
      messages,
      max_tokens: params.max_tokens,
      temperature: params.temperature,
      stream: params.stream,
    }),
  });
}
