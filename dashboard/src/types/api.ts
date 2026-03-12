export interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  created_at: string;
  last_used: string | null;
  revoked_at: string | null;
  expires_at: string | null;
  status: 'active' | 'revoked' | 'expired';
}

export interface CreateApiKeyResponse {
  id: string;
  key: string;
  name: string;
  prefix: string;
  created_at: string;
  expires_at: string | null;
  warning: string;
}

export interface ApiKeysListResponse {
  data: ApiKeyItem[];
}

export interface UsageLog {
  id: string;
  request_id: string;
  model: string;
  provider: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  estimated_cost: number;
  status: number;
  duration_ms: number;
  error_message: string | null;
  streaming: boolean;
  created_at: string;
}

export interface UsagePagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface UsageLogsResponse {
  data: UsageLog[];
  pagination: UsagePagination;
}

export interface DailyUsagePoint {
  date: string;
  requests: number;
  tokens: number;
  cost: number;
}

export interface TopModel {
  model: string;
  requests: number;
  tokens: number;
  cost: number;
}

export interface RecentRequest {
  id: string;
  model: string;
  status: number;
  total_tokens: number;
  estimated_cost: number;
  duration_ms: number;
  created_at: string;
}

export interface AnalyticsOverview {
  total_requests: number;
  total_tokens: number;
  total_cost: number;
  avg_duration_ms: number;
  error_rate: number;
  active_api_keys: number;
  prompt_tokens: number;
  completion_tokens: number;
}

export interface AnalyticsResponse {
  period: {
    days: number;
    since: string;
  };
  overview: AnalyticsOverview;
  daily: DailyUsagePoint[];
  top_models: TopModel[];
  recent_requests: RecentRequest[];
}
