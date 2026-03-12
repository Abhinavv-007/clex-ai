import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

function FullScreenStatus({ message }: { message: string }) {
  return (
    <div className="relative z-10 flex min-h-[60vh] items-center justify-center px-6 pt-28 pb-16">
      <div className="glass-card max-w-md rounded-[28px] p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <div className="spinner" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-white">Preparing dashboard</h1>
        <p className="text-sm leading-relaxed text-gray-400">{message}</p>
      </div>
    </div>
  );
}

export default function RequireAuth() {
  const { loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <FullScreenStatus message="Checking your CLEX session and restoring the dashboard." />;
  }

  if (!user) {
    const next = encodeURIComponent(`${location.pathname}${location.search}${location.hash}`);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  return <Outlet />;
}
