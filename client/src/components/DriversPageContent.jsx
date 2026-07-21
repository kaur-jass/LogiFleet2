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
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
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
    <div className="space-y-6 font-sans pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-white">Driver Management</h1>
        <Button onClick={() => setShowModal(true)}>Add Driver</Button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading Drivers...</div>
      ) : (
        <div className="overflow-x-auto">
          <Table columns={columns} data={drivers} />
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0b0f19] p-6 text-white shadow-2xl">
            <h2 className="mb-4 text-base font-bold">Add New Driver</h2>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="mb-1 block text-slate-400">Name</label>
                <input
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-white outline-none focus:border-[#f5b301]"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-slate-400">License Number</label>
                <input
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-white outline-none focus:border-[#f5b301]"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-slate-400">License Category</label>
                  <input
                    required
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-white outline-none focus:border-[#f5b301]"
                    value={formData.licenseCategory}
                    onChange={(e) => setFormData({ ...formData, licenseCategory: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-slate-400">License Expiry</label>
                  <input
                    type="date"
                    required
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-white outline-none focus:border-[#f5b301]"
                    value={formData.licenseExpiry}
                    onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-slate-400">Contact Number</label>
                <input
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-white outline-none focus:border-[#f5b301]"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-800 px-4 py-2 text-slate-400 hover:bg-slate-900"
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