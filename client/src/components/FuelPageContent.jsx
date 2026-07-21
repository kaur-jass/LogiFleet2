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
      alert(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to log fuel log');
    }
  };

  const columns = [
    { key: 'id', label: 'Log ID', render: (row) => <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{row.id.substring(0, 8)}</span> },
    { key: 'vehicle', label: 'Vehicle', render: (row) => row.vehicle ? `${row.vehicle.name} [${row.vehicle.regNumber}]` : row.vehicleId.substring(0, 8) },
    { key: 'liters', label: 'Liters (L)', render: (row) => `${row.liters} L` },
    { key: 'cost', label: 'Cost', render: (row) => <span className="font-medium text-[#B8860B] dark:text-[#F5B301]">₹{row.cost.toLocaleString()}</span> },
    { key: 'date', label: 'Date Registered', render: (row) => new Date(row.date).toLocaleDateString() },
    { key: 'trip', label: 'Linked Trip', render: (row) => row.trip ? `${row.trip.source} → ${row.trip.destination}` : 'None' }
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Fuel Logs</h2>
        {(role === 'FLEET_MANAGER' || role === 'DRIVER') && (
          <Button onClick={openLogModal}>Log Fuel Fill</Button>
        )}
      </div>

      <Card title="Fuel Transaction Logs">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">Loading fuel logs...</div>
        ) : error ? (
          <div className="py-12 text-center text-xs text-rose-500 dark:text-rose-400">{error}</div>
        ) : fuelLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <Table columns={columns} data={fuelLogs} />
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-500">No fuel records logged yet.</div>
        )}
      </Card>

      {/* LOG FUEL MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Log Fuel Transaction</h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Vehicle</label>
                <select
                  required
                  value={form.vehicleId}
                  onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white focus:border-[#F5B301] focus:outline-none"
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.make} {v.model} [{v.licensePlate}]</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Liters (L)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 45.5"
                    value={form.liters}
                    onChange={(e) => setForm({ ...form, liters: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#F5B301] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Cost (₹)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 3500"
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#F5B301] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Date</label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white focus:border-[#F5B301] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Linked Trip ID (Optional)</label>
                <input
                  type="text"
                  placeholder="Paste UUID if linking to active/completed trip"
                  value={form.tripId}
                  onChange={(e) => setForm({ ...form, tripId: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#F5B301] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <Button type="submit">Submit Log</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}