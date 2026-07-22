import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UserRound,
  CarFront,
  Truck,
  Wrench,
  Droplet,
  Wallet,
  BarChart3,
  LogOut,
  X,
} from "lucide-react";
import logo from "../assets/logo.png";
import { useTheme } from "../context/ThemeContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/drivers", label: "Drivers", icon: UserRound },
  { to: "/vehicles", label: "Vehicles", icon: CarFront },
  { to: "/trips", label: "Trips", icon: Truck },
  { to: "/maintenance", label: "Maintenance", icon: Wrench },
  { to: "/fuel", label: "Fuel Logs", icon: Droplet },
  { to: "/expenses", label: "Expenses", icon: Wallet },
  { to: "/reports", label: "Reports", icon: BarChart3 },
];

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [user, setUser] = useState({
    name: "Fleet Manager",
    email: "admin@logifleet.com",
    role: "Admin",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUser({
            name: parsed.name || parsed.fullName || "Fleet Manager",
            email: parsed.email || "admin@logifleet.com",
            role: parsed.role || localStorage.getItem("role") || "Admin",
          });
        }
      } catch (err) {
        console.error("Failed to fetch user details:", err);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  const formatRole = (roleStr) => {
    if (!roleStr) return "Admin";
    if (roleStr.toUpperCase() === "FLEET_MANAGER") return "Fleet Manager";
    return roleStr
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getInitials = (name) => {
    if (!name) return "FM";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-4">
      <div>
        <div className="mb-6 flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5B301] text-slate-950 font-extrabold text-sm shadow-md overflow-hidden">
              {logo ? (
                <img src={logo} alt="LF" className="h-6 w-6 object-contain" />
              ) : (
                "LF"
              )}
            </div>
            <div className="flex flex-col">
              <span className={`text-base font-bold leading-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                LogiFleet
              </span>
              <span className={`text-[10px] font-medium tracking-tight ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                Smart Fleet Operations
              </span>
            </div>
          </div>

          {/* 7. Close button (Mobile) */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className={`p-1.5 rounded-lg xl:hidden cursor-pointer ${
              isDarkMode
                ? "text-slate-400 hover:text-white hover:bg-slate-800"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* 1. Navigation links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 rounded-2xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#F5B301] text-slate-950 shadow-md"
                      : isDarkMode
                        ? "text-slate-400 hover:bg-slate-900/80 hover:text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0 stroke-[2.2]" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3 pt-4">
        {/* 2. User Card */}
        <div
          className={`flex items-center justify-between rounded-2xl border p-3 shadow-inner ${
            isDarkMode
              ? "border-slate-800/80 bg-slate-900/60"
              : "border-slate-200 bg-slate-50"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* 3. Initial Circle */}
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                isDarkMode
                  ? "bg-slate-800 text-slate-300"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {getInitials(user.name)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className={`text-xs font-bold truncate ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                {user.name}
              </span>
              {/* 4. Email */}
              <span
                className={`text-[10px] font-normal truncate ${
                  isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {user.email}
              </span>
            </div>
          </div>
          <span className="ml-2 shrink-0 rounded-md bg-[#F5B301]/20 px-2 py-0.5 text-[9px] font-semibold text-[#F5B301]">
            {formatRole(user.role)}
          </span>
        </div>

        {/* 5. Divider */}
        <div
          className={`border-t pt-2 ${
            isDarkMode ? "border-slate-800/80" : "border-slate-200"
          }`}
        >
          {/* 6. Logout Button */}
          <button
            onClick={handleLogout}
            className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
              isDarkMode
                ? "text-slate-400 hover:bg-slate-900 hover:text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <LogOut className="h-4 w-4 stroke-[2]" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm xl:hidden"
        />
      )}

      {/* Desktop Fixed Sidebar */}
      <aside
        className={`hidden xl:flex xl:w-64 xl:flex-col xl:fixed xl:top-0 xl:left-0 xl:h-screen border-r transition-colors duration-300 ${
          isDarkMode
            ? "border-slate-800/80 bg-[#0a0f1d]"
            : "border-slate-200 bg-white"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sliding Drawer Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r transition-all duration-300 ease-in-out xl:hidden ${
          isDarkMode
            ? "border-slate-800/80 bg-[#0a0f1d]"
            : "border-slate-200 bg-white"
        } ${
          mobileOpen
            ? "translate-x-0 pointer-events-auto"
            : "-translate-x-full pointer-events-none"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}