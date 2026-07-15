import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import TextInput from '../components/TextInput';
import PasswordInput from '../components/PasswordInput';
import Spinner from '../components/Spinner';

const PASSWORD_CHECKS = [
  { label: '8+ characters', test: (p) => p.length >= 8 },
  { label: 'Uppercase', test: (p) => /[A-Z]/.test(p) },
  { label: 'Lowercase', test: (p) => /[a-z]/.test(p) },
  { label: 'Number', test: (p) => /[0-9]/.test(p) },
  { label: 'Special char', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validateLocally = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required.';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email address.';
    if (!/^\+?[0-9]{7,15}$/.test(form.phone)) errs.phone = 'Enter 7–15 digits (optional leading +).';
    if (PASSWORD_CHECKS.some((c) => !c.test(form.password))) errs.password = 'Password does not meet all requirements.';
    if (form.confirmPassword !== form.password) errs.confirmPassword = 'Passwords do not match.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validateLocally()) return;
    setSubmitting(true);
    try {
      const data = await register(form);
      toast.success(data.message);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
      if (/email/i.test(err.message)) setErrors((x) => ({ ...x, email: err.message }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <GlassCard className="animate-fade-up">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Already registered? <Link to="/login" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">Log in</Link>
        </p>

        <form onSubmit={onSubmit} className="mt-7 space-y-4" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextInput label="First Name" value={form.firstName} onChange={set('firstName')} error={errors.firstName} placeholder="Jane" autoComplete="given-name" />
            <TextInput label="Last Name" value={form.lastName} onChange={set('lastName')} error={errors.lastName} placeholder="Doe" autoComplete="family-name" />
          </div>
          <TextInput label="Email" type="email" value={form.email} onChange={set('email')} error={errors.email} placeholder="jane@example.com" autoComplete="email" />
          <TextInput label="Phone Number" type="tel" value={form.phone} onChange={set('phone')} error={errors.phone} placeholder="+15551234567" autoComplete="tel" hint="Digits only, optional leading +" />
          <PasswordInput label="Password" value={form.password} onChange={set('password')} error={errors.password} placeholder="••••••••" autoComplete="new-password" />

          {/* live strength checklist */}
          <div className="flex flex-wrap gap-2">
            {PASSWORD_CHECKS.map((c) => {
              const ok = c.test(form.password);
              return (
                <span key={c.label} className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${ok ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>
                  {ok ? '✓' : '○'} {c.label}
                </span>
              );
            })}
          </div>

          <PasswordInput label="Confirm Password" value={form.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} placeholder="••••••••" autoComplete="new-password" />

          <button type="submit" disabled={submitting} className="btn-primary w-full !py-3">
            {submitting ? <Spinner size="sm" /> : null}
            {submitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
      </GlassCard>
    </div>
  );
}
