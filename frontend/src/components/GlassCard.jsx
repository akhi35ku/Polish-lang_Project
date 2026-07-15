export default function GlassCard({ children, className = '' }) {
  return <div className={`glass rounded-2xl p-6 sm:p-8 ${className}`}>{children}</div>;
}
