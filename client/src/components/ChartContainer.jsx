export default function ChartContainer({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0b0f19] p-4 sm:p-5 shadow-sm">
      {title && (
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">{title}</h2>
        </div>
      )}
      {children}
    </div>
  );
}