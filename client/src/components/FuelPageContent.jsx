import React, { useState, useEffect } from 'react';
import Card from './Card';
import Table from './Table';
import Button from './Button';
import API from '../api/axios';
import { getFuelLogs, createFuelLog } from '../services/fuelService';

export default function FuelPageContent() {
  const [fuelLogs, setFuelLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [role, setRole] = useState('');

  const [form, setForm] = useState({
    vehicleId: '',
    liters: '',
    cost: '',
    tripId: '',
    date: new Date().toISOString().substring(0, 10),
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getFuelLogs();
      setFuelLogs(res.data?.logs || []);
    } catch (err) {
      setError('Failed to fetch fuel logs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setRole(localStorage.getItem('role') || '');
  }, []);

  const openLogModal = async () => {
    try {
      const res = await API.get('/vehicles');
      setVehicles(res.data?.data?.vehicles || []);
      setShowModal(true);
    } catch (err) {
      alert('Failed to load vehicles list.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createFuelLog({
        vehicleId: form.vehicleId,
        tripId: form.tripId.trim() || null,
        liters: parseFloat(form.liters),
        cost: parseFloat(form.cost),
        date: new Date(form.date),
      });
      setShowModal(false);
      setForm({
        vehicleId: '',
        liters: '',
        cost: '',
        tripId: '',
        date: new Date().toISOString().substring(0, 10),
      });
      loadData();
    } catch (err) {
      alert(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          'Failed to log fuel log'
      );
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'Log ID',
      render: (row) => (
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
          {row.id ? row.id.substring(0, 8) : '-'}
        </span>
      ),
    },
    {
      key: 'vehicle',
      label: 'Vehicle',
      render: (row) =>
        row.vehicle
          ? `${row.vehicle.name} [${row.vehicle.regNumber}]`
          : row.vehicleId
          ? row.vehicleId.substring(0, 8)
          : '-',
    },
    {
      key: 'liters',
      label: 'Liters (L)',
      render: (row) => `${row.liters} L`,
    },
    {
      key: 'cost',
      label: 'Cost',
      render: (row) => (
        <span className="font-medium text-[#B8860B] dark:text-[#F5B301]">
          ₹{row.cost ? row.cost.toLocaleString() : 0}
        </span>
      ),
    },
    {
      key: 'date',
      label: 'Date Registered',
      render: (row) => new Date(row.date).toLocaleDateString(),
    },
    {
      key: 'trip',
      label: 'Linked Trip',
      render: (row) =>
        row.trip ? `${row.trip.source} → ${row.trip.destination}` : 'None',
    },
  ];

  return (
    <div className="w-full max-w-full min-w-0 space-y-6 font-sans pb-10 px-3 sm:px-6">
      {/* Header Container */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Fuel Logs
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track fuel expenses, refills, and vehicle consumption
          </p>
        </div>
        {(role === 'FLEET_MANAGER' || role === 'DRIVER') && (
          <Button
            onClick={openLogModal}
            className="w-full sm:w-auto bg-[#f5b301] text-slate-950 font-semibold hover:bg-[#e0a200]"
          >
            + Log Fuel Fill
          </Button>
        )}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19]">
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#f5b301] border-t-transparent" />
            <span>Loading fuel logs...</span>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 text-center text-xs text-rose-500 dark:text-rose-400">
          {error}
        </div>
      ) : fuelLogs.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] p-8 text-center text-xs text-slate-500 dark:text-slate-400">
          No fuel records logged yet.
        </div>
      ) : (
        <>
          {/* Desktop & Tablet View (>= 640px): Table inside Card */}
          <div className="hidden sm:block">
            <Card title="Fuel Transaction Logs">
              <div className="w-full min-w-0 overflow-hidden">
                <Table columns={columns} data={fuelLogs} />
              </div>
            </Card>
          </div>

          {/* Mobile View (< 640px): Responsive Fuel Cards */}
          <div className="block sm:hidden space-y-3">
            {fuelLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] p-4 text-xs shadow-sm space-y-3"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {log.vehicle
                        ? `${log.vehicle.name} [${log.vehicle.regNumber}]`
                        : log.vehicleId
                        ? log.vehicleId.substring(0, 8)
                        : 'Unknown Vehicle'}
                    </h3>
                    <p className="font-mono text-[10px] text-slate-400 mt-0.5">
                      Log ID: {log.id ? log.id.substring(0, 8) : '-'}
                    </p>
                  </div>
                  <span className="font-bold text-sm text-[#B8860B] dark:text-[#F5B301]">
                    ₹{log.cost ? log.cost.toLocaleString() : 0}
                  </span>
                </div>

                <hr className="border-slate-100 dark:border-slate-800/80" />

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-slate-400">
                      Fuel Volume
                    </p>
                    <p className="font-medium mt-0.5">{log.liters} L</p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase font-semibold text-slate-400">
                      Date Registered
                    </p>
                    <p className="font-medium mt-0.5">
                      {new Date(log.date).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="col-span-2 pt-1">
                    <p className="text-[10px] uppercase font-semibold text-slate-400">
                      Linked Trip
                    </p>
                    <p className="font-medium mt-0.5 text-slate-800 dark:text-slate-200 truncate">
                      {log.trip
                        ? `${log.trip.source} → ${log.trip.destination}`
                        : 'None'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* LOG FUEL MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] p-6 text-slate-900 dark:text-white shadow-2xl my-auto transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold">Log Fuel Transaction</h3>
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
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Vehicle
                </label>
                <select
                  required
                  value={form.vehicleId}
                  onChange={(e) =>
                    setForm({ ...form, vehicleId: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-2.5 text-slate-900 dark:text-white outline-none focus:border-[#F5B301] transition-colors"
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.make} {v.model} [{v.licensePlate}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Liters (L)
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 45.5"
                    value={form.liters}
                    onChange={(e) =>
                      setForm({ ...form, liters: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-2.5 text-slate-900 dark:text-white outline-none focus:border-[#F5B301] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Total Cost (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 3500"
                    value={form.cost}
                    onChange={(e) =>
                      setForm({ ...form, cost: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-2.5 text-slate-900 dark:text-white outline-none focus:border-[#F5B301] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-2.5 text-slate-900 dark:text-white outline-none focus:border-[#F5B301] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Linked Trip ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Paste UUID if linking to trip"
                  value={form.tripId}
                  onChange={(e) =>
                    setForm({ ...form, tripId: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-2.5 text-slate-900 dark:text-white outline-none focus:border-[#F5B301] transition-colors"
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
                  Submit Log
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}