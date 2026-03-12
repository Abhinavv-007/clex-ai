import { describe, it, expect } from 'vitest';
import { MODEL_CATALOG } from '../src/routes/models';
import { resolveModel, getAllModelIds } from '../src/services/providerService';

describe('Model catalog', () => {
  it('should have at least 15 models', () => {
    expect(MODEL_CATALOG.length).toBeGreaterThanOrEqual(15);
  });

  it('each model should have required fields', () => {
    for (const model of MODEL_CATALOG) {
      expect(model.id).toBeTruthy();
      expect(model.object).toBe('model');
      expect(model.provider).toBeTruthy();
      expect(model.context_length).toBeGreaterThan(0);
      expect(model.pricing.prompt).toBeGreaterThanOrEqual(0);
      expect(model.pricing.completion).toBeGreaterThanOrEqual(0);
      expect(model.capabilities.length).toBeGreaterThan(0);
    }
  });

  it('should have unique model IDs', () => {
    const ids = MODEL_CATALOG.map(m => m.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});

describe('Provider routing', () => {
  it('should resolve known models', () => {
    const route = resolveModel('openai/gpt-4o');
    expect(route).toBeTruthy();
    expect(route!.provider).toBe('openai');
    expect(route!.modelId).toBe('gpt-4o');
  });

  it('should resolve NVIDIA models', () => {
    const route = resolveModel('meta/llama-3.3-70b-instruct');
    expect(route).toBeTruthy();
    expect(route!.provider).toBe('nvidia');
  });

  it('should return null for unknown models', () => {
    const route = resolveModel('nonexistent/model');
    expect(route).toBeNull();
  });

  it('should list all model IDs', () => {
    const ids = getAllModelIds();
    expect(ids.length).toBeGreaterThan(0);
    expect(ids).toContain('openai/gpt-4o');
    expect(ids).toContain('meta/llama-3.3-70b-instruct');
  });
});
