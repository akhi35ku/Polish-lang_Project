import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import TextInput from '../components/TextInput';
import Spinner from '../components/Spinner';

export default function Support() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user ? `${user.firstName} ${user.lastName}` : '',
    email: user ? user.email : '',
    subject: '',
    message: '',
  });
  const [busy, setBusy] = useState(false);
  const [sentTicket, setSentTicket] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post('/support', form);
      toast.success(data.message);
      setSentTicket(data.ticket);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (sentTicket) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <GlassCard className="text-center animate-fade-up">
          <div className="text-5xl">✅</div>
          <h1 className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-white">Ticket #{sentTicket.id} received</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Thanks, {form.name.split(' ')[0]}! Our team will reply to <b>{form.email}</b>.
          </p>
          <button className="btn-ghost mt-6" onClick={() => { setSentTicket(null); setForm((f) => ({ ...f, subject: '', message: '' })); }}>
            Send another message
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <GlassCard className="animate-fade-up">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Contact support</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">We usually reply within one business day.</p>

        <form onSubmit={onSubmit} className="mt-7 space-y-4">
          <TextInput label="Name" value={form.name} onChange={set('name')} placeholder="Jane Doe" required />
          <TextInput label="Email" type="email" value={form.email} onChange={set('email')} placeholder="jane@example.com" required />
          <TextInput label="Subject" value={form.subject} onChange={set('subject')} placeholder="I need help with…" required />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Message</span>
            <textarea className="glass-input min-h-[130px] resize-y" value={form.message} onChange={set('message')} placeholder="Describe the issue…" required />
          </label>
          <button type="submit" disabled={busy} className="btn-primary w-full !py-3">
            {busy ? <Spinner size="sm" /> : null} {busy ? 'Sending…' : 'Send message'}
          </button>
        </form>
      </GlassCard>
    </div>
  );
}
