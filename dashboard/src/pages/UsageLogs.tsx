import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';

import PageIntro from '../components/PageIntro';
import PanelState from '../components/PanelState';
import { formatCompactNumber, formatShortDateTime, formatUsd } from '../lib/format';
import { getApiErrorMessage, getUsageLogs } from '../services/api';
import type { UsageLog, UsagePagination } from '../types/api';

const emptyPagination: UsagePagination = {
  page: 1,
  limit: 50,
  total: 0,
  pages: 1,
};

export default function UsageLogs() {
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [pagination, setPagination] = useState<UsagePagination>(emptyPagination);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterModel, setFilterModel] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    getUsageLogs({
      page: pagination.page,
      limit: pagination.limit,
      model: filterModel || undefined,
      status: filterStatus ? Number(filterStatus) : undefined,
    })
      .then((response) => {
        if (cancelled) return;
        setLogs(response.data);
        setPagination(response.pagination);
        setError(null);
      })
      .catch((requestError) => {
        if (cancelled) return;
        setError(getApiErrorMessage(requestError));
        setLogs([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filterModel, filterStatus, pagination.page, pagination.limit]);

  const statusClass = (status: number) => {
    if (status < 300) return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20';
    if (status < 500) return 'text-amber-300 bg-amber-500/10 border-amber-500/20';
    return 'text-red-300 bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="space-y-6">
      <PageIntro
        tone="cyan"
        eyebrow="Usage Logs"
        title="Every request, normalized and filterable."
        description="This table reads directly from the backend request log so you can validate model, provider, cost, and latency for every authenticated call."
      />

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="glass-card rounded-[28px] p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
            <Filter size={14} />
            Filters
          </div>
          <input
            type="text"
            value={filterModel}
            onChange={(event) => {
              setPagination((current) => ({ ...current, page: 1 }));
              setFilterModel(event.target.value);
            }}
            placeholder="Filter by model id"
            className="login-input !mb-0 !px-4"
          />
          <select
            value={filterStatus}
            onChange={(event) => {
              setPagination((current) => ({ ...current, page: 1 }));
              setFilterStatus(event.target.value);
            }}
            className="login-input !mb-0 !px-4"
          >
            <option value="">All statuses</option>
            <option value="200">200 OK</option>
            <option value="401">401 Unauthorized</option>
            <option value="429">429 Rate limited</option>
            <option value="500">500 Error</option>
          </select>
          <div className="ml-auto text-xs text-gray-500">{pagination.total} total rows</div>
        </div>
      </div>

      {loading ? (
        <PanelState loading title="Loading request logs" message="Fetching the latest request history for your authenticated user." />
      ) : logs.length === 0 ? (
        <PanelState
          title="No requests match these filters"
          message="Try broadening the model or status filter, or send a fresh API request so request logs can be recorded."
        />
      ) : (
        <div className="glass-card overflow-hidden rounded-[28px]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px]">
              <thead>
                <tr className="border-b border-white/6">
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Time</th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Model</th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Provider</th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Tokens</th>
                  <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Cost</th>
                  <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Latency</th>
                  <th className="px-5 py-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Stream</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {logs.map((log) => (
                  <tr key={log.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-5 py-4 text-xs text-gray-400">{formatShortDateTime(log.created_at)}</td>
                    <td className="px-5 py-4 text-sm font-medium text-white">{log.model}</td>
                    <td className="px-5 py-4 text-xs uppercase tracking-[0.16em] text-gray-400">{log.provider}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${statusClass(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-mono text-sm text-gray-300">{formatCompactNumber(log.total_tokens)}</td>
                    <td className="px-5 py-4 text-right font-mono text-sm text-gray-300">{formatUsd(log.estimated_cost, 4)}</td>
                    <td className="px-5 py-4 text-right font-mono text-sm text-gray-300">{log.duration_ms}ms</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-block h-2.5 w-2.5 rounded-full ${log.streaming ? 'bg-cyan-300' : 'bg-gray-600'}`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 ? (
            <div className="flex items-center justify-between border-t border-white/6 px-5 py-4">
              <span className="text-xs text-gray-500">
                Page {pagination.page} of {pagination.pages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPagination((current) => ({ ...current, page: current.page - 1 }))}
                  disabled={pagination.page <= 1}
                  className="btn-secondary flex items-center gap-1 disabled:opacity-30"
                >
                  <ChevronLeft size={14} />
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => setPagination((current) => ({ ...current, page: current.page + 1 }))}
                  disabled={pagination.page >= pagination.pages}
                  className="btn-secondary flex items-center gap-1 disabled:opacity-30"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
