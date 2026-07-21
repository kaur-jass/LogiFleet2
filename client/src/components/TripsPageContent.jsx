import React, { useState, useEffect } from "react";
import Card from "./Card";
import Table from "./Table";
import Badge from "./Badge";
import Button from "./Button";
import API from "../api/axios";
import {
  getTrips,
  createTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
} from "../services/tripService";
import { useSearchParams } from "react-router-dom";

const statusVariant = {
  DRAFT: "info",
  DISPATCHED: "warning",
  COMPLETED: "success",
  CANCELLED: "danger",
};

export default function TripsPageContent() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [activeTripId, setActiveTripId] = useState(null);

  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);

  const [createForm, setCreateForm] = useState({
    source: "",
    destination: "",
    vehicleId: "",
    driverId: "",
    cargoWeight: "",
    plannedDistance: "",
    revenue: "",
  });

  const [completeForm, setCompleteForm] = useState({
    actualDistance: "",
    fuelConsumed: "",
    finalOdometer: "",
    revenue: "",
  });

  const [filterStatus, setFilterStatus] = useState("");
  const [role, setRole] = useState("");

  const [searchParams] = useSearchParams();
  const selectedTripId = searchParams.get("tripId");

  const loadTrips = async () => {
    setLoading(true);
    try {
      const res = await getTrips();
      const list = res.data?.trips || [];
      if (filterStatus) {
        setTrips(list.filter((t) => t.status === filterStatus));
      } else {
        setTrips(list);
      }
    } catch (err) {
      setError("Failed to fetch trips. Please try again.");
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
    setRole(localStorage.getItem("role") || "");
  }, [filterStatus]);

  const openCreateModal = async () => {
    try {
      const [driversRes, vehiclesRes] = await Promise.all([
        API.get("/drivers/available"),
        API.get("/vehicles/available"),
      ]);
      setAvailableDrivers(driversRes.data?.data?.drivers || []);
      setAvailableVehicles(vehiclesRes.data?.data?.vehicles || []);
      setShowCreateModal(true);
    } catch (err) {
      alert("Failed to load available drivers and vehicles.");
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
        source: "",
        destination: "",
        vehicleId: "",
        driverId: "",
        cargoWeight: "",
        plannedDistance: "",
        revenue: "",
      });
      loadTrips();
    } catch (err) {
      alert(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          "Failed to create trip"
      );
    }
  };

  const handleDispatchAction = async (id) => {
    if (!confirm("Are you sure you want to dispatch this trip?")) return;
    try {
      await dispatchTrip(id);
      loadTrips();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to dispatch trip");
    }
  };

  const handleCancelAction = async (id) => {
    if (!confirm("Are you sure you want to cancel this trip?")) return;
    try {
      await cancelTrip(id);
      loadTrips();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel trip");
    }
  };

  const openCompleteModal = (id) => {
    setActiveTripId(id);
    setCompleteForm({
      actualDistance: "",
      fuelConsumed: "",
      finalOdometer: "",
      revenue: "",
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
        revenue: completeForm.revenue
          ? parseFloat(completeForm.revenue)
          : undefined,
      });
      setShowCompleteModal(false);
      loadTrips();
    } catch (err) {
      alert(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          "Failed to complete trip"
      );
    }
  };

  const renderActions = (row) => {
    if (row.status === "DRAFT") {
      return (
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => handleDispatchAction(row.id)}>Dispatch</Button>
          <button
            onClick={() => handleCancelAction(row.id)}
            className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors"
          >
            Cancel
          </button>
        </div>
      );
    }
    if (row.status === "DISPATCHED") {
      return (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => openCompleteModal(row.id)}
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
          >
            Complete
          </button>
          <button
            onClick={() => handleCancelAction(row.id)}
            className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors"
          >
            Cancel
          </button>
        </div>
      );
    }
    return <span className="text-xs text-slate-400 dark:text-slate-500">None</span>;
  };

  const columns = [
    {
      key: "id",
      label: "Trip ID",
      render: (row) => (
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
          {row.id ? row.id.substring(0, 8) : "-"}
        </span>
      ),
    },
    {
      key: "route",
      label: "Route",
      render: (row) => (
        <span className="font-semibold text-slate-900 dark:text-white">
          {row.source} → {row.destination}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <Badge variant={statusVariant[row.status] || "neutral"}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: "vehicle",
      label: "Vehicle",
      render: (row) =>
        row.vehicle
          ? `${row.vehicle.name} [${row.vehicle.regNumber}]`
          : row.vehicleId
          ? row.vehicleId.substring(0, 8)
          : "-",
    },
    {
      key: "driver",
      label: "Driver",
      render: (row) =>
        row.driver
          ? row.driver.name
          : row.driverId
          ? row.driverId.substring(0, 8)
          : "-",
    },
    { key: "cargoWeight", label: "Cargo", render: (row) => `${row.cargoWeight} kg` },
    { key: "plannedDistance", label: "Distance", render: (row) => `${row.plannedDistance} km` },
    {
      key: "actions",
      label: "Actions",
      render: renderActions,
    },
  ];

  return (
    <div className="w-full max-w-full overflow-x-hidden min-w-0 space-y-6 font-sans pb-10 px-4 md:px-6 lg:px-8">
      {/* Responsive Header Container */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Trips Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor, dispatch, and track active logistics trips
          </p>
        </div>
        {(role === "FLEET_MANAGER" || role === "DRIVER") && (
          <Button
            onClick={openCreateModal}
            className="w-full sm:w-auto bg-[#f5b301] text-slate-950 font-semibold hover:bg-[#e0a200] justify-center"
          >
            + Create New Trip
          </Button>
        )}
      </div>

      {/* Filter Status Pills - Horizontal Scroll on Narrow Viewports */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0b0f19] p-3.5 shadow-sm overflow-hidden">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0">
          Filter:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0 w-full">
          {["", "DRAFT", "DISPATCHED", "COMPLETED", "CANCELLED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === st
                  ? "bg-[#F5B301] text-slate-950 shadow-sm"
                  : "border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {st || "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19]">
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#f5b301] border-t-transparent" />
            <span>Loading trips...</span>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 text-center text-xs text-rose-500 dark:text-rose-400">
          {error}
        </div>
      ) : trips.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] p-8 text-center text-xs text-slate-500 dark:text-slate-400">
          No trips matched the filter status.
        </div>
      ) : (
        <>
          {/* Desktop & Laptop View (>= 1024px): Table with bounded horizontal scroll wrap */}
          <div className="hidden lg:block">
            <Card title="Trips List">
              <div className="w-full min-w-0 overflow-x-auto">
                <Table columns={columns} data={trips} />
              </div>
            </Card>
          </div>

          {/* Mobile & Tablet View (< 1024px): Responsive Trip Cards */}
          <div className="block lg:hidden space-y-3">
            {trips.map((trip) => (
              <div
                id={trip.id}
                key={trip.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] p-4 text-xs shadow-sm space-y-3 transition-all"
              >
                {/* Mobile Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                      {trip.source} → {trip.destination}
                    </h3>
                    <p className="font-mono text-[10px] text-slate-400 mt-0.5">
                      ID: {trip.id ? trip.id.substring(0, 8) : "-"}
                    </p>
                  </div>
                  <Badge variant={statusVariant[trip.status] || "neutral"}>
                    {trip.status}
                  </Badge>
                </div>

                <hr className="border-slate-100 dark:border-slate-800/80" />

                {/* Grid Details */}
                <div className="grid grid-cols-2 gap-3 text-slate-600 dark:text-slate-300">
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-slate-400">
                      Vehicle
                    </p>
                    <p className="font-medium mt-0.5 truncate">
                      {trip.vehicle
                        ? `${trip.vehicle.name} [${trip.vehicle.regNumber}]`
                        : trip.vehicleId
                        ? trip.vehicleId.substring(0, 8)
                        : "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase font-semibold text-slate-400">
                      Driver
                    </p>
                    <p className="font-medium mt-0.5 truncate">
                      {trip.driver
                        ? trip.driver.name
                        : trip.driverId
                        ? trip.driverId.substring(0, 8)
                        : "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase font-semibold text-slate-400">
                      Cargo
                    </p>
                    <p className="font-medium mt-0.5">{trip.cargoWeight} kg</p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase font-semibold text-slate-400">
                      Distance
                    </p>
                    <p className="font-medium mt-0.5">{trip.plannedDistance} km</p>
                  </div>
                </div>

                {/* Mobile Actions */}
                {(trip.status === "DRAFT" || trip.status === "DISPATCHED") && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <p className="text-[10px] uppercase font-semibold text-slate-400 mb-2">
                      Actions
                    </p>
                    {renderActions(trip)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* CREATE TRIP MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] p-5 sm:p-6 text-slate-900 dark:text-white shadow-2xl my-auto transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold">Create New Trip</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-200 text-lg leading-none p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Source
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Source city"
                    value={createForm.source}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, source: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-2.5 text-slate-900 dark:text-white outline-none focus:border-[#F5B301] transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Destination
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Destination city"
                    value={createForm.destination}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, destination: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-2.5 text-slate-900 dark:text-white outline-none focus:border-[#F5B301] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Assign Driver
                </label>
                <select
                  required
                  value={createForm.driverId}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, driverId: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-2.5 text-slate-900 dark:text-white outline-none focus:border-[#F5B301] transition-colors"
                >
                  <option value="">Select an available driver</option>
                  {availableDrivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.licenseNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Assign Vehicle
                </label>
                <select
                  required
                  value={createForm.vehicleId}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, vehicleId: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-2.5 text-slate-900 dark:text-white outline-none focus:border-[#F5B301] transition-colors"
                >
                  <option value="">Select an available vehicle</option>
                  {availableVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.make || v.name} {v.model} [{v.licensePlate || v.regNumber}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Cargo (kg)
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 500"
                    value={createForm.cargoWeight}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, cargoWeight: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-2.5 text-slate-900 dark:text-white outline-none focus:border-[#F5B301] transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Planned (km)
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 350"
                    value={createForm.plannedDistance}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        plannedDistance: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-2.5 text-slate-900 dark:text-white outline-none focus:border-[#F5B301] transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Revenue (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 15000"
                    value={createForm.revenue}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, revenue: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-2.5 text-slate-900 dark:text-white outline-none focus:border-[#F5B301] transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 font-medium transition-colors"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  className="w-full sm:w-auto bg-[#f5b301] text-slate-950 font-semibold hover:bg-[#e0a200] justify-center"
                >
                  Create Trip
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPLETE TRIP MODAL */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] p-5 sm:p-6 text-slate-900 dark:text-white shadow-2xl my-auto transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold">Complete Dispatched Trip</h3>
              <button
                type="button"
                onClick={() => setShowCompleteModal(false)}
                className="text-slate-400 hover:text-slate-200 text-lg leading-none p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Actual Distance (km)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 362"
                  value={completeForm.actualDistance}
                  onChange={(e) =>
                    setCompleteForm({
                      ...completeForm,
                      actualDistance: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-2.5 text-slate-900 dark:text-white outline-none focus:border-[#F5B301] transition-colors"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Fuel Consumed (L)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 42"
                  value={completeForm.fuelConsumed}
                  onChange={(e) =>
                    setCompleteForm({
                      ...completeForm,
                      fuelConsumed: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-2.5 text-slate-900 dark:text-white outline-none focus:border-[#F5B301] transition-colors"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Final Odometer (km)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 120500"
                  value={completeForm.finalOdometer}
                  onChange={(e) =>
                    setCompleteForm({
                      ...completeForm,
                      finalOdometer: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-2.5 text-slate-900 dark:text-white outline-none focus:border-[#F5B301] transition-colors"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Final Revenue (₹) - Optional
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="Leave empty to keep planned revenue"
                  value={completeForm.revenue}
                  onChange={(e) =>
                    setCompleteForm({ ...completeForm, revenue: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-2.5 text-slate-900 dark:text-white outline-none focus:border-[#F5B301] transition-colors"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto rounded-xl border border-emerald-500/30 bg-emerald-500/20 px-4 py-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30 transition-colors"
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