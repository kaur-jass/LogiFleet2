export default function Card({ title, subtitle, value, accent, children }) {
  return (
    <div className={`rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0b0f19] p-4 sm:p-5 shadow-sm transition hover:border-slate-300 dark:hover:border-slate-700/80 ${accent || ''}`}>
      {title && <div className="text-[11px] font-bold uppercase tracking-wider text-[#B8860B] dark:text-[#F5B301]">{title}</div>}
      {subtitle && <div className="mt-1 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">{subtitle}</div>}
      {value && <div className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{value}</div>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}