import React, { useState, useEffect } from 'react';
import Card from './Card';
import Table from './Table';
import Badge from './Badge';
import Button from './Button';
import API from '../api/axios';
import { getTrips, createTrip, dispatchTrip, completeTrip, cancelTrip } from '../services/tripService';
import { useSearchParams } from "react-router-dom";

const statusVariant = {
  DRAFT: 'info',
  DISPATCHED: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

export default function TripsPageContent() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [activeTripId, setActiveTripId] = useState(null);

  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);

  const [createForm, setCreateForm] = useState({
    source: '',
    destination: '',
    vehicleId: '',
    driverId: '',
    cargoWeight: '',
    plannedDistance: '',
    revenue: '',
  });

  const [completeForm, setCompleteForm] = useState({
    actualDistance: '',
    fuelConsumed: '',
    finalOdometer: '',
    revenue: '',
  });

  const [filterStatus, setFilterStatus] = useState('');
  const [role, setRole] = useState('');

  const [searchParams] = useSearchParams();
  const selectedTripId = searchParams.get("tripId");

  const loadTrips = async () => {
    setLoading(true);
    try {
      const res = await getTrips();
      const list = res.data?.trips || [];
      if (filterStatus) {
        setTrips(list.filter(t => t.status === filterStatus));
      } else {
        setTrips(list);
      }
    } catch (err) {
      setError('Failed to fetch trips. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedTripId || trips.length === 0) return;

    const row = document.getElementById(selectedTripId);

    if (row) {
      row.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      row.classList.add("ring-2", "ring-[#F5B301]");

      setTimeout(() => {
        row.classList.remove("ring-2", "ring-[#F5B301]");
      }, 3000);
    }
  }, [trips, selectedTripId]);

  useEffect(() => {
    loadTrips();
    setRole(localStorage.getItem('role') || '');
  }, [filterStatus]);

  const openCreateModal = async () => {
    try {
      const [driversRes, vehiclesRes] = await Promise.all([
        API.get('/drivers/available'),
        API.get('/vehicles/available')
      ]);
      setAvailableDrivers(driversRes.data?.data?.drivers || []);
      setAvailableVehicles(vehiclesRes.data?.data?.vehicles || []);
      setShowCreateModal(true);
    } catch (err) {
      alert('Failed to load available drivers and vehicles.');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTrip({
        ...createForm,
        cargoWeight: parseFloat(createForm.cargoWeight),
        plannedDistance: parseFloat(createForm.plannedDistance),
        revenue: createForm.revenue ? parseFloat(createForm.revenue) : 0,
      });
      setShowCreateModal(false);
      setCreateForm({
        source: '',
        destination: '',
        vehicleId: '',
        driverId: '',
        cargoWeight: '',
        plannedDistance: '',
        revenue: '',
      });
      loadTrips();
    } catch (err) {
      alert(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to create trip');
    }
  };

  const handleDispatchAction = async (id) => {
    if (!confirm('Are you sure you want to dispatch this trip?')) return;
    try {
      await dispatchTrip(id);
      loadTrips();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to dispatch trip');
    }
  };

  const handleCancelAction = async (id) => {
    if (!confirm('Are you sure you want to cancel this trip?')) return;
    try {
      await cancelTrip(id);
      loadTrips();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel trip');
    }
  };

  const openCompleteModal = (id) => {
    setActiveTripId(id);
    setCompleteForm({
      actualDistance: '',
      fuelConsumed: '',
      finalOdometer: '',
      revenue: '',
    });
    setShowCompleteModal(true);
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    try {
      await completeTrip(activeTripId, {
        actualDistance: parseFloat(completeForm.actualDistance),
        fuelConsumed: parseFloat(completeForm.fuelConsumed),
        finalOdometer: parseFloat(completeForm.finalOdometer),
        revenue: completeForm.revenue ? parseFloat(completeForm.revenue) : undefined,
      });
      setShowCompleteModal(false);
      loadTrips();
    } catch (err) {
      alert(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to complete trip');
    }
  };

  const columns = [
    { key: 'id', label: 'Trip ID', render: (row) => <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{row.id.substring(0, 8)}</span> },
    { key: 'route', label: 'Route', render: (row) => <span className="font-semibold text-slate-900 dark:text-white">{row.source} → {row.destination}</span> },
    { key: 'status', label: 'Status', render: (row) => <Badge variant={statusVariant[row.status] || 'neutral'}>{row.status}</Badge> },
    { key: 'vehicle', label: 'Vehicle', render: (row) => row.vehicle ? `${row.vehicle.name} [${row.vehicle.regNumber}]` : row.vehicleId.substring(0, 8) },
    { key: 'driver', label: 'Driver', render: (row) => row.driver ? row.driver.name : row.driverId.substring(0, 8) },
    { key: 'cargoWeight', label: 'Cargo', render: (row) => `${row.cargoWeight} kg` },
    { key: 'plannedDistance', label: 'Distance', render: (row) => `${row.plannedDistance} km` },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => {
        if (row.status === 'DRAFT') {
          return (
            <div className="flex flex-wrap gap-1.5">
              <Button onClick={() => handleDispatchAction(row.id)}>Dispatch</Button>
              <button
                onClick={() => handleCancelAction(row.id)}
                className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          );
        }
        if (row.status === 'DISPATCHED') {
          return (
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => openCompleteModal(row.id)}
                className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
              >
                Complete
              </button>
              <button
                onClick={() => handleCancelAction(row.id)}
                className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          );
        }
        return <span className="text-xs text-slate-400 dark:text-slate-500">None</span>;
      }
    }
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Trips Dashboard</h2>
        {(role === 'FLEET_MANAGER' || role === 'DRIVER') && (
          <Button onClick={openCreateModal}>Create New Trip</Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0b0f19] p-4 shadow-sm transition-colors">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Filter:</span>
        <div className="flex flex-wrap gap-2">
          {['', 'DRAFT', 'DISPATCHED', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition ${
                filterStatus === st
                  ? 'bg-[#F5B301] text-slate-950 shadow-sm'
                  : 'border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st || 'All'}
            </button>
          ))}
        </div>
      </div>

      <Card title="Trips List">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">Loading trips...</div>
        ) : error ? (
          <div className="py-12 text-center text-xs text-rose-500 dark:text-rose-400">{error}</div>
        ) : trips.length > 0 ? (
          <div className="w-full overflow-x-auto">
            <Table columns={columns} data={trips} />
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-500">No trips matched the filter status.</div>
        )}
      </Card>

      {/* CREATE TRIP MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] p-6 shadow-2xl transition-colors">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Create New Trip</h3>
            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Source</label>
                  <input
                    type="text"
                    required
                    placeholder="Source city"
                    value={createForm.source}
                    onChange={(e) => setCreateForm({ ...createForm, source: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#F5B301] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Destination</label>
                  <input
                    type="text"
                    required
                    placeholder="Destination city"
                    value={createForm.destination}
                    onChange={(e) => setCreateForm({ ...createForm, destination: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#F5B301] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Assign Driver</label>
                <select
                  required
                  value={createForm.driverId}
                  onChange={(e) => setCreateForm({ ...createForm, driverId: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white focus:border-[#F5B301] focus:outline-none"
                >
                  <option value="">Select an available driver</option>
                  {availableDrivers.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.licenseNumber})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Assign Vehicle</label>
                <select
                  required
                  value={createForm.vehicleId}
                  onChange={(e) => setCreateForm({ ...createForm, vehicleId: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white focus:border-[#F5B301] focus:outline-none"
                >
                  <option value="">Select an available vehicle</option>
                  {availableVehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.make} {v.model} [{v.licensePlate}]</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Cargo (kg)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 500"
                    value={createForm.cargoWeight}
                    onChange={(e) => setCreateForm({ ...createForm, cargoWeight: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#F5B301] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Planned (km)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 350"
                    value={createForm.plannedDistance}
                    onChange={(e) => setCreateForm({ ...createForm, plannedDistance: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#F5B301] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Revenue (₹)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 15000"
                    value={createForm.revenue}
                    onChange={(e) => setCreateForm({ ...createForm, revenue: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#F5B301] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <Button type="submit">Create Trip</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPLETE TRIP MODAL */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] p-6 shadow-2xl transition-colors">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Complete Dispatched Trip</h3>
            <form onSubmit={handleCompleteSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Actual Distance (km)</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 362"
                  value={completeForm.actualDistance}
                  onChange={(e) => setCompleteForm({ ...completeForm, actualDistance: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#F5B301] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Fuel Consumed (L)</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 42"
                  value={completeForm.fuelConsumed}
                  onChange={(e) => setCompleteForm({ ...completeForm, fuelConsumed: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#F5B301] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Final Odometer (km)</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 120500"
                  value={completeForm.finalOdometer}
                  onChange={(e) => setCompleteForm({ ...completeForm, finalOdometer: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#F5B301] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Final Revenue (₹) - Optional</label>
                <input
                  type="number"
                  step="any"
                  placeholder="Leave empty to keep planned revenue"
                  value={completeForm.revenue}
                  onChange={(e) => setCompleteForm({ ...completeForm, revenue: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#F5B301] focus:outline-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto rounded-xl border border-emerald-500/30 bg-emerald-500/20 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30 transition"
                >
                  Submit Completion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}