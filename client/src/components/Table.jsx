export default function Table({ columns, data }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
        <thead className="bg-slate-50 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="border-b border-slate-200 p-4 font-semibold uppercase tracking-[0.16em] dark:border-slate-800">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="border-b border-slate-200 last:border-b-0 dark:border-slate-800">
              {columns.map((column) => (
                <td key={column.key} className="p-4 text-slate-700 dark:text-slate-300">
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
