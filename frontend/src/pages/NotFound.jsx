import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="text-7xl font-extrabold text-indigo-500/40">404</div>
      <h1 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">Page not found</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-6">← Back home</Link>
    </div>
  );
}
