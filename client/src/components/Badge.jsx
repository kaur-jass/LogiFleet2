export default function Badge({ children, variant = "neutral" }) {
  const variants = {
    neutral:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/50",
    success:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-400 dark:border-emerald-800/50",
    warning:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/80 dark:text-amber-400 dark:border-amber-800/50",
    danger:
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/80 dark:text-rose-400 dark:border-rose-800/50",
    info:
      "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/80 dark:text-sky-400 dark:border-sky-800/50",
  };

  const selectedVariant = variants[variant] || variants.neutral;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase transition-colors ${selectedVariant}`}
    >
      {children}
    </span>
  );
}