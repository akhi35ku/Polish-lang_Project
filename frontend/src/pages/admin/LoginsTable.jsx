function fmt(dt) {
  return dt ? new Date(dt).toLocaleString() : '—';
}

export default function LoginsTable({ logins }) {
  return (
    <div className="glass rounded-2xl p-5">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent logins</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-400 dark:border-slate-700">
              <th className="py-2.5 pr-3">User</th>
              <th className="py-2.5 pr-3">IP address</th>
              <th className="py-2.5 pr-3">Device</th>
              <th className="py-2.5">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70 dark:divide-slate-700/70">
            {logins.length === 0 && (
              <tr><td colSpan={4} className="py-8 text-center text-slate-400">No logins recorded yet.</td></tr>
            )}
            {logins.map((l) => (
              <tr key={l.id} className="text-slate-700 dark:text-slate-200">
                <td className="py-2.5 pr-3">
                  <div className="font-semibold">{l.user ? `${l.user.firstName} ${l.user.lastName}` : 'Deleted user'}</div>
                  <div className="text-xs text-slate-400">{l.user?.email}</div>
                </td>
                <td className="py-2.5 pr-3 font-mono text-xs">{l.ipAddress}</td>
                <td className="max-w-[220px] truncate py-2.5 pr-3 text-xs" title={l.userAgent}>{l.userAgent}</td>
                <td className="whitespace-nowrap py-2.5 text-xs">{fmt(l.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
