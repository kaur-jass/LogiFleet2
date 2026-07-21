export default function Table({ columns = [], data = [] }) {
  const tableData = Array.isArray(data) ? data : [];

  console.log("tableData =", tableData);
  console.log("isArray =", Array.isArray(tableData));
  console.log("length =", tableData.length);

  if (tableData.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800/80 bg-[#0b0f19] p-8 text-center text-xs text-slate-500">
        No records found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-[#0b0f19] shadow-xl">
      <table className="min-w-full text-left text-sm text-slate-300">
        <thead className="border-b border-slate-800 bg-slate-900/60">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-800/50">
          {tableData.map((row, index) => (
            <tr
              key={row.id ?? index}
              className="transition-colors hover:bg-slate-900/40"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="px-4 py-3 text-sm text-slate-200"
                >
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}