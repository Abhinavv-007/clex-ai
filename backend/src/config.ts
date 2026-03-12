import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  DATABASE_URL: z.string().min(1),

  JWT_SECRET: z.string().min(8).default('dev-secret-change-me'),
  FIREBASE_SERVICE_ACCOUNT_JSON: z.string().optional(),

  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),
  NVIDIA_API_KEY: z.string().optional(),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(120),

  ALLOWED_ORIGINS: z.string().default('https://clex.in,https://www.clex.in,https://api.clex.in,http://localhost:3000,http://localhost:5173'),

  PROVIDER_TIMEOUT_MS: z.coerce.number().default(60_000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
  }
}

export const config = parsed.success ? parsed.data : {
  NODE_ENV: 'test' as const,
  PORT: 4000,
  LOG_LEVEL: 'info' as const,
  DATABASE_URL: 'postgresql://localhost:5432/clex_test',
  JWT_SECRET: 'test-secret',
  FIREBASE_SERVICE_ACCOUNT_JSON: undefined,
  OPENAI_API_KEY: undefined,
  ANTHROPIC_API_KEY: undefined,
  GOOGLE_API_KEY: undefined,
  NVIDIA_API_KEY: undefined,
  RATE_LIMIT_WINDOW_MS: 60000,
  RATE_LIMIT_MAX_REQUESTS: 120,
  ALLOWED_ORIGINS: 'http://localhost:3000,http://localhost:5173',
  PROVIDER_TIMEOUT_MS: 60000,
};

export const allowedOrigins = config.ALLOWED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean);
