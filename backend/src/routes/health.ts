import { Router, Request, Response } from 'express';
import { checkDatabaseConnection } from '../utils/db';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const dbOk = await checkDatabaseConnection();

  res.json({
    status: dbOk ? 'ok' : 'degraded',
    version: '1.0.0',
    service: 'clex-api',
    database: dbOk ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

export default router;
