import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../../components/GlassCard';
import TextInput from '../../components/TextInput';
import PasswordInput from '../../components/PasswordInput';
import Spinner from '../../components/Spinner';

/* Hidden admin entrance — reachable only by typing /admin directly.
   Uses the same /api/auth/login endpoint; access is enforced by the
   ADMIN role on the server for every admin API call. */
export default function AdminLogin() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const data = await login(email, password, false);
      if (data.user.role !== 'ADMIN') {
        await logout();
        toast.error('This account does not have admin access.');
        return;
      }
      toast.success('Welcome to the admin panel.');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <GlassCard className="animate-fade-up border-amber-500/30">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
          🛡️ Restricted area
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Admin login</h1>
        <form onSubmit={onSubmit} className="mt-7 space-y-4">
          <TextInput label="Admin Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@company.com" required />
          <PasswordInput label="Password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          <button type="submit" disabled={busy} className="btn-primary w-full !py-3">
            {busy ? <Spinner size="sm" /> : null} {busy ? 'Authenticating…' : 'Enter Admin Panel'}
          </button>
        </form>
      </GlassCard>
    </div>
  );
}
