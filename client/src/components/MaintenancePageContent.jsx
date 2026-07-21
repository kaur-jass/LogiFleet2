import { useState, useEffect } from "react";
import Table from "./Table";
import Badge from "./Badge";
import Button from "./Button";
import {
  getMaintenanceLogs,
  createMaintenance,
  closeMaintenance,
} from "../services/maintenanceService";

export default function MaintenancePageContent() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    vehicleId: "",
    type: "ROUTINE",
    description: "",
    cost: 0,
  });

  const loadData = async () => {
    try {
      const res = await getMaintenanceLogs();
      const logsList =
        res.data?.logs ||
        res.data?.data?.logs ||
        res.data?.data ||
        (Array.isArray(res.data) ? res.data : []);
      setLogs(logsList);
    } catch (err) {
      console.error(err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMaintenance({
        ...formData,
        cost: Number(formData.cost),
      });
      setShowModal(false);
      setFormData({ vehicleId: "", type: "ROUTINE", description: "", cost: 0 });
      loadData();
    } catch (err) {
      console.error("Failed to schedule maintenance", err);
    }
  };

  const handleClose = async (id) => {
    try {
      await closeMaintenance(id);
      loadData();
    } catch (err) {
      console.error("Failed to close maintenance", err);
    }
  };

  const columns = [
    {
      key: "id",
      label: "Log ID",
      render: (row) => (
        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
          {row.id ? (row.id.length > 8 ? `${row.id.slice(0, 8)}...` : row.id) : "-"}
        </span>
      ),
    },
    {
      key: "vehicle",
      label: "Vehicle",
      render: (row) => (
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {row.vehicle?.regNumber || row.vehicleId || "-"}
        </span>
      ),
    },
    { key: "type", label: "Type" },
    { key: "description", label: "Description" },
    {
      key: "cost",
      label: "Cost",
      render: (row) => `₹${row.cost?.toLocaleString() || 0}`,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <Badge variant={row.status === "CLOSED" ? "success" : "warning"}>
          {row.status || "OPEN"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) =>
        row.status !== "CLOSED" && (
          <button
            onClick={() => handleClose(row.id)}
            className="rounded-lg border border-emerald-500/30 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
          >
            Mark Closed
          </button>
        ),
    },
  ];

  return (
    <div className="w-full max-w-full min-w-0 space-y-6 font-sans pb-10 px-3 sm:px-6">
      {/* Header Container */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Vehicle Maintenance Logs
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track service records, costs, and vehicle repairs
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto bg-[#f5b301] text-slate-950 font-semibold hover:bg-[#e0a200]"
        >
          + Schedule Maintenance
        </Button>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19]">
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#f5b301] border-t-transparent" />
            <span>Loading Maintenance Logs...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop & Tablet View (>= 640px): Full Table */}
          <div className="hidden sm:block w-full min-w-0 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] shadow-sm overflow-hidden">
            <Table columns={columns} data={logs} />
          </div>

          {/* Mobile View (< 640px): Responsive Maintenance Cards */}
          <div className="block sm:hidden space-y-3">
            {logs.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                No maintenance logs found.
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] p-4 text-xs shadow-sm space-y-3"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {log.vehicle?.regNumber || log.vehicleId || "Unknown Vehicle"}
                      </h3>
                      <p className="font-mono text-[10px] text-slate-400 mt-0.5">
                        Log ID: {log.id ? (log.id.length > 8 ? `${log.id.slice(0, 8)}...` : log.id) : "-"}
                      </p>
                    </div>
                    <Badge variant={log.status === "CLOSED" ? "success" : "warning"}>
                      {log.status || "OPEN"}
                    </Badge>
                  </div>

                  <hr className="border-slate-100 dark:border-slate-800/80" />

                  {/* Card Body */}
                  <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-slate-400">
                        Type
                      </p>
                      <p className="font-medium mt-0.5">{log.type || "-"}</p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-semibold text-slate-400">
                        Cost
                      </p>
                      <p className="font-medium mt-0.5">
                        ₹{log.cost?.toLocaleString() || 0}
                      </p>
                    </div>

                    <div className="col-span-2 pt-1">
                      <p className="text-[10px] uppercase font-semibold text-slate-400">
                        Description
                      </p>
                      <p className="font-medium mt-0.5 text-slate-800 dark:text-slate-200">
                        {log.description || "No description provided."}
                      </p>
                    </div>
                  </div>

                  {/* Card Actions */}
                  {log.status !== "CLOSED" && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
                      <button
                        onClick={() => handleClose(log.id)}
                        className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                      >
                        Mark Closed
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Schedule Maintenance Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] p-6 text-slate-900 dark:text-white shadow-2xl my-auto transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold">Schedule Maintenance</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-200 text-lg leading-none p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">
                  Vehicle ID
                </label>
                <input
                  required
                  placeholder="e.g. VEH-1234"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 px-3 py-2.5 text-slate-900 dark:text-white outline-none focus:border-[#f5b301] transition-colors"
                  value={formData.vehicleId}
                  onChange={(e) =>
                    setFormData({ ...formData, vehicleId: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">
                  Maintenance Type
                </label>
                <select
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 px-3 py-2.5 text-slate-900 dark:text-white outline-none focus:border-[#f5b301] transition-colors"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  <option value="ROUTINE">ROUTINE</option>
                  <option value="REPAIR">REPAIR</option>
                  <option value="INSPECTION">INSPECTION</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">
                  Description
                </label>
                <input
                  required
                  placeholder="e.g. Oil change and brake pad check"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 px-3 py-2.5 text-slate-900 dark:text-white outline-none focus:border-[#f5b301] transition-colors"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">
                  Estimated Cost (₹)
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 5500"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 px-3 py-2.5 text-slate-900 dark:text-white outline-none focus:border-[#f5b301] transition-colors"
                  value={formData.cost}
                  onChange={(e) =>
                    setFormData({ ...formData, cost: e.target.value })
                  }
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 font-medium transition-colors"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  className="w-full sm:w-auto bg-[#f5b301] text-slate-950 font-semibold hover:bg-[#e0a200]"
                >
                  Submit
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}