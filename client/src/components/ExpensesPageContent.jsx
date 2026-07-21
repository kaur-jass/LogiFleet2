import React, { useState, useEffect } from 'react';
import Card from './Card';
import Table from './Table';
import Button from './Button';
import API from '../api/axios';
import { getExpenses, createExpense } from '../services/expenseService';

export default function ExpensesPageContent() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [role, setRole] = useState('');

  const [form, setForm] = useState({
    vehicleId: '',
    type: 'TOLL',
    amount: '',
    date: new Date().toISOString().substring(0, 10),
    description: '',
  });

  const loadData = async () => {
    const userRole = localStorage.getItem('role') || '';
    setRole(userRole);

    if (userRole !== 'FLEET_MANAGER' && userRole !== 'FINANCIAL_ANALYST') {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await getExpenses();
      setExpenses(res.data?.expenses || []);
    } catch (err) {
      setError('Failed to fetch expenses database. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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
      await createExpense({
        vehicleId: form.vehicleId,
        type: form.type,
        amount: parseFloat(form.amount),
        date: new Date(form.date),
        description: form.description.trim() || null,
      });
      setShowModal(false);
      setForm({
        vehicleId: '',
        type: 'TOLL',
        amount: '',
        date: new Date().toISOString().substring(0, 10),
        description: '',
      });
      loadData();
    } catch (err) {
      alert(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to submit expense log');
    }
  };

  const columns = [
    { key: 'id', label: 'Expense ID', render: (row) => <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{row.id.substring(0, 8)}</span> },
    { key: 'vehicle', label: 'Vehicle', render: (row) => row.vehicle ? `${row.vehicle.name} [${row.vehicle.regNumber}]` : row.vehicleId.substring(0, 8) },
    { key: 'type', label: 'Type', render: (row) => <span className="font-semibold text-slate-900 dark:text-white">{row.type}</span> },
    { key: 'amount', label: 'Amount', render: (row) => <span className="font-medium text-[#B8860B] dark:text-[#F5B301]">₹{row.amount.toLocaleString()}</span> },
    { key: 'date', label: 'Date', render: (row) => new Date(row.date).toLocaleDateString() },
    { key: 'description', label: 'Description', render: (row) => row.description || 'None' }
  ];

  const canWrite = role === 'DRIVER' || role === 'FLEET_MANAGER' || role === 'FINANCIAL_ANALYST';
  const canRead = role === 'FLEET_MANAGER' || role === 'FINANCIAL_ANALYST';

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Expenses Database</h2>
        {canWrite && (
          <Button onClick={openLogModal}>Log Expense</Button>
        )}
      </div>

      {!canRead ? (
        <div className="rounded-2xl border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 p-5">
          <h3 className="text-sm font-bold text-amber-800 dark:text-amber-400">Access Restricted</h3>
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-300/80 leading-relaxed">
            Drivers and Safety Officers are not authorized to view the expenses registry due to database access control policies.
            {role === 'DRIVER' && (
              <span className="mt-2 block font-medium text-amber-800 dark:text-amber-300">
                However, you do have permissions to file logs. Click the "Log Expense" button above to submit Toll, Maintenance, or other travel expense reports.
              </span>
            )}
          </p>
        </div>
      ) : (
        <Card title="Expenses Log">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">Loading expenses...</div>
          ) : error ? (
            <div className="py-12 text-center text-xs text-rose-500 dark:text-rose-400">{error}</div>
          ) : expenses.length > 0 ? (
            <div className="overflow-x-auto">
              <Table columns={columns} data={expenses} />
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-500">No expenses logged yet.</div>
          )}
        </Card>
      )}

      {/* LOG EXPENSE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Log Expense Details</h3>
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
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Expense Type</label>
                  <select
                    required
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white focus:border-[#F5B301] focus:outline-none"
                  >
                    <option value="TOLL">Toll</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Amount (₹)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 1200"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
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
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Description</label>
                <textarea
                  placeholder="Details about the transaction..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="mt-1.5 h-20 w-full resize-none rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#F5B301] focus:outline-none"
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
                <Button type="submit">Submit Expense</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}