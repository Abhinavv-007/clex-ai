import { describe, it, expect } from 'vitest';
import { estimateCost, estimateTokens, getModelPricing } from '../src/utils/costs';

describe('Cost utilities', () => {
  it('should return pricing for known models', () => {
    const pricing = getModelPricing('openai/gpt-4o');
    expect(pricing.prompt).toBe(2.50);
    expect(pricing.completion).toBe(10.00);
  });

  it('should return default pricing for unknown models', () => {
    const pricing = getModelPricing('unknown/model-xyz');
    expect(pricing.prompt).toBe(0.50);
    expect(pricing.completion).toBe(1.50);
  });

  it('should calculate cost correctly', () => {
    const cost = estimateCost('meta/llama-3.3-70b-instruct', 1000, 500);
    // prompt: 1000/1M * 0.20 = 0.0002
    // completion: 500/1M * 0.20 = 0.0001
    expect(cost).toBeCloseTo(0.0003, 4);
  });

  it('should estimate tokens from text', () => {
    const text = 'Hello world, this is a test sentence for token estimation.';
    const tokens = estimateTokens(text);
    expect(tokens).toBeGreaterThan(0);
    expect(tokens).toBeLessThan(text.length);
  });
});
