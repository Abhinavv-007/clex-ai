import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    logger.warn({ err, requestId: req.requestId, path: req.path }, err.message);
    res.status(err.status).json(err.toJSON());
    return;
  }

  logger.error({ err, requestId: req.requestId, path: req.path }, 'Unhandled error');
  res.status(500).json({
    error: {
      message: 'Internal server error',
      type: 'server_error',
      code: 'internal_error',
      status: 500,
    },
  });
}
