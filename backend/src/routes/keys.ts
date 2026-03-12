import { Router, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { prisma } from '../utils/db';
import { firebaseAuth } from '../middleware/auth';
import { AppError, NotFoundError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

const router = Router();

// All dashboard routes require Firebase auth
router.use(firebaseAuth);

// POST /v1/keys – Create a new API key
router.post('/', async (req: Request, res: Response) => {
  const schema = z.object({
    name: z.string().min(1).max(64).default('Default Key'),
    expiresAt: z.string().datetime().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    const fieldErrors = Object.values(parsed.error.flatten().fieldErrors).flatMap((value) => (
      Array.isArray(value) ? value : value ? [value] : []
    ));
    const message = fieldErrors.join(', ') || 'Invalid request body.';
    const error = new ValidationError(message);
    res.status(error.status).json(error.toJSON());
    return;
  }

  try {
    const rawKey = `clex_${nanoid(40)}`;
    const keyHash = await bcrypt.hash(rawKey, 12);
    const keyPrefix = rawKey.slice(0, 12);

    const apiKey = await prisma.apiKey.create({
      data: {
        userId: req.userId!,
        name: parsed.data.name,
        keyHash,
        keyPrefix,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      },
    });

    res.status(201).json({
      id: apiKey.id,
      key: rawKey, // Only shown once!
      name: apiKey.name,
      prefix: keyPrefix,
      created_at: apiKey.createdAt.toISOString(),
      expires_at: apiKey.expiresAt?.toISOString() || null,
      warning: 'Save this key now. You will not be able to see it again.',
    });
  } catch (err) {
    logger.error({ err }, 'Failed to create API key');
    const error = new AppError('Failed to create API key', 500, 'api_key_create_failed', 'server_error');
    res.status(error.status).json(error.toJSON());
  }
});

// GET /v1/keys – List all API keys for the user
router.get('/', async (req: Request, res: Response) => {
  try {
    const keys = await prisma.apiKey.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        createdAt: true,
        lastUsed: true,
        revokedAt: true,
        expiresAt: true,
      },
    });

    res.json({
      data: keys.map(k => ({
        id: k.id,
        name: k.name,
        prefix: k.keyPrefix,
        created_at: k.createdAt.toISOString(),
        last_used: k.lastUsed?.toISOString() || null,
        revoked_at: k.revokedAt?.toISOString() || null,
        expires_at: k.expiresAt?.toISOString() || null,
        status: k.revokedAt ? 'revoked' : (k.expiresAt && k.expiresAt < new Date() ? 'expired' : 'active'),
      })),
    });
  } catch (err) {
    logger.error({ err }, 'Failed to list API keys');
    const error = new AppError('Failed to list API keys', 500, 'api_key_list_failed', 'server_error');
    res.status(error.status).json(error.toJSON());
  }
});

// DELETE /v1/keys/:id – Revoke an API key
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const keyId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const key = await prisma.apiKey.findFirst({
      where: { id: keyId, userId: req.userId! },
    });

    if (!key) {
      const error = new NotFoundError('API key not found');
      res.status(error.status).json(error.toJSON());
      return;
    }

    if (key.revokedAt) {
      const error = new AppError('API key already revoked', 400, 'api_key_already_revoked', 'invalid_request');
      res.status(error.status).json(error.toJSON());
      return;
    }

    await prisma.apiKey.update({
      where: { id: key.id },
      data: { revokedAt: new Date() },
    });

    res.json({ message: 'API key revoked successfully' });
  } catch (err) {
    logger.error({ err }, 'Failed to revoke API key');
    const error = new AppError('Failed to revoke API key', 500, 'api_key_revoke_failed', 'server_error');
    res.status(error.status).json(error.toJSON());
  }
});

export default router;
