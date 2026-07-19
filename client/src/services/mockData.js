export const dashboardKpis = {
  totalTrips: 13124,
  activeTrips: 128,
  fuelCost: 21450,
  maintenanceCost: 8420,
  totalExpenses: 29870,
  revenue: 174500,
  vehicleRoi: '12.3%',
  tripsPerMonth: [
    { month: 'Jan', trips: 1050 },
    { month: 'Feb', trips: 1180 },
    { month: 'Mar', trips: 1230 },
    { month: 'Apr', trips: 1320 },
    { month: 'May', trips: 1470 },
    { month: 'Jun', trips: 1510 },
    { month: 'Jul', trips: 1630 },
    { month: 'Aug', trips: 1720 },
    { month: 'Sep', trips: 1690 },
    { month: 'Oct', trips: 1780 },
    { month: 'Nov', trips: 1830 },
    { month: 'Dec', trips: 1890 },
  ],
  fuelConsumption: [
    { month: 'Jan', liters: 820 },
    { month: 'Feb', liters: 760 },
    { month: 'Mar', liters: 780 },
    { month: 'Apr', liters: 720 },
    { month: 'May', liters: 690 },
    { month: 'Jun', liters: 660 },
    { month: 'Jul', liters: 640 },
    { month: 'Aug', liters: 620 },
    { month: 'Sep', liters: 610 },
    { month: 'Oct', liters: 600 },
    { month: 'Nov', liters: 590 },
    { month: 'Dec', liters: 580 },
  ],
  expenseDistribution: [
    { category: 'Fuel', amount: 21450 },
    { category: 'Maintenance', amount: 8420 },
    { category: 'Tolls', amount: 4300 },
    { category: 'Other', amount: 1700 },
  ],
  revenueExpense: [
    { month: 'Jan', revenue: 13500, expense: 10200 },
    { month: 'Feb', revenue: 14200, expense: 10600 },
    { month: 'Mar', revenue: 14800, expense: 10950 },
    { month: 'Apr', revenue: 15600, expense: 11320 },
    { month: 'May', revenue: 16200, expense: 11780 },
    { month: 'Jun', revenue: 16900, expense: 12390 },
    { month: 'Jul', revenue: 17500, expense: 12860 },
    { month: 'Aug', revenue: 18200, expense: 13370 },
    { month: 'Sep', revenue: 17800, expense: 13040 },
    { month: 'Oct', revenue: 18600, expense: 13580 },
    { month: 'Nov', revenue: 19200, expense: 14020 },
    { month: 'Dec', revenue: 19900, expense: 14500 },
  ],
};

export const recentTrips = [
  { id: 'TR-1001', vehicle: 'VT-321', driver: 'Mia', destination: 'Mumbai', status: 'On Trip', revenue: 4800 },
  { id: 'TR-1002', vehicle: 'VT-114', driver: 'Noah', destination: 'Delhi', status: 'Completed', revenue: 3800 },
  { id: 'TR-1003', vehicle: 'VT-405', driver: 'Liam', destination: 'Bengaluru', status: 'Scheduled', revenue: 4400 },
  { id: 'TR-1004', vehicle: 'VT-233', driver: 'Emma', destination: 'Chennai', status: 'Cancelled', revenue: 0 },
];

export const fuelLogs = [
  { id: 'FL-448', vehicle: 'VT-321', station: 'Shell', liters: 45, cost: 3200, date: '2026-07-11' },
  { id: 'FL-449', vehicle: 'VT-114', station: 'BP', liters: 38, cost: 2700, date: '2026-07-10' },
  { id: 'FL-450', vehicle: 'VT-405', station: 'IndianOil', liters: 52, cost: 3600, date: '2026-07-09' },
];

export const recentExpenses = [
  { id: 'EX-112', vehicle: 'VT-321', type: 'Maintenance', amount: 1850, date: '2026-07-08' },
  { id: 'EX-113', vehicle: 'VT-114', type: 'Repair', amount: 1250, date: '2026-07-07' },
  { id: 'EX-114', vehicle: 'VT-233', type: 'Toll', amount: 420, date: '2026-07-06' },
];
