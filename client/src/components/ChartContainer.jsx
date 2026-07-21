export default function ChartContainer({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-800/80 bg-[#0b0f19] p-5 shadow-sm dark:border-slate-800/80 dark:bg-[#0b0f19]">
      {title && (
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-tight text-white">{title}</h2>
        </div>
      )}
      {children}
    </div>
  );
}