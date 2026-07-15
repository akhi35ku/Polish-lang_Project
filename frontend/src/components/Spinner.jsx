export default function Spinner({ size = 'md', label }) {
  const dims = { sm: 'h-4 w-4 border-2', md: 'h-8 w-8 border-[3px]', lg: 'h-12 w-12 border-4' }[size];
  return (
    <span className="inline-flex items-center gap-3">
      <span
        className={`${dims} animate-spin rounded-full border-indigo-500 border-t-transparent`}
        role="status"
        aria-label={label || 'Loading'}
      />
      {label && <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>}
    </span>
  );
}
