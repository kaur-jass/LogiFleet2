import React, { useState, useEffect } from 'react';
import Card from './Card';
import Table from './Table';
import Button from './Button';
import API from '../api/axios';
import { getFleetSummary, getVehicleReport } from '../services/reportService';
import { X } from "lucide-react";

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
      setVehicleDetail(res.data);
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
      link.setAttribute(
        'download',
        `${scope}_report_${new Date().toISOString().substring(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert('Failed to download CSV report. Please try again.');
    }
  };

  const columns = [
    {
      key: 'licensePlate',
      label: 'License Plate',
      render: (row) => (
        <span className="font-mono font-semibold text-slate-900 dark:text-white">
          {row.regNumber}
        </span>
      ),
    },
    {
      key: 'makeModel',
      label: 'Vehicle Details',
      render: (row) => `${row.name} ${row.model}`,
    },
    {
      key: 'totalTrips',
      label: 'Trips Run',
      render: (row) => row.totalTrips,
    },
    {
      key: 'totalDistance',
      label: 'Distance',
      render: (row) => `${row.totalDistance ? row.totalDistance.toLocaleString() : 0} km`,
    },
    {
      key: 'fuelEfficiency',
      label: 'Fuel Efficiency',
      render: (row) => `${row.fuelEfficiency ? row.fuelEfficiency.toFixed(2) : '0.00'} km/L`,
    },
    {
      key: 'roi',
      label: 'ROI',
      render: (row) => (
        <span
          className={
            row.roi >= 0
              ? 'font-semibold text-emerald-600 dark:text-emerald-400'
              : 'font-semibold text-rose-600 dark:text-rose-400'
          }
        >
          {(row.roi * 100).toFixed(2)}%
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button
            onClick={() => loadVehicleDetail(row.vehicleId)}
            className="bg-[#f5b301] text-slate-950 font-semibold hover:bg-[#e0a200] text-xs py-1.5 px-3"
          >
            View Metrics
          </Button>
          <button
            onClick={() => handleDownloadCsv('vehicle', row.vehicleId)}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            CSV
          </button>
        </div>
      ),
    },
  ];

  const isAuthorized = role === 'FLEET_MANAGER' || role === 'FINANCIAL_ANALYST';

  return (
    <div className="w-full max-w-full min-w-0 space-y-6 font-sans pb-10 px-3 sm:px-6">
      {/* Header Container */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Reports & ROI Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor vehicle profitability, ROI stats, and download CSV reports
          </p>
        </div>
        {isAuthorized && (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              onClick={() => handleDownloadCsv('trips')}
              className="w-full sm:w-auto bg-[#f5b301] text-slate-950 font-semibold hover:bg-[#e0a200]"
            >
              Export Trips CSV
            </Button>
            <button
              onClick={() => handleDownloadCsv('fleet')}
              className="w-full sm:w-auto rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Export Fleet CSV
            </button>
          </div>
        )}
      </div>

      {/* Access Restriction Box */}
      {!isAuthorized ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/20 p-5">
          <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400">
            Access Restricted
          </h3>
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-300/80 leading-relaxed">
            Only Fleet Managers and Financial Analysts are authorized to access reports, single vehicle efficiency summaries, and ROI exports.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-3">
          
          {/* Vehicle Inspection Metrics Card (Placed FIRST on Mobile using order-1, side panel on desktop via xl:order-2) */}
          <div className="order-1 xl:order-2 space-y-6">
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wide text-[#f5b301]">
                  Vehicle Inspection Details
                </h3>

                {vehicleDetail && (
                  <button
                    onClick={() => {
                      setVehicleDetail(null);
                      setSelectedVehicle(null);
                    }}
                    title="Clear Selection"
                    aria-label="Clear Selection"
                    className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              {loadingDetail ? (
                <div className="flex h-36 items-center justify-center">
                  <div className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#f5b301] border-t-transparent" />
                    <span>Loading metrics...</span>
                  </div>
                </div>
              ) : vehicleDetail ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Vehicle Selected
                    </h4>
                    <p className="mt-0.5 text-base font-bold text-slate-900 dark:text-white">
                      {vehicleDetail.make} {vehicleDetail.model} ({vehicleDetail.licensePlate})
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 p-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        ROI Rating
                      </span>
                      <p
                        className={`mt-1 text-base font-bold ${
                          vehicleDetail.roi >= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {(vehicleDetail.roi * 100).toFixed(2)}%
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 p-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Utilization
                      </span>
                      <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                        {vehicleDetail.utilizationPct
                          ? vehicleDetail.utilizationPct.toFixed(1)
                          : '0.0'}
                        %
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5 border-t border-slate-200 dark:border-slate-800/80 pt-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">
                        Total Run Distance:
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {vehicleDetail.totalDistance
                          ? vehicleDetail.totalDistance.toLocaleString()
                          : 0}{' '}
                        km
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">
                        Fuel Consumed:
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {vehicleDetail.totalFuelConsumed || 0} L
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">
                        Total Expenses:
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        ₹
                        {(
                          (vehicleDetail.totalFuelCost || 0) +
                          (vehicleDetail.totalExpenseCost || 0)
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">
                        Total Revenue:
                      </span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        ₹
                        {vehicleDetail.totalRevenue
                          ? vehicleDetail.totalRevenue.toLocaleString()
                          : 0}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() =>
                        handleDownloadCsv('vehicle', vehicleDetail.vehicleId)
                      }
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      Download CSV Metrics
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                  Select "View Metrics" on a vehicle card below to inspect ROI and operational statistics here.
                </div>
              )}
            </Card>
          </div>

          {/* Main Summaries Section (Placed SECOND on Mobile using order-2, left side on desktop via xl:order-1) */}
          <div className="order-2 xl:order-1 xl:col-span-2 space-y-6">
            {loading ? (
              <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19]">
                <div className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#f5b301] border-t-transparent" />
                  <span>Loading reports...</span>
                </div>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 text-center text-xs text-rose-500 dark:text-rose-400">
                {error}
              </div>
            ) : summary.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                No vehicle data available to generate reports.
              </div>
            ) : (
              <>
                {/* Desktop & Tablet View (>= 640px): Table inside Card */}
                <div className="hidden sm:block">
                  <Card title="Vehicle Performance Summaries">
                    <div className="w-full min-w-0 overflow-hidden">
                      <Table columns={columns} data={summary} />
                    </div>
                  </Card>
                </div>

                {/* Mobile View (< 640px): Mobile Vehicle Cards */}
                <div className="block sm:hidden space-y-3">
                  {summary.map((row) => (
                    <div
                      key={row.vehicleId}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] p-4 text-xs shadow-sm space-y-3"
                    >
                      {/* Mobile Header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            {row.name} {row.model}
                          </h3>
                          <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {row.regNumber}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase font-semibold text-slate-400">
                            ROI
                          </p>
                          <span
                            className={
                              row.roi >= 0
                                ? 'font-bold text-sm text-emerald-600 dark:text-emerald-400'
                                : 'font-bold text-sm text-rose-600 dark:text-rose-400'
                            }
                          >
                            {(row.roi * 100).toFixed(2)}%
                          </span>
                        </div>
                      </div>

                      <hr className="border-slate-100 dark:border-slate-800/80" />

                      {/* Details Grid */}
                      <div className="grid grid-cols-3 gap-2 text-slate-600 dark:text-slate-300">
                        <div>
                          <p className="text-[10px] uppercase font-semibold text-slate-400">
                            Trips
                          </p>
                          <p className="font-medium mt-0.5">{row.totalTrips}</p>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase font-semibold text-slate-400">
                            Distance
                          </p>
                          <p className="font-medium mt-0.5">
                            {row.totalDistance ? row.totalDistance.toLocaleString() : 0} km
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase font-semibold text-slate-400">
                            Efficiency
                          </p>
                          <p className="font-medium mt-0.5">
                            {row.fuelEfficiency ? row.fuelEfficiency.toFixed(2) : '0.00'} km/L
                          </p>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-2 flex gap-2">
                        <Button
                          onClick={() => loadVehicleDetail(row.vehicleId)}
                          className="flex-1 bg-[#f5b301] text-slate-950 font-semibold hover:bg-[#e0a200] text-xs py-2"
                        >
                          View Metrics
                        </Button>
                        <button
                          onClick={() => handleDownloadCsv('vehicle', row.vehicleId)}
                          className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                        >
                          CSV
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

        </div>
      )}
    </div>
  );
}