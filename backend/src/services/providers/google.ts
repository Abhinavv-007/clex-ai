import { ChatMessage } from '../../types';

interface GeminiChatParams {
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  temperature: number;
  max_tokens: number;
  top_p: number;
  stream: boolean;
  signal?: AbortSignal;
}

export async function geminiChat(params: GeminiChatParams): Promise<Response> {
  const contents = params.messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const method = params.stream ? 'streamGenerateContent' : 'generateContent';
  const altParam = params.stream ? '&alt=sse' : '';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${params.model}:${method}?key=${params.apiKey}${altParam}`;

  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: params.signal,
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: params.temperature,
        topP: params.top_p,
        maxOutputTokens: params.max_tokens,
      },
    }),
  });
}
