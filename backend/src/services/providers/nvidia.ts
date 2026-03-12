import { ChatMessage } from '../../types';

interface NvidiaChatParams {
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  temperature: number;
  max_tokens: number;
  top_p: number;
  stream: boolean;
  signal?: AbortSignal;
}

export async function nvidiaChat(params: NvidiaChatParams): Promise<Response> {
  return fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
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
