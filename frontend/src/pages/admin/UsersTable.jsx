import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import Spinner from '../../components/Spinner';

function fmt(dt) {
  return dt ? new Date(dt).toLocaleString() : '—';
}

export default function UsersTable({ users, total, page, pages, loading, search, onSearch, onPage, onChanged }) {
  const [busyId, setBusyId] = useState(null);

  const act = async (id, fn) => {
    setBusyId(id);
    try {
      await fn();
      onChanged();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const deleteUser = (u) => {
    if (!window.confirm(`Permanently delete ${u.email}? This cannot be undone.`)) return;
    act(u.id, async () => {
      const { data } = await api.delete(`/admin/users/${u.id}`);
      toast.success(data.message);
    });
  };

  const toggleStatus = (u) => {
    const status = u.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    act(u.id, async () => {
      const { data } = await api.patch(`/admin/users/${u.id}/status`, { status });
      toast.success(data.message);
    });
  };

  const resetPassword = (u) => {
    const newPassword = window.prompt(
      `New password for ${u.email}\n(min 8 chars, upper + lower + number + special):`
    );
    if (!newPassword) return;
    act(u.id, async () => {
      const { data } = await api.post(`/admin/users/${u.id}/reset-password`, { newPassword });
      toast.success(data.message);
    });
  };

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Users <span className="text-sm font-medium text-slate-400">({total})</span>
        </h2>
        <input
          className="glass-input sm:max-w-xs"
          placeholder="🔍 Search name, email or phone…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <div className="mt-4 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-10"><Spinner label="Loading users…" /></div>
        ) : (
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-400 dark:border-slate-700">
                <th className="py-2.5 pr-3">User</th>
                <th className="py-2.5 pr-3">Phone</th>
                <th className="py-2.5 pr-3">Status</th>
                <th className="py-2.5 pr-3">Registered</th>
                <th className="py-2.5 pr-3">Last login</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-700/70">
              {users.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-slate-400">No users match your search.</td></tr>
              )}
              {users.map((u) => (
                <tr key={u.id} className="text-slate-700 dark:text-slate-200">
                  <td className="py-3 pr-3">
                    <div className="font-semibold">{u.firstName} {u.lastName}</div>
                    <div className="text-xs text-slate-400">{u.email}</div>
                  </td>
                  <td className="py-3 pr-3 whitespace-nowrap">{u.phone}</td>
                  <td className="py-3 pr-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${u.status === 'ACTIVE' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 pr-3 whitespace-nowrap text-xs">{fmt(u.createdAt)}</td>
                  <td className="py-3 pr-3 whitespace-nowrap text-xs">{fmt(u.lastLoginAt)}</td>
                  <td className="py-3">
                    <div className="flex justify-end gap-1.5">
                      <button className="btn-small" disabled={busyId === u.id} onClick={() => toggleStatus(u)} title={u.status === 'ACTIVE' ? 'Disable user' : 'Enable user'}>
                        {u.status === 'ACTIVE' ? '🚫 Disable' : '✅ Enable'}
                      </button>
                      <button className="btn-small" disabled={busyId === u.id} onClick={() => resetPassword(u)} title="Reset password">🔑 Reset</button>
                      <button className="btn-danger" disabled={busyId === u.id} onClick={() => deleteUser(u)} title="Delete user">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <button className="btn-small" disabled={page <= 1} onClick={() => onPage(page - 1)}>← Prev</button>
          <span className="font-semibold text-slate-500">Page {page} of {pages}</span>
          <button className="btn-small" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}
