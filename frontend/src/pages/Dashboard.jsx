import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';

function fmt(dt) {
  return dt ? new Date(dt).toLocaleString() : '—';
}

export default function Dashboard() {
  const { user } = useAuth();

  const rows = [
    ['Full name', `${user.firstName} ${user.lastName}`],
    ['Email', user.email],
    ['Phone', user.phone],
    ['Account status', user.status],
    ['Member since', fmt(user.createdAt)],
    ['Last login', fmt(user.lastLoginAt)],
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="animate-fade-up">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Hi, {user.firstName} 👋
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">You're securely logged in with a JWT session.</p>
      </div>

      <GlassCard className="mt-8 animate-fade-up">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your profile</h2>
        <dl className="mt-4 divide-y divide-slate-200/70 dark:divide-slate-700/70">
          {rows.map(([k, v]) => (
            <div key={k} className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <dt className="text-sm font-semibold text-slate-500 dark:text-slate-400">{k}</dt>
              <dd className={`text-sm font-medium ${v === 'ACTIVE' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'}`}>{v}</dd>
            </div>
          ))}
        </dl>
      </GlassCard>
    </div>
  );
}
