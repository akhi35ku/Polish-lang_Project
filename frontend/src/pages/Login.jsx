import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import TextInput from '../components/TextInput';
import PasswordInput from '../components/PasswordInput';
import Spinner from '../components/Spinner';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await login(email, password, rememberMe);
      toast.success(data.message);
      navigate(data.user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <GlassCard className="animate-fade-up">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          New here? <Link to="/register" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">Create an account</Link>
        </p>

        <form onSubmit={onSubmit} className="mt-7 space-y-4" noValidate>
          <TextInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required />
          <PasswordInput label="Password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" required />

          <div className="flex items-center justify-between text-sm">
            <label className="flex cursor-pointer items-center gap-2 font-medium text-slate-600 dark:text-slate-300">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 rounded accent-indigo-600" />
              Remember me <span className="hidden text-xs text-slate-400 sm:inline">(30 days)</span>
            </label>
            <Link to="/forgot-password" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">Forgot password?</Link>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-600 dark:text-rose-400 animate-fade-up">
              {error}
            </div>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full !py-3">
            {submitting ? <Spinner size="sm" /> : null}
            {submitting ? 'Signing in…' : 'Login'}
          </button>
        </form>
      </GlassCard>
    </div>
  );
}
