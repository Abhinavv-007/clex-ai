import { Router, Request, Response } from 'express';
import { getConfigurationError } from '../config';
import { getDatabaseStatus } from '../utils/db';

const router = Router();

export async function getHealthResponse() {
  const configurationError = getConfigurationError();
  const databaseStatus = await getDatabaseStatus();
  const isHealthy = !configurationError && databaseStatus === 'connected';

  return {
    statusCode: isHealthy ? 200 : 503,
    body: {
      status: isHealthy ? 'ok' : 'degraded',
      version: '1.0.0',
      service: 'clex-api',
      database: databaseStatus,
      timestamp: new Date().toISOString(),
      ...(configurationError ? { error: configurationError.toJSON().error } : {}),
    },
  };
}

router.get('/', async (_req: Request, res: Response) => {
  const response = await getHealthResponse();
  res.status(response.statusCode).json(response.body);
});

export default router;
