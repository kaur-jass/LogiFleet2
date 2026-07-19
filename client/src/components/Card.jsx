export default function Card({ title, subtitle, value, accent, children }) {
  return (
    <div className={`rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950 ${accent || ''}`}>
      {title && <div className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">{title}</div>}
      {subtitle && <div className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">{subtitle}</div>}
      {value && <div className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">{value}</div>}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
