import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';
import GlassCard from '../components/GlassCard';
import TextInput from '../components/TextInput';
import PasswordInput from '../components/PasswordInput';
import Spinner from '../components/Spinner';

const STEPS = ['Email', 'Verify Code', 'New Password'];

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const sendOtp = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      toast.success(data.message);
      setStep(1);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp });
      toast.success(data.message);
      setResetToken(data.resetToken);
      setStep(2);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match.');
    setBusy(true);
    try {
      const { data } = await api.post('/auth/reset-password', { resetToken, newPassword, confirmPassword });
      toast.success(data.message);
      navigate('/login');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <GlassCard className="animate-fade-up">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Reset your password</h1>

        {/* stepper */}
        <div className="mt-5 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${i <= step ? 'bg-indigo-600 text-white' : 'bg-slate-300/50 text-slate-500 dark:bg-slate-700'}`}>
                {i < step ? '✓' : i + 1}
              </span>
              <span className={`hidden text-xs font-semibold sm:block ${i <= step ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>{s}</span>
              {i < STEPS.length - 1 && <span className="h-px flex-1 bg-slate-300 dark:bg-slate-700" />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <form onSubmit={sendOtp} className="mt-7 space-y-4">
            <TextInput label="Account Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            <button type="submit" disabled={busy} className="btn-primary w-full !py-3">
              {busy ? <Spinner size="sm" /> : null} {busy ? 'Sending…' : 'Send 6-digit code'}
            </button>
          </form>
        )}

        {step === 1 && (
          <form onSubmit={verifyOtp} className="mt-7 space-y-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              We sent a 6-digit code to <b className="text-slate-800 dark:text-slate-200">{email}</b>. It expires in 10 minutes.
            </p>
            <TextInput
              label="Verification Code"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              style={{ letterSpacing: '0.5em', textAlign: 'center', fontWeight: 700, fontSize: '1.15rem' }}
              required
            />
            <button type="submit" disabled={busy || otp.length !== 6} className="btn-primary w-full !py-3">
              {busy ? <Spinner size="sm" /> : null} {busy ? 'Verifying…' : 'Verify code'}
            </button>
            <button type="button" onClick={sendOtp} disabled={busy} className="btn-ghost w-full">Resend code</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={resetPassword} className="mt-7 space-y-4">
            <PasswordInput label="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} hint="Min 8 chars with upper, lower, number & special character." required />
            <PasswordInput label="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            <button type="submit" disabled={busy} className="btn-primary w-full !py-3">
              {busy ? <Spinner size="sm" /> : null} {busy ? 'Saving…' : 'Set new password'}
            </button>
          </form>
        )}
      </GlassCard>
    </div>
  );
}
