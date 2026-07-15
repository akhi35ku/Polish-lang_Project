export default function StatCard({ icon, label, value, accent = 'from-indigo-500 to-violet-500' }) {
  return (
    <div className="glass rounded-2xl p-5 animate-fade-up">
      <div className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-xl text-white shadow-lg`}>
        {icon}
      </div>
      <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{value}</div>
      <div className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</div>
    </div>
  );
}
