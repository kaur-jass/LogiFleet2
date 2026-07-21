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
      alert(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          'Failed to submit expense log'
      );
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'Expense ID',
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
      key: 'type',
      label: 'Type',
      render: (row) => (
        <span className="font-semibold text-slate-900 dark:text-white">
          {row.type}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (row) => (
        <span className="font-medium text-[#B8860B] dark:text-[#F5B301]">
          ₹{row.amount ? row.amount.toLocaleString() : 0}
        </span>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      render: (row) => new Date(row.date).toLocaleDateString(),
    },
    {
      key: 'description',
      label: 'Description',
      render: (row) => row.description || 'None',
    },
  ];

  const canWrite =
    role === 'DRIVER' ||
    role === 'FLEET_MANAGER' ||
    role === 'FINANCIAL_ANALYST';
  const canRead = role === 'FLEET_MANAGER' || role === 'FINANCIAL_ANALYST';

  return (
    <div className="w-full max-w-full min-w-0 space-y-6 font-sans pb-10 px-3 sm:px-6">
      {/* Header Container */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Expenses Database
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Log and review operational fleet expenditures
          </p>
        </div>
        {canWrite && (
          <Button
            onClick={openLogModal}
            className="w-full sm:w-auto bg-[#f5b301] text-slate-950 font-semibold hover:bg-[#e0a200]"
          >
            + Log Expense
          </Button>
        )}
      </div>

      {/* Access Restriction Box */}
      {!canRead ? (
        <div className="rounded-2xl border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 p-5">
          <h3 className="text-sm font-bold text-amber-800 dark:text-amber-400">
            Access Restricted
          </h3>
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-300/80 leading-relaxed">
            Drivers and Safety Officers are not authorized to view the expenses registry due to database access control policies.
            {role === 'DRIVER' && (
              <span className="mt-2 block font-medium text-amber-800 dark:text-amber-300">
                However, you do have permissions to file logs. Click the "Log Expense" button above to submit Toll, Maintenance, or other travel expense reports.
              </span>
            )}
          </p>
        </div>
      ) : loading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19]">
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#f5b301] border-t-transparent" />
            <span>Loading expenses...</span>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 text-center text-xs text-rose-500 dark:text-rose-400">
          {error}
        </div>
      ) : expenses.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] p-8 text-center text-xs text-slate-500 dark:text-slate-400">
          No expenses logged yet.
        </div>
      ) : (
        <>
          {/* Desktop & Tablet View (>= 640px): Table inside Card */}
          <div className="hidden sm:block">
            <Card title="Expenses Log">
              <div className="w-full min-w-0 overflow-hidden">
                <Table columns={columns} data={expenses} />
              </div>
            </Card>
          </div>

          {/* Mobile View (< 640px): Responsive Expense Cards */}
          <div className="block sm:hidden space-y-3">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] p-4 text-xs shadow-sm space-y-3"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {expense.vehicle
                        ? `${expense.vehicle.name} [${expense.vehicle.regNumber}]`
                        : expense.vehicleId
                        ? expense.vehicleId.substring(0, 8)
                        : 'Unknown Vehicle'}
                    </h3>
                    <p className="font-mono text-[10px] text-slate-400 mt-0.5">
                      Expense ID: {expense.id ? expense.id.substring(0, 8) : '-'}
                    </p>
                  </div>
                  <span className="font-bold text-sm text-[#B8860B] dark:text-[#F5B301]">
                    ₹{expense.amount ? expense.amount.toLocaleString() : 0}
                  </span>
                </div>

                <hr className="border-slate-100 dark:border-slate-800/80" />

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-slate-400">
                      Expense Type
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                      {expense.type}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase font-semibold text-slate-400">
                      Date
                    </p>
                    <p className="font-medium mt-0.5">
                      {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="col-span-2 pt-1">
                    <p className="text-[10px] uppercase font-semibold text-slate-400">
                      Description
                    </p>
                    <p className="font-medium mt-0.5 text-slate-800 dark:text-slate-200">
                      {expense.description || 'None'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* LOG EXPENSE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] p-6 text-slate-900 dark:text-white shadow-2xl my-auto transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold">Log Expense Details</h3>
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
                    Expense Type
                  </label>
                  <select
                    required
                    value={form.type}
                    onChange={(e) =>
                      setForm({ ...form, type: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-2.5 text-slate-900 dark:text-white outline-none focus:border-[#F5B301] transition-colors"
                  >
                    <option value="TOLL">Toll</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 1200"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
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
                  Description
                </label>
                <textarea
                  placeholder="Details about the transaction..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="h-20 w-full resize-none rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-2.5 text-slate-900 dark:text-white outline-none focus:border-[#F5B301] transition-colors"
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
                  Submit Expense
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}