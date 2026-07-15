import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import api, { API_URL, getToken } from '../../lib/api';
import { connectAdminSocket, disconnectSocket } from '../../lib/socket';
import StatCard from '../../components/StatCard';
import Spinner from '../../components/Spinner';
import UsersTable from './UsersTable';
import TicketsTable from './TicketsTable';
import LoginsTable from './LoginsTable';

const TABS = ['Overview', 'Users', 'Tickets', 'Logins'];

function fmt(dt) {
  return dt ? new Date(dt).toLocaleString() : '—';
}

export default function AdminDashboard() {
  const [tab, setTab] = useState('Overview');
  const [live, setLive] = useState(false);

  const [stats, setStats] = useState(null);
  const [latestUsers, setLatestUsers] = useState([]);
  const [recentLogins, setRecentLogins] = useState([]);

  const [users, setUsers] = useState([]);
  const [usersMeta, setUsersMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [usersLoading, setUsersLoading] = useState(false);
  const [search, setSearch] = useState('');
  const searchTimer = useRef(null);

  const [tickets, setTickets] = useState([]);
  const [logins, setLogins] = useState([]);

  /* ---------- data loaders ---------- */
  const loadStats = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data.stats);
      setLatestUsers(data.latestUsers);
      setRecentLogins(data.recentLogins);
    } catch (err) {
      toast.error(err.message);
    }
  }, []);

  const loadUsers = useCallback(async (page = 1, q = '') => {
    setUsersLoading(true);
    try {
      const { data } = await api.get('/admin/users', { params: { page, limit: 10, search: q } });
      setUsers(data.users);
      setUsersMeta({ total: data.total, page: data.page, pages: data.pages });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const loadTickets = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/tickets');
      setTickets(data.tickets);
    } catch (err) {
      toast.error(err.message);
    }
  }, []);

  const loadLogins = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/logins');
      setLogins(data.logins);
    } catch (err) {
      toast.error(err.message);
    }
  }, []);

  const refreshAll = useCallback(() => {
    loadStats();
    loadUsers(usersMeta.page, search);
    loadTickets();
    loadLogins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadStats, loadUsers, loadTickets, loadLogins, search]);

  /* ---------- initial load + realtime ---------- */
  useEffect(() => {
    loadStats();
    loadUsers();
    loadTickets();
    loadLogins();

    const socket = connectAdminSocket();
    socket.on('connect', () => setLive(true));
    socket.on('disconnect', () => setLive(false));

    socket.on('user:registered', (u) => {
      toast(`🆕 New signup: ${u.firstName} ${u.lastName}`, { icon: '👤' });
      loadStats();
      loadUsers(1, '');
    });
    socket.on('user:updated', () => { loadStats(); loadUsers(); });
    socket.on('user:deleted', () => { loadStats(); loadUsers(); });
    socket.on('ticket:created', (t) => {
      toast(`🎫 New ticket: ${t.subject}`, { icon: '📩' });
      loadStats();
      loadTickets();
    });
    socket.on('ticket:updated', () => { loadStats(); loadTickets(); });
    socket.on('login:recorded', (l) => {
      loadStats();
      setLogins((prev) => [l, ...prev].slice(0, 100));
    });

    return () => disconnectSocket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- debounced user search ---------- */
  const onSearch = (q) => {
    setSearch(q);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => loadUsers(1, q), 350);
  };

  /* ---------- authenticated CSV download ---------- */
  const downloadCsv = async (kind) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/export/${kind}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error('Export failed.');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${kind}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success(`${kind === 'users' ? 'Users' : 'Tickets'} CSV downloaded.`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-4 animate-fade-up">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Admin Dashboard</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${live ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            {live ? 'Live — updates stream in realtime' : 'Reconnecting to realtime…'}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost !py-2 text-sm" onClick={() => downloadCsv('users')}>⬇️ Users CSV</button>
          <button className="btn-ghost !py-2 text-sm" onClick={() => downloadCsv('tickets')}>⬇️ Tickets CSV</button>
        </div>
      </div>

      {/* stat cards */}
      {!stats ? (
        <div className="flex justify-center py-16"><Spinner size="lg" label="Loading dashboard…" /></div>
      ) : (
        <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard icon="👥" label="Total Users" value={stats.totalUsers} />
          <StatCard icon="🆕" label="Today's Signups" value={stats.todaysRegistrations} accent="from-emerald-500 to-teal-500" />
          <StatCard icon="🟢" label="Active Users (15m)" value={stats.activeUsers} accent="from-lime-500 to-emerald-500" />
          <StatCard icon="🎫" label="Support Tickets" value={stats.totalTickets} accent="from-amber-500 to-orange-500" />
          <StatCard icon="📬" label="Open Tickets" value={stats.openTickets} accent="from-rose-500 to-pink-500" />
        </div>
      )}

      {/* tabs */}
      <div className="glass mt-8 flex gap-1 rounded-2xl p-1.5">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-bold transition ${tab === t ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* tab content */}
      <div className="mt-6 space-y-6">
        {tab === 'Overview' && stats && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 animate-fade-up">
            <div className="glass rounded-2xl p-5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Latest registered users</h2>
              <div className="mt-3 space-y-2.5">
                {latestUsers.length === 0 && <p className="py-4 text-sm text-slate-400">No users yet — share your signup link!</p>}
                {latestUsers.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 rounded-xl bg-white/50 p-3 dark:bg-slate-800/40">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-bold text-white">
                      {u.firstName[0]}{u.lastName[0]}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{u.firstName} {u.lastName}</div>
                      <div className="truncate text-xs text-slate-400">{u.email}</div>
                    </div>
                    <span className="ml-auto whitespace-nowrap text-xs text-slate-400">{fmt(u.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
            <LoginsTable logins={recentLogins} />
          </div>
        )}

        {tab === 'Users' && (
          <div className="animate-fade-up">
            <UsersTable
              users={users}
              total={usersMeta.total}
              page={usersMeta.page}
              pages={usersMeta.pages}
              loading={usersLoading}
              search={search}
              onSearch={onSearch}
              onPage={(p) => loadUsers(p, search)}
              onChanged={refreshAll}
            />
          </div>
        )}

        {tab === 'Tickets' && (
          <div className="animate-fade-up">
            <TicketsTable tickets={tickets} onChanged={() => { loadTickets(); loadStats(); }} />
          </div>
        )}

        {tab === 'Logins' && (
          <div className="animate-fade-up">
            <LoginsTable logins={logins} />
          </div>
        )}
      </div>
    </div>
  );
}
