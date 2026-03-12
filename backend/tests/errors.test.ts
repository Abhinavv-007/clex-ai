import { describe, it, expect } from 'vitest';
import {
  AppError,
  AuthenticationError,
  ValidationError,
  ProviderError,
  RateLimitError,
  normalizeProviderError,
} from '../src/utils/errors';

describe('Error classes', () => {
  it('AppError should serialize to JSON correctly', () => {
    const err = new AppError('test error', 400, 'test_code', 'test_type');
    const json = err.toJSON();
    expect(json.error.message).toBe('test error');
    expect(json.error.status).toBe(400);
    expect(json.error.code).toBe('test_code');
    expect(json.error.type).toBe('test_type');
  });

  it('AuthenticationError should have 401 status', () => {
    const err = new AuthenticationError();
    expect(err.status).toBe(401);
    expect(err.code).toBe('invalid_api_key');
  });

  it('ValidationError should have 400 status', () => {
    const err = new ValidationError('bad input');
    expect(err.status).toBe(400);
    expect(err.message).toBe('bad input');
  });

  it('ProviderError should have 502 default status', () => {
    const err = new ProviderError('upstream failed');
    expect(err.status).toBe(502);
  });

  it('RateLimitError should have 429 status', () => {
    const err = new RateLimitError();
    expect(err.status).toBe(429);
  });
});

describe('normalizeProviderError', () => {
  it('should parse JSON error body', () => {
    const err = normalizeProviderError(401, JSON.stringify({ error: { message: 'Invalid key' } }));
    expect(err.message).toContain('Invalid key');
    expect(err.status).toBe(502); // provider auth → 502
  });

  it('should handle rate limit status', () => {
    const err = normalizeProviderError(429, 'Rate limited');
    expect(err.status).toBe(429);
  });

  it('should handle server errors', () => {
    const err = normalizeProviderError(500, 'Internal error');
    expect(err.status).toBe(502);
  });

  it('should handle raw text body', () => {
    const err = normalizeProviderError(400, 'bad request');
    expect(err.message).toContain('bad request');
  });
});
