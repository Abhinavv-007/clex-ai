// ═══════════════════════════════════════════════════════
// Token cost estimation by model
// Prices are per 1M tokens (USD)
// ═══════════════════════════════════════════════════════

interface ModelPricing {
  prompt: number;
  completion: number;
}

const MODEL_PRICING: Record<string, ModelPricing> = {
  // OpenAI
  'openai/gpt-4o': { prompt: 2.50, completion: 10.00 },
  'openai/gpt-4o-mini': { prompt: 0.15, completion: 0.60 },
  'openai/gpt-4-turbo': { prompt: 10.00, completion: 30.00 },
  'openai/gpt-3.5-turbo': { prompt: 0.50, completion: 1.50 },

  // Anthropic
  'anthropic/claude-3.5-sonnet': { prompt: 3.00, completion: 15.00 },
  'anthropic/claude-3-opus': { prompt: 15.00, completion: 75.00 },
  'anthropic/claude-3-haiku': { prompt: 0.25, completion: 1.25 },

  // Meta / NVIDIA
  'meta/llama-3.3-70b-instruct': { prompt: 0.20, completion: 0.20 },
  'meta/llama-3.1-405b-instruct': { prompt: 1.00, completion: 1.00 },
  'meta/llama-3.1-70b-instruct': { prompt: 0.20, completion: 0.20 },
  'meta/llama-3.1-8b-instruct': { prompt: 0.05, completion: 0.05 },

  // Google
  'google/gemini-1.5-pro': { prompt: 1.25, completion: 5.00 },
  'google/gemini-1.5-flash': { prompt: 0.075, completion: 0.30 },
  'google/gemini-2.0-flash': { prompt: 0.10, completion: 0.40 },

  // Mistral
  'mistralai/mistral-large-2': { prompt: 2.00, completion: 6.00 },
  'mistralai/mixtral-8x22b-instruct': { prompt: 0.90, completion: 0.90 },
  'mistralai/mistral-7b-instruct': { prompt: 0.03, completion: 0.03 },

  // DeepSeek
  'deepseek/deepseek-r1': { prompt: 0.55, completion: 2.19 },
  'deepseek/deepseek-v3': { prompt: 0.27, completion: 1.10 },

  // Qwen
  'qwen/qwen2.5-72b-instruct': { prompt: 0.30, completion: 0.30 },
};

const DEFAULT_PRICING: ModelPricing = { prompt: 0.50, completion: 1.50 };

export function getModelPricing(model: string): ModelPricing {
  return MODEL_PRICING[model] || DEFAULT_PRICING;
}

export function estimateCost(model: string, promptTokens: number, completionTokens: number): number {
  const pricing = getModelPricing(model);
  const promptCost = (promptTokens / 1_000_000) * pricing.prompt;
  const completionCost = (completionTokens / 1_000_000) * pricing.completion;
  return Math.round((promptCost + completionCost) * 1_000_000) / 1_000_000; // 6 decimal places
}

export function estimateTokens(text: string): number {
  // Rough estimation: ~4 chars per token for English text
  return Math.ceil(text.length / 4);
}
