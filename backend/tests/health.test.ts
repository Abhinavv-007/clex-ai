import { describe, it, expect } from 'vitest';

describe('Health endpoint', () => {
  it('should return correct structure', () => {
    const response = {
      status: 'ok',
      version: '1.0.0',
      service: 'clex-api',
      database: 'connected',
      timestamp: new Date().toISOString(),
    };

    expect(response.status).toBe('ok');
    expect(response.version).toBe('1.0.0');
    expect(response.service).toBe('clex-api');
    expect(response.timestamp).toBeTruthy();
  });
});
