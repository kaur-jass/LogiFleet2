import React, { useState, useEffect } from 'react';
import Card from './Card';
import Table from './Table';
import Button from './Button';
import API from '../api/axios';
import { getFleetSummary, getVehicleReport } from '../services/reportService';

export default function ReportsPageContent() {
  const [summary, setSummary] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleDetail, setVehicleDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState('');

  const loadSummary = async () => {
    const userRole = localStorage.getItem('role') || '';
    setRole(userRole);

    if (userRole !== 'FLEET_MANAGER' && userRole !== 'FINANCIAL_ANALYST') {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await getFleetSummary();
      setSummary(res.data?.vehicles || []);
    } catch (err) {
      setError('Failed to fetch fleet report summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const loadVehicleDetail = async (id) => {
    setLoadingDetail(true);
    try {
      const res = await getVehicleReport(id);
      setVehicleDetail(res.data?.data);
      setSelectedVehicle(id);
    } catch (err) {
      alert('Failed to load vehicle report details.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDownloadCsv = async (scope, id = '') => {
    try {
      const response = await API.get('/reports/export.csv', {
        params: { scope, id: id || undefined },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${scope}_report_${new Date().toISOString().substring(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert('Failed to download CSV report. Please try again.');
    }
  };

  const columns = [
    { key: 'licensePlate', label: 'License Plate', render: (row) => <span className="font-mono font-semibold text-white">{row.regNumber}</span> },
    { key: 'makeModel', label: 'Vehicle Details', render: (row) => `${row.name} ${row.model}` },
    { key: 'totalTrips', label: 'Trips Run', render: (row) => row.totalTrips },
    { key: 'totalDistance', label: 'Distance', render: (row) => `${row.totalDistance.toLocaleString()} km` },
    { key: 'fuelEfficiency', label: 'Fuel Efficiency', render: (row) => `${row.fuelEfficiency.toFixed(2)} km/L` },
    { key: 'roi', label: 'ROI', render: (row) => <span className={row.roi >= 0 ? 'font-semibold text-emerald-400' : 'font-semibold text-rose-400'}>{(row.roi * 100).toFixed(2)}%</span> },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button onClick={() => loadVehicleDetail(row.vehicleId)}>View Metrics</Button>
          <button
            onClick={() => handleDownloadCsv('vehicle', row.vehicleId)}
            className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
          >
            CSV
          </button>
        </div>
      )
    }
  ];

  const isAuthorized = role === 'FLEET_MANAGER' || role === 'FINANCIAL_ANALYST';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold tracking-tight text-white">Reports & ROI Analytics</h2>
        {isAuthorized && (
          <div className="flex gap-2">
            <Button onClick={() => handleDownloadCsv('trips')}>Export Trips CSV</Button>
            <button
              onClick={() => handleDownloadCsv('fleet')}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
            >
              Export Fleet CSV
            </button>
          </div>
        )}
      </div>

      {!isAuthorized ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5">
          <h3 className="text-sm font-bold text-amber-400">Access Restricted</h3>
          <p className="mt-1 text-xs text-amber-300/80">
            Only Fleet Managers and Financial Analysts are authorized to access reports, single vehicle efficiency summaries, and ROI exports.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <Card title="Vehicle Summaries">
              {loading ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading reports...</div>
              ) : error ? (
                <div className="py-12 text-center text-xs text-rose-400">{error}</div>
              ) : summary.length > 0 ? (
                <Table columns={columns} data={summary} />
              ) : (
                <div className="py-12 text-center text-xs text-slate-500">No vehicle data available to generate reports.</div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Vehicle Inspection Details">
              {loadingDetail ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading metrics...</div>
              ) : vehicleDetail ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vehicle Selected</h4>
                    <p className="mt-0.5 text-base font-bold text-white">
                      {vehicleDetail.make} {vehicleDetail.model} ({vehicleDetail.licensePlate})
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">ROI Rating</span>
                      <p className={`mt-1 text-base font-bold ${vehicleDetail.roi >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {(vehicleDetail.roi * 100).toFixed(2)}%
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Utilization</span>
                      <p className="mt-1 text-base font-bold text-white">
                        {vehicleDetail.utilizationPct.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5 border-t border-slate-800/80 pt-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Run Distance:</span>
                      <span className="font-semibold text-white">{vehicleDetail.totalDistance.toLocaleString()} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Fuel Consumed:</span>
                      <span className="font-semibold text-white">{vehicleDetail.totalFuelConsumed} L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Expenses:</span>
                      <span className="font-semibold text-white">₹{(vehicleDetail.totalFuelCost + vehicleDetail.totalExpenseCost).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Revenue:</span>
                      <span className="font-semibold text-emerald-400">₹{vehicleDetail.totalRevenue.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => handleDownloadCsv('vehicle', vehicleDetail.vehicleId)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
                    >
                      Download CSV Metrics
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-500">
                  Select "View Metrics" on a vehicle row to inspect ROI and operational statistics here.
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}