import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

import { config } from '../config';
import { logger } from './logger';

type FirebaseServiceAccount = {
  project_id?: string;
  projectId?: string;
  client_email?: string;
  clientEmail?: string;
  private_key?: string;
  privateKey?: string;
  [key: string]: string | undefined;
};

let cachedAuth: ReturnType<typeof getAuth> | null | undefined;
let cachedInitError: Error | null = null;

function normalizeServiceAccount(raw: string): FirebaseServiceAccount {
  const parsed = JSON.parse(raw) as FirebaseServiceAccount;

  if (parsed.private_key && !parsed.privateKey) {
    parsed.privateKey = parsed.private_key;
  }
  if (parsed.client_email && !parsed.clientEmail) {
    parsed.clientEmail = parsed.client_email;
  }
  if (parsed.project_id && !parsed.projectId) {
    parsed.projectId = parsed.project_id;
  }
  if (parsed.privateKey) {
    parsed.privateKey = parsed.privateKey.replace(/\\n/g, '\n');
  }

  return parsed;
}

export function getFirebaseAdminAuth() {
  if (cachedAuth !== undefined) return cachedAuth;

  if (!config.FIREBASE_SERVICE_ACCOUNT_JSON) {
    cachedAuth = null;
    return cachedAuth;
  }

  try {
    const serviceAccount = normalizeServiceAccount(config.FIREBASE_SERVICE_ACCOUNT_JSON);
    const app = getApps()[0] || initializeApp({ credential: cert(serviceAccount) });
    cachedAuth = getAuth(app);
    return cachedAuth;
  } catch (error) {
    cachedInitError = error instanceof Error ? error : new Error('Invalid FIREBASE_SERVICE_ACCOUNT_JSON value.');
    cachedAuth = null;
    logger.error({ err: cachedInitError }, 'Failed to initialize Firebase Admin');
    return cachedAuth;
  }
}

export function getFirebaseAdminInitError() {
  return cachedInitError;
}
