import { useState, useEffect } from "react";
import Table from "./Table";
import Badge from "./Badge";
import Button from "./Button";
import { getVehicles, createVehicle } from "../services/vehicleService";

export default function VehiclesPageContent() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    regNumber: "",
    model: "",
    type: "TRUCK",
    maxLoadCapacity: "",
    acquisitionCost: "",
    status: "AVAILABLE",
  });

  const loadData = async () => {
    try {
      const res = await getVehicles();
      const vehicleList =
        res.data?.vehicles ||
        res.data?.data?.vehicles ||
        res.data?.data ||
        (Array.isArray(res.data) ? res.data : []);
      setVehicles(vehicleList);
    } catch (err) {
      console.error(err);
      setVehicles([]);
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
      await createVehicle({
        ...formData,
        maxLoadCapacity: Number(formData.maxLoadCapacity),
        acquisitionCost: Number(formData.acquisitionCost),
      });
      setShowModal(false);
      setFormData({
        name: "",
        regNumber: "",
        model: "",
        type: "TRUCK",
        maxLoadCapacity: "",
        acquisitionCost: "",
        status: "AVAILABLE",
      });
      loadData();
    } catch (err) {
      console.error("Failed to create vehicle", err);
    }
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Vehicle Name" },
    { key: "regNumber", label: "Reg Number" },
    { key: "model", label: "Model" },
    { key: "type", label: "Type" },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <Badge
          variant={
            row.status === "AVAILABLE"
              ? "success"
              : row.status === "IN_SHOP"
              ? "danger"
              : "warning"
          }
        >
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Vehicle Fleet</h1>
        <Button onClick={() => setShowModal(true)}>Add Vehicle</Button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">Loading Vehicles...</div>
      ) : (
        <div className="w-full overflow-x-auto">
          <Table columns={columns} data={vehicles} />
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] p-6 text-slate-900 dark:text-white shadow-2xl transition-colors">
            <h2 className="mb-4 text-base font-bold">Add New Vehicle</h2>
            <form onSubmit={handleSubmit} className="space-y-3 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs text-slate-600 dark:text-slate-400">Vehicle Name</label>
                  <input
                    required
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-[#f5b301]"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-600 dark:text-slate-400">Reg Number</label>
                  <input
                    required
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-[#f5b301]"
                    value={formData.regNumber}
                    onChange={(e) => setFormData({ ...formData, regNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs text-slate-600 dark:text-slate-400">Model</label>
                  <input
                    required
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-[#f5b301]"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-600 dark:text-slate-400">Type</label>
                  <input
                    required
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-[#f5b301]"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs text-slate-600 dark:text-slate-400">Max Capacity (kg)</label>
                  <input
                    type="number"
                    required
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-[#f5b301]"
                    value={formData.maxLoadCapacity}
                    onChange={(e) => setFormData({ ...formData, maxLoadCapacity: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-600 dark:text-slate-400">Acquisition Cost (₹)</label>
                  <input
                    type="number"
                    required
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-[#f5b301]"
                    value={formData.acquisitionCost}
                    onChange={(e) => setFormData({ ...formData, acquisitionCost: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-slate-800 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
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