import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: '🔑', title: 'JWT sessions', text: 'Stateless tokens with Remember Me — 1 day or 30 days, your choice.' },
  { icon: '🔒', title: 'bcrypt hashing', text: 'Passwords are hashed with 12 salt rounds. Nobody can read them — not even us.' },
  { icon: '📧', title: 'OTP password reset', text: 'Forgot your password? A 6-digit code lands in your inbox within seconds.' },
  { icon: '⚡', title: 'Realtime admin', text: 'Signups, logins and support tickets stream live to the admin dashboard.' },
  { icon: '🛡️', title: 'Hardened API', text: 'Helmet, CORS, rate limiting, validation and sanitization on every route.' },
  { icon: '🎧', title: 'Built-in support', text: 'Send us a ticket any time — every message is stored and tracked.' },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden">
      {/* ambient blobs */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl animate-float-slower" />

      <section className="mx-auto flex max-w-6xl flex-col items-center px-4 pb-16 pt-20 text-center sm:px-6 sm:pt-28">
        <span className="glass mb-6 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 animate-fade-up">
          Production-ready authentication
        </span>
        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl animate-fade-up">
          Secure accounts.
          <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent"> Beautifully simple.</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg text-slate-600 dark:text-slate-300 animate-fade-up">
          Sign up in seconds, log in with confidence, and recover your password with a one-time
          email code. Everything encrypted, validated and rate-limited.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4 animate-fade-up">
          {user ? (
            <Link to={user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'} className="btn-primary text-base !px-8 !py-3">
              Go to {user.role === 'ADMIN' ? 'Admin Panel' : 'Dashboard'} →
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn-primary text-base !px-8 !py-3">Create Account</Link>
              <Link to="/login" className="btn-ghost text-base !px-8 !py-3">Login</Link>
            </>
          )}
          <Link to="/support" className="btn-ghost text-base !px-8 !py-3">Support</Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-5 px-4 pb-24 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        {features.map((f, i) => (
          <div key={f.title} className="glass rounded-2xl p-6 transition hover:-translate-y-1 hover:shadow-2xl animate-fade-up" style={{ animationDelay: `${i * 70}ms` }}>
            <div className="mb-3 text-3xl">{f.icon}</div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{f.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{f.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
