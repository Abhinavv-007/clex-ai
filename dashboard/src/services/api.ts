import axios from 'axios';

import { getFirebaseIdToken } from '../lib/firebase';
import type {
  ApiKeysListResponse,
  CreateApiKeyResponse,
  AnalyticsResponse,
  UsageLogsResponse,
} from '../types/api';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export type ApiErrorPayload = {
  error?: {
    message?: string;
    type?: string;
    code?: string;
    status?: number;
  };
};

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await getFirebaseIdToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    return error.response?.data?.error?.message || error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Request failed.';
}

// ─── API Keys ──────────────────────────────────────────
export async function createApiKey(name: string, expiresAt?: string): Promise<CreateApiKeyResponse> {
  const { data } = await api.post<CreateApiKeyResponse>('/v1/keys', { name, expiresAt });
  return data;
}

export async function listApiKeys(): Promise<ApiKeysListResponse> {
  const { data } = await api.get<ApiKeysListResponse>('/v1/keys');
  return data;
}

export async function revokeApiKey(id: string) {
  const { data } = await api.delete(`/v1/keys/${id}`);
  return data;
}

// ─── Usage ─────────────────────────────────────────────
export async function getUsageLogs(params?: {
  page?: number;
  limit?: number;
  model?: string;
  status?: number;
  from?: string;
  to?: string;
}): Promise<UsageLogsResponse> {
  const { data } = await api.get<UsageLogsResponse>('/v1/usage', { params });
  return data;
}

// ─── Analytics ─────────────────────────────────────────
export async function getAnalytics(days = 30): Promise<AnalyticsResponse> {
  const { data } = await api.get<AnalyticsResponse>('/v1/analytics', { params: { days } });
  return data;
}

// ─── Health ────────────────────────────────────────────
export async function getHealth() {
  const { data } = await api.get('/v1/health');
  return data;
}

// ─── Models ────────────────────────────────────────────
export async function getModels() {
  const { data } = await api.get('/v1/models');
  return data;
}

export default api;
