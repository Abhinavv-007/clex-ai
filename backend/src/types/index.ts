// ═══════════════════════════════════════════════════════
// CLEX API – Type Definitions
// ═══════════════════════════════════════════════════════

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

export interface ChatCompletionChoice {
  index: number;
  message: {
    role: 'assistant';
    content: string;
  };
  finish_reason: string;
}

export interface ChatCompletionUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface ChatCompletionResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: ChatCompletionChoice[];
  usage: ChatCompletionUsage;
}

export interface StreamDelta {
  choices: Array<{
    index: number;
    delta: { content?: string; role?: string };
    finish_reason: string | null;
  }>;
}

export interface ProviderConfig {
  apiKey: string;
  baseUrl: string;
  timeoutMs: number;
}

export interface ProviderAdapter {
  name: string;
  chat(params: {
    model: string;
    messages: ChatMessage[];
    temperature: number;
    max_tokens: number;
    top_p: number;
    stream: boolean;
    signal?: AbortSignal;
  }): Promise<Response>;
}

export interface ModelInfo {
  id: string;
  object: 'model';
  created: number;
  owned_by: string;
  provider: string;
  context_length: number;
  max_output_tokens: number;
  pricing: {
    prompt: number;    // per 1M tokens
    completion: number; // per 1M tokens
  };
  capabilities: string[];
  category: string;
}

export interface ApiError {
  error: {
    message: string;
    type: string;
    code: string;
    status: number;
  };
}

export interface AuthenticatedRequest extends Express.Request {
  userId?: string;
  apiKeyId?: string;
  requestId?: string;
}

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      apiKeyId?: string;
      requestId?: string;
    }
  }
}
