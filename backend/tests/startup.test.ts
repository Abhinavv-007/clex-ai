import { afterEach, describe, expect, it, vi } from 'vitest';

const originalEnv = { ...process.env };

function createMockResponse() {
  let statusCode = 200;
  let jsonBody: unknown;

  return {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(body: unknown) {
      jsonBody = body;
      return this;
    },
    get statusCode() {
      return statusCode;
    },
    get body() {
      return jsonBody;
    },
  };
}

async function loadModules(env: NodeJS.ProcessEnv) {
  vi.resetModules();
  process.env = {
    ...originalEnv,
    ...env,
  };

  const [{ getRootResponse }, { getHealthResponse }, { requireConfiguration }] = await Promise.all([
    import('../src/index'),
    import('../src/routes/health'),
    import('../src/middleware/requireConfiguration'),
  ]);

  return {
    getRootResponse,
    getHealthResponse,
    requireConfiguration,
  };
}

afterEach(() => {
  vi.resetModules();
  process.env = { ...originalEnv };
});

describe('Startup diagnostics', () => {
  it('returns a 503 JSON diagnostic for the root response when DATABASE_URL is missing', async () => {
    const { getRootResponse } = await loadModules({
      NODE_ENV: 'production',
      DATABASE_URL: '',
    });

    const response = getRootResponse();
    expect(response.statusCode).toBe(503);
    expect(response.body.status).toBe('degraded');
    expect(response.body.error.code).toBe('service_misconfigured');
    expect(response.body.error.missing_environment_variables).toContain('DATABASE_URL');
  });

  it('reports missing database configuration in the health response', async () => {
    const { getHealthResponse } = await loadModules({
      NODE_ENV: 'production',
      DATABASE_URL: '',
    });

    const response = await getHealthResponse();
    expect(response.statusCode).toBe(503);
    expect(response.body.status).toBe('degraded');
    expect(response.body.database).toBe('not_configured');
    expect(response.body.error.field_errors.DATABASE_URL).toContain('DATABASE_URL is required.');
  });

  it('fails DB-backed routes with a configuration error before the route handler runs', async () => {
    const { requireConfiguration } = await loadModules({
      NODE_ENV: 'production',
      DATABASE_URL: '',
    });

    const middleware = requireConfiguration(['DATABASE_URL']);
    const response = createMockResponse();
    const next = vi.fn();

    middleware({} as any, response as any, next);

    expect(next).not.toHaveBeenCalled();
    expect(response.statusCode).toBe(503);
    expect((response.body as any).error.code).toBe('service_misconfigured');
    expect((response.body as any).error.missing_environment_variables).toEqual(['DATABASE_URL']);
  });
});
