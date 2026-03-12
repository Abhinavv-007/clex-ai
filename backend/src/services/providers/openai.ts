import { ChatMessage } from '../../types';

interface OpenAIChatParams {
  apiKey: string;
  baseUrl?: string;
  model: string;
  messages: ChatMessage[];
  temperature: number;
  max_tokens: number;
  top_p: number;
  stream: boolean;
  signal?: AbortSignal;
}

export async function openaiChat(params: OpenAIChatParams): Promise<Response> {
  const baseUrl = params.baseUrl || 'https://api.openai.com/v1';

  return fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${params.apiKey}`,
    },
    signal: params.signal,
    body: JSON.stringify({
      model: params.model,
      messages: params.messages,
      temperature: params.temperature,
      max_tokens: params.max_tokens,
      top_p: params.top_p,
      stream: params.stream,
    }),
  });
}
