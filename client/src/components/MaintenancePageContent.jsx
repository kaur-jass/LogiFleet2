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
    { key: "id", label: "Log ID" },
    {
      key: "vehicle",
      label: "Vehicle",
      render: (row) => row.vehicle?.regNumber || row.vehicleId,
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
    <div className="space-y-6 font-sans pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Vehicle Maintenance Logs
        </h1>
        <Button onClick={() => setShowModal(true)}>Schedule Maintenance</Button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
          Loading Maintenance...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table columns={columns} data={logs} />
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] p-6 text-slate-900 dark:text-white shadow-2xl transition-colors">
            <h2 className="mb-4 text-base font-bold">Schedule Maintenance</h2>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="mb-1 block text-slate-600 dark:text-slate-400">
                  Vehicle ID
                </label>
                <input
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-[#f5b301]"
                  value={formData.vehicleId}
                  onChange={(e) =>
                    setFormData({ ...formData, vehicleId: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-slate-600 dark:text-slate-400">
                  Description
                </label>
                <input
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-[#f5b301]"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-slate-600 dark:text-slate-400">
                  Estimated Cost (₹)
                </label>
                <input
                  type="number"
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-[#f5b301]"
                  value={formData.cost}
                  onChange={(e) =>
                    setFormData({ ...formData, cost: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <Button type="submit">Submit</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}