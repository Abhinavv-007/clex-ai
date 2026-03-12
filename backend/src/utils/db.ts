import { PrismaClient } from '@prisma/client';
import { config, getConfigurationError } from '../config';
import { ConfigurationError } from './errors';
import { logger } from './logger';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

type DatabaseStatus = 'connected' | 'disconnected' | 'not_configured';

function createPrismaClient() {
  const client = new PrismaClient({
    datasources: {
      db: {
        url: config.DATABASE_URL,
      },
    },
    log: [
      { level: 'error', emit: 'event' },
      { level: 'warn', emit: 'event' },
    ],
  });

  client.$on('error' as never, (e: any) => {
    logger.error({ err: e }, 'Prisma error');
  });

  client.$on('warn' as never, (e: any) => {
    logger.warn({ warning: e }, 'Prisma warning');
  });

  return client;
}

function getPrismaClient(): PrismaClient {
  const configError = getConfigurationError(['DATABASE_URL']);
  if (configError) {
    throw new ConfigurationError(configError.message, configError.details);
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }

  return globalForPrisma.prisma;
}

export const prisma =
  new Proxy({} as PrismaClient, {
    get(_target, property) {
      const client = getPrismaClient();
      const value = Reflect.get(client as unknown as object, property);
      return typeof value === 'function' ? value.bind(client) : value;
    },
  }) as PrismaClient;

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    return (await getDatabaseStatus()) === 'connected';
  } catch {
    return false;
  }
}

export async function getDatabaseStatus(): Promise<DatabaseStatus> {
  if (!config.DATABASE_URL) {
    return 'not_configured';
  }

  try {
    await getPrismaClient().$queryRaw`SELECT 1`;
    return 'connected';
  } catch {
    return 'disconnected';
  }
}
