import { useState, useEffect } from "react";
import Table from "./Table";
import Badge from "./Badge";
import Button from "./Button";
import { getDrivers, createDriver } from "../services/driverService";

export default function DriversPageContent() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    licenseNumber: "",
    licenseCategory: "HEAVY",
    licenseExpiry: "",
    contactNumber: "",
    status: "AVAILABLE",
  });

  const loadData = async () => {
    try {
      const res = await getDrivers();
      const driverList = res.data.data.drivers;
      setDrivers(driverList);
    } catch (err) {
      console.error(err);
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
      await createDriver(formData);
      setShowModal(false);
      setFormData({
        name: "",
        licenseNumber: "",
        licenseCategory: "HEAVY",
        licenseExpiry: "",
        contactNumber: "",
        status: "AVAILABLE",
      });
      loadData();
    } catch (err) {
      console.error("Failed to create driver", err);
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
      label: "Name",
      render: (row) => (
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {row.name}
        </span>
      ),
    },
    { key: "licenseNumber", label: "License No." },
    { key: "licenseCategory", label: "Category" },
    { key: "contactNumber", label: "Contact" },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <Badge variant={row.status === "AVAILABLE" ? "success" : "warning"}>
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="w-full max-w-full min-w-0 space-y-6 font-sans pb-10 px-3 sm:px-6">
      {/* 3. Header: Stacked vertically on mobile, row on tablet/desktop */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Driver Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage, onboard, and assign fleet drivers
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto bg-[#f5b301] text-slate-950 font-semibold hover:bg-[#e0a200]"
        >
          + Add Driver
        </Button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19]">
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#f5b301] border-t-transparent" />
            <span>Loading Drivers...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop & Tablet View (>= 640px): Full Table */}
          <div className="hidden sm:block w-full min-w-0 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] shadow-sm overflow-hidden">
            <Table columns={columns} data={drivers} />
          </div>

          {/* 1. Mobile View (< 640px): Driver Cards */}
          <div className="block sm:hidden space-y-3">
            {drivers.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                No drivers found.
              </div>
            ) : (
              drivers.map((driver) => (
                <div
                  key={driver.id || driver.licenseNumber}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] p-4 text-xs shadow-sm space-y-3"
                >
                  {/* Top Bar: Name & Status */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {driver.name}
                      </h3>
                      {driver.id && (
                        <p className="font-mono text-[10px] text-slate-400 mt-0.5">
                          ID: {driver.id.length > 12 ? `${driver.id.slice(0, 12)}...` : driver.id}
                        </p>
                      )}
                    </div>
                    <Badge variant={driver.status === "AVAILABLE" ? "success" : "warning"}>
                      {driver.status}
                    </Badge>
                  </div>

                  <hr className="border-slate-100 dark:border-slate-800/80" />

                  {/* Driver Details */}
                  <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-slate-400">
                        License No.
                      </p>
                      <p className="font-medium mt-0.5">{driver.licenseNumber || "-"}</p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-semibold text-slate-400">
                        Category
                      </p>
                      <p className="font-medium mt-0.5">{driver.licenseCategory || "-"}</p>
                    </div>

                    <div className="col-span-2 pt-1">
                      <p className="text-[10px] uppercase font-semibold text-slate-400">
                        Contact
                      </p>
                      <p className="font-medium mt-0.5">{driver.contactNumber || "-"}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* 4. Responsive Add Driver Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] p-6 text-slate-900 dark:text-white shadow-2xl my-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold">Add New Driver</h2>
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
                  Full Name
                </label>
                <input
                  required
                  placeholder="e.g. John Doe"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 px-3 py-2.5 text-slate-900 dark:text-white outline-none focus:border-[#f5b301] transition-colors"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">
                  License Number
                </label>
                <input
                  required
                  placeholder="e.g. DL-99999"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 px-3 py-2.5 text-slate-900 dark:text-white outline-none focus:border-[#f5b301] transition-colors"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">
                    Category
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 px-3 py-2.5 text-slate-900 dark:text-white outline-none focus:border-[#f5b301] transition-colors"
                    value={formData.licenseCategory}
                    onChange={(e) => setFormData({ ...formData, licenseCategory: e.target.value })}
                  >
                    <option value="HEAVY">HEAVY</option>
                    <option value="Class A">Class A</option>
                    <option value="Class B">Class B</option>
                    <option value="Class C">Class C</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">
                    License Expiry
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 px-3 py-2.5 text-slate-900 dark:text-white outline-none focus:border-[#f5b301] transition-colors"
                    value={formData.licenseExpiry}
                    onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">
                  Contact Number
                </label>
                <input
                  required
                  placeholder="e.g. +1 555-0192"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 px-3 py-2.5 text-slate-900 dark:text-white outline-none focus:border-[#f5b301] transition-colors"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
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
                  Save Driver
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}