import { Router, Request, Response } from 'express';
import { prisma } from '../utils/db';
import { firebaseAuth } from '../middleware/auth';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

const router = Router();
router.use(firebaseAuth);

// GET /v1/usage – Get request logs (paginated)
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const model = req.query.model as string | undefined;
    const status = req.query.status ? parseInt(req.query.status as string) : undefined;
    const from = req.query.from ? new Date(req.query.from as string) : undefined;
    const to = req.query.to ? new Date(req.query.to as string) : undefined;

    const where: any = { userId: req.userId! };
    if (model) where.model = model;
    if (status) where.status = status;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = from;
      if (to) where.createdAt.lte = to;
    }

    const [logs, total] = await Promise.all([
      prisma.requestLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          requestId: true,
          model: true,
          provider: true,
          promptTokens: true,
          completionTokens: true,
          totalTokens: true,
          estimatedCost: true,
          status: true,
          durationMs: true,
          errorMessage: true,
          streaming: true,
          createdAt: true,
        },
      }),
      prisma.requestLog.count({ where }),
    ]);

    res.json({
      data: logs.map(l => ({
        id: l.id,
        request_id: l.requestId,
        model: l.model,
        provider: l.provider,
        prompt_tokens: l.promptTokens,
        completion_tokens: l.completionTokens,
        total_tokens: l.totalTokens,
        estimated_cost: l.estimatedCost,
        status: l.status,
        duration_ms: l.durationMs,
        error_message: l.errorMessage,
        streaming: l.streaming,
        created_at: l.createdAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    logger.error({ err }, 'Failed to fetch usage logs');
    const error = new AppError('Failed to fetch usage logs', 500, 'usage_logs_unavailable', 'server_error');
    res.status(error.status).json(error.toJSON());
  }
});

export default router;
