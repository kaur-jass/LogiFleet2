import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import Card from "./Card";
import Button from "./Button";
import ChartContainer from "./ChartContainer";
import Table from "./Table";
import Badge from "./Badge";
import { dashboardKpis } from "../services/mockData";
import { getDashboardKpis } from "../services/dashboardService";
import { getTrips } from "../services/tripService";
import { getFuelLogs } from "../services/fuelService";
import { getExpenses } from "../services/expenseService";
import { useTheme } from "../context/ThemeContext";

const statusVariant = {
  DRAFT: "info",
  DISPATCHED: "warning",
  COMPLETED: "success",
  CANCELLED: "danger",
};

const statusLabel = (status) => (
  <Badge variant={statusVariant[status] || "neutral"}>{status}</Badge>
);

const columns = [
  { key: "id", label: "Trip ID" },
  { key: "vehicleId", label: "Vehicle" },
  { key: "driverId", label: "Driver" },
  { key: "destination", label: "Destination" },
  { key: "status", label: "Status", render: (row) => statusLabel(row.status) },
  {
    key: "expectedRevenue",
    label: "Expected Revenue",
    render: (row) => `₹${row.expectedRevenue?.toLocaleString() || 0}`,
  },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0b0f19]/95 p-3 shadow-xl backdrop-blur-md">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</p>
        {payload.map((entry, index) => (
          <p
            key={`item-${index}`}
            className="mt-1 text-xs font-medium"
            style={{ color: entry.color || entry.fill }}
          >
            {entry.name}: {entry.value?.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPageContent() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const [kpis, setKpis] = useState(null);
  const [recentTrips, setRecentTrips] = useState([]);
  const [recentFuel, setRecentFuel] = useState([]);
  const [recentExp, setRecentExp] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");

  const chartData = useMemo(() => dashboardKpis.tripsPerMonth, []);
  const fuelData = useMemo(() => dashboardKpis.fuelConsumption, []);
  const expenseData = useMemo(() => dashboardKpis.expenseDistribution, []);
  const revenueData = useMemo(() => dashboardKpis.revenueExpense, []);

  const gridColor = isDarkMode ? "#1e293b" : "#e2e8f0";
  const axisColor = isDarkMode ? "#64748b" : "#94a3b8";

  const pieColors = [
    "#f5b301",
    "#d97706",
    "#fbbf24",
    "#fde68a",
  ];

  useEffect(() => {
    async function loadData() {
      try {
        const userRole = localStorage.getItem("role");
        setRole(userRole);

        const kpiRes = await getDashboardKpis();
        setKpis(kpiRes.data);

        const tripsRes = await getTrips();
        setRecentTrips(tripsRes.data?.slice(0, 5) || []);

        const fuelRes = await getFuelLogs();
        setRecentFuel(fuelRes.data?.slice(0, 5) || []);

        if (userRole === "FLEET_MANAGER" || userRole === "FINANCIAL_ANALYST") {
          const expRes = await getExpenses();
          setRecentExp(expRes.data?.slice(0, 5) || []);
        }
      } catch (err) {
        console.error("Dashboard loading error", err);
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-3 font-sans">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f5b301] border-t-transparent" />
        <p className="text-xs font-medium tracking-wide text-slate-500 dark:text-slate-400">
          Loading fleet dashboard...
        </p>
      </div>
    );
  }

  const totalVehicles =
    (kpis?.activeVehicles || 0) +
    (kpis?.availableVehicles || 0) +
    (kpis?.vehiclesInMaintenance || 0);

  return (
    <div className="space-y-6 font-sans pb-10">
      {/* Top KPI Cards Row 1 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card title="TOTAL VEHICLES" value={totalVehicles.toString()} />
        <Card title="ACTIVE TRIPS" value={(kpis?.activeTrips || 0).toString()} />
        <Card
          title="VEHICLES IN MAINTENANCE"
          value={(kpis?.vehiclesInMaintenance || 0).toString()}
        />
        <Card
          title="DRIVERS ON DUTY"
          value={(kpis?.driversOnDuty || 0).toString()}
        />
      </div>

      {/* KPI Cards Row 2 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card
          title="FLEET UTILIZATION"
          value={`${kpis?.fleetUtilizationPct || 0}%`}
        />
        <Card
          title="PENDING TRIPS"
          value={(kpis?.pendingTrips || 0).toString()}
        />
        <Card
          title="ACTIVE VEHICLES"
          value={(kpis?.activeVehicles || 0).toString()}
        />
      </div>

      {/* Charts Section 1 */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ChartContainer title="Trips per Month">
          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 12, right: 12, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f5b301" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#f5b301" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={gridColor}
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  stroke={axisColor}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  stroke={axisColor}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="trips"
                  name="Trips"
                  stroke="#f5b301"
                  fill="url(#colorTrips)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>

        <ChartContainer title="Fuel Consumption">
          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={fuelData}
                margin={{ top: 12, right: 12, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={gridColor}
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  stroke={axisColor}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  stroke={axisColor}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="liters"
                  name="Liters"
                  fill="#f5b301"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>

        <ChartContainer title="Expense Distribution">
          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseData}
                  dataKey="amount"
                  nameKey="category"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={5}
                  stroke="none"
                >
                  {expenseData.map((entry, index) => (
                    <Cell
                      key={entry.category}
                      fill={pieColors[index % pieColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>
      </div>

      {/* Charts & Quick Actions Row */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartContainer title="Revenue vs Expense">
            <div className="h-72 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={revenueData}
                  margin={{ top: 12, right: 12, left: -10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={gridColor}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    stroke={axisColor}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    stroke={axisColor}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#f5b301"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    name="Expense"
                    stroke="#0ea5e9"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartContainer>
        </div>

        {/* Quick Actions Panel */}
        <ChartContainer title="Quick Actions">
          <div className="flex h-full flex-col justify-center space-y-2.5 py-1">
            <Button
              className="w-full bg-[#f5b301] font-semibold text-slate-950 hover:bg-[#e0a200]"
              onClick={() => navigate("/drivers")}
            >
              Manage Drivers
            </Button>
            <Button
              className="w-full bg-[#f5b301] font-semibold text-slate-950 hover:bg-[#e0a200]"
              onClick={() => navigate("/vehicles")}
            >
              Manage Vehicles
            </Button>
            <Button
              className="w-full bg-[#f5b301] font-semibold text-slate-950 hover:bg-[#e0a200]"
              onClick={() => navigate("/trips")}
            >
              Manage Trips
            </Button>
            <Button
              className="w-full bg-[#f5b301] font-semibold text-slate-950 hover:bg-[#e0a200]"
              onClick={() => navigate("/maintenance")}
            >
              Schedule Maintenance
            </Button>
            <Button
              className="w-full bg-[#f5b301] font-semibold text-slate-950 hover:bg-[#e0a200]"
              onClick={() => navigate("/fuel")}
            >
              Add Fuel Log
            </Button>
            {(role === "FLEET_MANAGER" || role === "FINANCIAL_ANALYST") && (
              <Button
                className="w-full bg-[#f5b301] font-semibold text-slate-950 hover:bg-[#e0a200]"
                onClick={() => navigate("/expenses")}
              >
                Add Expense
              </Button>
            )}
            <Button
              className="w-full bg-[#f5b301] font-semibold text-slate-950 hover:bg-[#e0a200]"
              onClick={() => navigate("/reports")}
            >
              View Reports & ROI
            </Button>
          </div>
        </ChartContainer>
      </div>

      {/* Tables & Recent Logs */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2 overflow-x-auto">
          <Card title="Recent Trips">
            {recentTrips.length > 0 ? (
              <div className="mt-2 overflow-x-auto">
                <Table columns={columns} data={recentTrips} />
              </div>
            ) : (
              <div className="p-6 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
                No recent trips logged.
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Latest Fuel Logs">
            <div className="mt-3 space-y-2.5">
              {recentFuel.length > 0 ? (
                recentFuel.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#111827]/80 p-3.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 gap-1">
                      <span className="text-slate-700 dark:text-slate-300">
                        Vehicle: {log.vehicleId}
                      </span>
                      <span>{new Date(log.date).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-1.5 text-xs font-semibold text-slate-900 dark:text-slate-200">
                      Station: {log.station} · {log.liters}L ·{" "}
                      <span className="text-[#B8860B] dark:text-[#f5b301]">
                        ₹{log.cost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
                  No fuel logs recorded.
                </div>
              )}
            </div>
          </Card>

          {(role === "FLEET_MANAGER" || role === "FINANCIAL_ANALYST") && (
            <Card title="Latest Expenses">
              <div className="mt-3 space-y-2.5">
                {recentExp.length > 0 ? (
                  recentExp.map((expense) => (
                    <div
                      key={expense.id}
                      className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#111827]/80 p-3.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 gap-1">
                        <span className="text-slate-700 dark:text-slate-300">{expense.type}</span>
                        <span>
                          {new Date(expense.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-1.5 text-xs font-semibold text-slate-900 dark:text-slate-200">
                        Vehicle: {expense.vehicleId} ·{" "}
                        <span className="text-[#B8860B] dark:text-[#f5b301]">
                          ₹{expense.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
                    No recent expenses logged.
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}