export default function Badge({ children, variant = "neutral" }) {
  const variants = {
    neutral:
      "bg-slate-800/80 text-slate-300 border-slate-700/50 dark:bg-slate-800/80 dark:text-slate-300",
    success:
      "bg-emerald-950/80 text-emerald-400 border-emerald-800/50 dark:bg-emerald-950/80 dark:text-emerald-400",
    warning:
      "bg-amber-950/80 text-amber-400 border-amber-800/50 dark:bg-amber-950/80 dark:text-amber-400",
    danger:
      "bg-rose-950/80 text-rose-400 border-rose-800/50 dark:bg-rose-950/80 dark:text-rose-400",
    info:
      "bg-sky-950/80 text-sky-400 border-sky-800/50 dark:bg-sky-950/80 dark:text-sky-400",
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