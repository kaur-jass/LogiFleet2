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
  {
    key: "id",
    label: "Trip ID",
    render: (row) =>
      row.id ? (row.id.length > 8 ? `${row.id.slice(0, 8)}...` : row.id) : "-",
  },
  {
    key: "vehicle",
    label: "Vehicle",
    render: (row) =>
      row.vehicle
        ? `${row.vehicle.name} (${row.vehicle.regNumber})`
        : "-",
  },
  {
    key: "driver",
    label: "Driver",
    render: (row) => row.driver?.name || "-",
  },
  { key: "destination", label: "Destination" },
  { key: "status", label: "Status", render: (row) => statusLabel(row.status) },
  {
    key: "revenue",
    label: "Revenue",
    render: (row) => `₹${(row.revenue || 0).toLocaleString()}`,
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

  const chartData = useMemo(() => kpis?.tripsPerMonth || [], [kpis]);
  const fuelData = useMemo(() => kpis?.fuelPerMonth || [], [kpis]);
  const expenseData = useMemo(() => kpis?.expenseDistribution || [], [kpis]);
  const revenueData = useMemo(() => kpis?.revenueExpense || [], [kpis]);

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

        // Slice set to 6 items to balance column height
        const tripsRes = await getTrips();
        setRecentTrips((tripsRes.data?.trips || []).slice(0, 6));

        const fuelRes = await getFuelLogs();
        setRecentFuel((fuelRes.data?.logs || []).slice(0, 5));

        if (userRole === "FLEET_MANAGER" || userRole === "FINANCIAL_ANALYST") {
          const expRes = await getExpenses();
          setRecentExp((expRes.data?.expenses || []).slice(0, 5));
        }
      } catch (err) {
        console.error("Dashboard loading error", err);
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, []);

  // Compute live analytical aggregations from backend data
  const totalRevenue = useMemo(
    () => revenueData.reduce((sum, item) => sum + (item.revenue || 0), 0),
    [revenueData]
  );

  const totalExpense = useMemo(
    () => revenueData.reduce((sum, item) => sum + (item.expense || 0), 0),
    [revenueData]
  );

  const totalFuel = useMemo(
    () => fuelData.reduce((sum, item) => sum + (item.fuel || 0), 0),
    [fuelData]
  );

  const topExpenseCategory = useMemo(() => {
    if (!expenseData || expenseData.length === 0) return "N/A";
    const top = expenseData.reduce(
      (max, item) => (item.amount > max.amount ? item : max),
      expenseData[0]
    );
    return top.category || "N/A";
  }, [expenseData]);

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
    kpis?.totalVehicles ??
    ((kpis?.activeVehicles || 0) +
      (kpis?.availableVehicles || 0) +
      (kpis?.vehiclesInMaintenance || 0) +
      (kpis?.retiredVehicles || 0));

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
                  dataKey="fuel"
                  name="Fuel (L)"
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
            {(role === "FLEET_MANAGER" || role === "ADMIN" || !role) && (
              <>
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
              </>
            )}

            {(role === "FLEET_MANAGER" || role === "DRIVER" || role === "ADMIN" || !role) && (
              <Button
                className="w-full bg-[#f5b301] font-semibold text-slate-950 hover:bg-[#e0a200]"
                onClick={() => navigate("/trips")}
              >
                Manage Trips
              </Button>
            )}

            {(role === "FLEET_MANAGER" || role === "ADMIN" || !role) && (
              <Button
                className="w-full bg-[#f5b301] font-semibold text-slate-950 hover:bg-[#e0a200]"
                onClick={() => navigate("/maintenance")}
              >
                Schedule Maintenance
              </Button>
            )}

            <Button
              className="w-full bg-[#f5b301] font-semibold text-slate-950 hover:bg-[#e0a200]"
              onClick={() => navigate("/fuel")}
            >
              Add Fuel Log
            </Button>

            {(role === "FLEET_MANAGER" || role === "FINANCIAL_ANALYST" || role === "ADMIN") && (
              <Button
                className="w-full bg-[#f5b301] font-semibold text-slate-950 hover:bg-[#e0a200]"
                onClick={() => navigate("/expenses")}
              >
                Add Expense
              </Button>
            )}

            {(role === "FLEET_MANAGER" || role === "FINANCIAL_ANALYST" || role === "ADMIN" || !role) && (
              <Button
                className="w-full bg-[#f5b301] font-semibold text-slate-950 hover:bg-[#e0a200]"
                onClick={() => navigate("/reports")}
              >
                View Reports & ROI
              </Button>
            )}
          </div>
        </ChartContainer>
      </div>

      {/* Dashboard Lower Grid Section */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* 1. Recent Trips */}
        <div className="xl:col-span-2">
          <Card title="Recent Trips">
            {recentTrips.length > 0 ? (
              <div className="mt-2 w-full overflow-x-auto">
                <Table columns={columns} data={recentTrips} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
                <span className="text-2xl mb-1">📦</span>
                <span>No recent trips logged</span>
              </div>
            )}
          </Card>
        </div>

        {/* 2. Fuel Logs & Expenses (Stacked after Recent Trips on Mobile; Right Column on Desktop) */}
        <div className="space-y-4 xl:col-start-3 xl:row-start-1 xl:row-span-3">
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
                        Vehicle: {log.vehicle ? `${log.vehicle.name} (${log.vehicle.regNumber})` : "-"}
                      </span>
                      <span>{new Date(log.date).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-1.5 text-xs font-semibold text-slate-900 dark:text-slate-200">
                      {log.liters} L •{" "}
                      <span className="text-[#B8860B] dark:text-[#f5b301]">
                        ₹{log.cost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span className="text-2xl mb-1">⛽</span>
                  <span>No fuel logs recorded</span>
                </div>
              )}
            </div>
          </Card>

          {(role === "FLEET_MANAGER" || role === "FINANCIAL_ANALYST" || role === "ADMIN") && (
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
                        Vehicle: {expense.vehicle ? `${expense.vehicle.name} (${expense.vehicle.regNumber})` : "-"} •{" "}
                        <span className="text-[#B8860B] dark:text-[#f5b301]">
                          ₹{expense.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
                    <span className="text-2xl mb-1">💳</span>
                    <span>No recent expenses logged</span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* 3. Fleet Insights (Comes after Fuel Logs/Expenses on Mobile) */}
        <div className="xl:col-span-2">
          <Card
            title={
              <div className="flex items-center justify-between w-full">
                <span>Fleet Insights</span>
                <span className="text-[10px] font-normal uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 rounded-full">
                  Live analytics • Updated just now
                </span>
              </div>
            }
          >
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#111827]/80 p-5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/50">
                <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                  Fleet Utilization
                </p>
                <p className="mt-2 text-2xl font-bold text-[#B8860B] dark:text-[#f5b301]">
                  {kpis?.fleetUtilizationPct || 0}%
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#111827]/80 p-5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/50">
                <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                  Active Trips
                </p>
                <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {kpis?.activeTrips || 0}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#111827]/80 p-5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/50">
                <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                  Total Fuel Used
                </p>
                <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {totalFuel.toLocaleString()} L
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#111827]/80 p-5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/50">
                <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                  Revenue
                </p>
                <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  ₹{totalRevenue.toLocaleString()}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#111827]/80 p-5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/50">
                <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                  Expenses
                </p>
                <p className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">
                  ₹{totalExpense.toLocaleString()}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#111827]/80 p-5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/50">
                <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                  Top Expense
                </p>
                <p className="mt-2 text-xl font-bold text-slate-800 dark:text-slate-100 truncate">
                  {topExpenseCategory}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* 4. System Status & Operations (Very last item on Mobile) */}
        <div className="xl:col-span-2">
          <Card
            title={
              <div className="flex items-center justify-between w-full">
                <span>System Status & Operations</span>
                <span className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  All Systems Operational
                </span>
              </div>
            }
          >
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pb-1">
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#111827]/80 p-4 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/50">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Database Connection</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Connected to PostgreSQL</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#111827]/80 p-4 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/50">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Backend Services</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Operational</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#111827]/80 p-4 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/50">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Authentication</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">JWT Active</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}