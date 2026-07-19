export default function ChartContainer({ title, children }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}
