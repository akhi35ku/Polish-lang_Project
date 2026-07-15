import { useEffect, useState } from 'react';
import { API_URL, getToken } from '../lib/api';
import Spinner from '../components/Spinner';

/* Protected learning page.
   Fetches the full PolskiPath course from the backend WITH the JWT —
   the server refuses to serve it without a valid login. */
export default function Learn() {
  const [html, setHtml] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/learn/course`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!res.ok) throw new Error('Could not load the course. Please log in again.');
        setHtml(await res.text());
      } catch (err) {
        setError(err.message);
      }
    })();
  }, []);

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 text-center">
        <div className="glass rounded-2xl p-8">
          <div className="text-4xl">😕</div>
          <p className="mt-3 font-semibold text-slate-800 dark:text-slate-100">{error}</p>
        </div>
      </div>
    );
  }

  if (!html) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" label="Loading your Polish course…" />
      </div>
    );
  }

  return (
    <iframe
      title="PolskiPath — Polish A1 Course"
      srcDoc={html}
      className="block w-full border-0"
      style={{ height: 'calc(100vh - 65px)' }}
      allow="autoplay"
    />
  );
}
