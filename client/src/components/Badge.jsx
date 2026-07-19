export default function Badge({ children, variant = 'neutral' }) {
  const variants = {
    neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    danger: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    info: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  };

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${variants[variant]}`}>{children}</span>;
}
