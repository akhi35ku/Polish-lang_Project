import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

function fmt(dt) {
  return dt ? new Date(dt).toLocaleString() : '—';
}

export default function TicketsTable({ tickets, onChanged }) {
  const [openId, setOpenId] = useState(null);

  const toggleStatus = async (t) => {
    try {
      const { data } = await api.patch(`/admin/tickets/${t.id}/status`, {
        status: t.status === 'OPEN' ? 'CLOSED' : 'OPEN',
      });
      toast.success(data.message);
      onChanged();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="glass rounded-2xl p-5">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
        Support tickets <span className="text-sm font-medium text-slate-400">({tickets.length})</span>
      </h2>

      <div className="mt-4 space-y-2.5">
        {tickets.length === 0 && <p className="py-6 text-center text-sm text-slate-400">No tickets yet.</p>}
        {tickets.map((t) => (
          <div key={t.id} className="rounded-xl border border-slate-200/70 bg-white/50 p-4 dark:border-slate-700/70 dark:bg-slate-800/40">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400">#{t.id}</span>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${t.status === 'OPEN' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'}`}>
                {t.status}
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">{t.subject}</span>
              <span className="ml-auto text-xs text-slate-400">{fmt(t.createdAt)}</span>
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t.name} · {t.email} {t.user ? <span className="text-indigo-500">· registered user</span> : <span>· guest</span>}
            </div>
            {openId === t.id && (
              <p className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-100/70 p-3 text-sm text-slate-700 dark:bg-slate-900/50 dark:text-slate-200">
                {t.message}
              </p>
            )}
            <div className="mt-3 flex gap-2">
              <button className="btn-small" onClick={() => setOpenId(openId === t.id ? null : t.id)}>
                {openId === t.id ? 'Hide message' : 'Read message'}
              </button>
              <button className="btn-small" onClick={() => toggleStatus(t)}>
                {t.status === 'OPEN' ? '✅ Mark closed' : '↩️ Reopen'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
