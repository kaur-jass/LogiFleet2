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
    {
      key: "id",
      label: "ID",
      render: (row) => (
        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
          {row.id ? (row.id.length > 8 ? `${row.id.slice(0, 8)}...` : row.id) : "-"}
        </span>
      ),
    },
    {
      key: "name",
      label: "Vehicle Name",
      render: (row) => (
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {row.name}
        </span>
      ),
    },
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
    <div className="w-full max-w-full min-w-0 space-y-6 font-sans pb-10 px-3 sm:px-6">
      {/* Header Container */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Vehicle Fleet
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor and manage your fleet operations
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto bg-[#f5b301] text-slate-950 font-semibold hover:bg-[#e0a200]"
        >
          + Add Vehicle
        </Button>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19]">
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#f5b301] border-t-transparent" />
            <span>Loading Vehicles...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop & Tablet View (>= 640px): Full Table */}
          <div className="hidden sm:block w-full min-w-0 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] shadow-sm overflow-hidden">
            <Table columns={columns} data={vehicles} />
          </div>

          {/* Mobile View (< 640px): Responsive Vehicle Cards */}
          <div className="block sm:hidden space-y-3">
            {vehicles.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                No vehicles found.
              </div>
            ) : (
              vehicles.map((vehicle, index) => (
                <div
                  key={vehicle.id || vehicle.regNumber || index}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] p-4 text-xs shadow-sm space-y-3"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {vehicle.name}
                      </h3>
                      <p className="font-mono text-[10px] text-slate-400 mt-0.5">
                        {vehicle.regNumber ? `Reg: ${vehicle.regNumber}` : "No Reg"}
                      </p>
                    </div>
                    <Badge
                      variant={
                        vehicle.status === "AVAILABLE"
                          ? "success"
                          : vehicle.status === "IN_SHOP"
                          ? "danger"
                          : "warning"
                      }
                    >
                      {vehicle.status}
                    </Badge>
                  </div>

                  <hr className="border-slate-100 dark:border-slate-800/80" />

                  {/* Card Body */}
                  <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-slate-400">
                        Model
                      </p>
                      <p className="font-medium mt-0.5">{vehicle.model || "-"}</p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-semibold text-slate-400">
                        Type
                      </p>
                      <p className="font-medium mt-0.5">{vehicle.type || "-"}</p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-semibold text-slate-400">
                        Max Capacity
                      </p>
                      <p className="font-medium mt-0.5">
                        {vehicle.maxLoadCapacity ? `${vehicle.maxLoadCapacity} kg` : "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-semibold text-slate-400">
                        Cost
                      </p>
                      <p className="font-medium mt-0.5">
                        {vehicle.acquisitionCost ? `₹${vehicle.acquisitionCost}` : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Add Vehicle Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] p-6 text-slate-900 dark:text-white shadow-2xl my-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold">Add New Vehicle</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-200 text-lg leading-none p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">
                    Vehicle Name
                  </label>
                  <input
                    required
                    placeholder="e.g. Volvo FH16"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 px-3 py-2.5 text-slate-900 dark:text-white outline-none focus:border-[#f5b301] transition-colors"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">
                    Reg Number
                  </label>
                  <input
                    required
                    placeholder="e.g. MH-12-AB-1234"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 px-3 py-2.5 text-slate-900 dark:text-white outline-none focus:border-[#f5b301] transition-colors"
                    value={formData.regNumber}
                    onChange={(e) => setFormData({ ...formData, regNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">
                    Model
                  </label>
                  <input
                    required
                    placeholder="e.g. 2023"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 px-3 py-2.5 text-slate-900 dark:text-white outline-none focus:border-[#f5b301] transition-colors"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">
                    Type
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 px-3 py-2.5 text-slate-900 dark:text-white outline-none focus:border-[#f5b301] transition-colors"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="TRUCK">TRUCK</option>
                    <option value="VAN">VAN</option>
                    <option value="TRAILER">TRAILER</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">
                    Max Capacity (kg)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 25000"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 px-3 py-2.5 text-slate-900 dark:text-white outline-none focus:border-[#f5b301] transition-colors"
                    value={formData.maxLoadCapacity}
                    onChange={(e) => setFormData({ ...formData, maxLoadCapacity: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">
                    Acquisition Cost (₹)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 4500000"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 px-3 py-2.5 text-slate-900 dark:text-white outline-none focus:border-[#f5b301] transition-colors"
                    value={formData.acquisitionCost}
                    onChange={(e) => setFormData({ ...formData, acquisitionCost: e.target.value })}
                  />
                </div>
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
                  Save Vehicle
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}