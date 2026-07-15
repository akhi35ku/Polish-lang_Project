import { useState } from 'react';

export default function PasswordInput({ label, error, hint, ...props }) {
  const [show, setShow] = useState(false);
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      <div className="relative">
        <input type={show ? 'text' : 'password'} className={`glass-input pr-12 ${error ? 'ring-2 ring-rose-500' : ''}`} {...props} />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400 hover:text-indigo-500 transition"
          aria-label={show ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {show ? '🙈' : '👁️'}
        </button>
      </div>
      {error && <span className="mt-1 block text-xs font-medium text-rose-500">{error}</span>}
      {!error && hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}
