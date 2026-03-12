import type { ReactNode } from 'react';

export default function PanelState({
  title,
  message,
  action,
  loading = false,
}: {
  title: string;
  message: string;
  action?: ReactNode;
  loading?: boolean;
}) {
  return (
    <div className="glass-card rounded-[28px] p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
        {loading ? <div className="spinner" /> : <div className="h-2.5 w-2.5 rounded-full bg-cyan-300" />}
      </div>
      <h2 className="mb-2 text-xl font-semibold text-white">{title}</h2>
      <p className="mx-auto max-w-xl text-sm leading-relaxed text-gray-400">{message}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
