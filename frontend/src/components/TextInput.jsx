export default function TextInput({ label, error, hint, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      <input className={`glass-input ${error ? 'ring-2 ring-rose-500' : ''}`} {...props} />
      {error && <span className="mt-1 block text-xs font-medium text-rose-500">{error}</span>}
      {!error && hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}
