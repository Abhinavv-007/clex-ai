import { NextFunction, Request, Response } from 'express';
import { type ConfigKey, getConfigurationError } from '../config';

export function requireConfiguration(keys?: readonly ConfigKey[]) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    const error = getConfigurationError(keys);
    if (!error) {
      next();
      return;
    }

    res.status(error.status).json(error.toJSON());
  };
}
