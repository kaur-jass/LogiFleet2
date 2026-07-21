import React, { useState, useEffect, useRef } from "react";
import { Search, Sun, Moon, Loader2, X, ChevronRight, Menu } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { globalSearch } from "../services/searchService";
import { useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";

export default function Navbar({ onToggleSidebar }) {
  const { isDarkMode, setIsDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [user, setUser] = useState({
    name: "Jordan",
    role: "Operations Lead",
    avatar: "",
  });
  const navigate = useNavigate();
  const searchContainerRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUser({
            name: parsed.name || parsed.fullName || "Jordan",
            role: parsed.title || parsed.role || "Operations Lead",
            avatar: parsed.avatar || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch user navbar details:", err);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults(null);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoadingSearch(true);
        const data = await globalSearch(searchQuery);
        setResults(data);
        setShowResults(true);
      } catch (err) {
        console.error("Search failed:", err);
        setResults(null);
      } finally {
        setLoadingSearch(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return "J";
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  const formatRole = (roleStr) => {
    if (!roleStr) return "Operations Lead";
    if (roleStr.toUpperCase() === "FLEET_MANAGER") return "Fleet Manager";
    return roleStr
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const handleSearchResultClick = (category, item) => {
    setShowResults(false);
    setSearchQuery("");

    switch (category) {
      case "drivers":
        navigate(`/drivers?driverId=${item.id}`);
        break;

      case "vehicles":
        navigate(`/vehicles?vehicleId=${item.id}`);
        break;

      case "trips":
        navigate(`/trips?tripId=${item.id}`);
        break;

      case "fuel":
        navigate(`/fuel?fuelId=${item.id}`);
        break;

      case "expenses":
        navigate(`/expenses?expenseId=${item.id}`);
        break;

      case "reports":
        navigate(`/reports?reportId=${item.id}`);
        break;
        
      default:
        break;
    }
  };

  return (
    <header
      className={`sticky top-0 z-30 border-b px-3 py-2.5 sm:px-6 transition-colors duration-300 ${
        isDarkMode
          ? "border-slate-800/80 bg-[#0a0f1d]"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation"
          className={`xl:hidden flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border shrink-0 transition-colors cursor-pointer relative z-10 ${
            isDarkMode
              ? "border-slate-800 bg-slate-900 text-slate-300 hover:text-white"
              : "border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900"
          }`}
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Search Bar Container */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-xs sm:max-w-md">
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              {loadingSearch ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#F5B301]" />
              ) : (
                <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              )}
            </span>
            <input
              type="text"
              value={searchQuery}
              onFocus={() => searchQuery.trim() && setShowResults(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vehicles, drivers..."
              className={`w-full pl-8 sm:pl-10 pr-7 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full border outline-none transition-all ${
                isDarkMode
                  ? "bg-slate-900/80 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-[#F5B301] focus:ring-1 focus:ring-[#F5B301]"
                  : "bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#F5B301] focus:ring-1 focus:ring-[#F5B301]"
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setShowResults(false);
                }}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showResults && (
            <div
              className={`absolute top-full left-0 right-0 mt-2 rounded-2xl border shadow-2xl p-2 z-50 max-h-80 overflow-y-auto ${
                isDarkMode
                  ? "bg-[#0d1424] border-slate-800 text-slate-200"
                  : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              {results && Object.keys(results).length > 0 ? (
                Object.entries(results).map(([category, items]) => {
                  if (!Array.isArray(items) || items.length === 0) return null;
                  return (
                    <div key={category} className="mb-2 last:mb-0">
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#F5B301]">
                        {category}
                      </div>
                      {items.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSearchResultClick(category, item)}
                          className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs cursor-pointer transition-colors ${
                            isDarkMode
                              ? "hover:bg-slate-800/80"
                              : "hover:bg-slate-100"
                          }`}
                        >
                          <span className="truncate">{category === "trips" ? `${item.source} → ${item.destination}` : category === "vehicles"  ? `${item.name} (${item.regNumber})` : category === "drivers" ? item.name : item.title || item.name || item.label}</span>
                          <ChevronRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        </div>
                      ))}
                    </div>
                  );
                })
              ) : (
                <div className="p-3 text-center text-xs text-slate-400">
                  {loadingSearch ? "Searching..." : "No results found"}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Controls & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label="Toggle Theme"
            className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border transition-colors cursor-pointer ${
              isDarkMode
                ? "border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800"
                : "border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
            }`}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

            <NotificationBell />

          <div
            className={`flex items-center gap-2 rounded-full border p-1 sm:px-3 sm:py-1.5 transition-colors ${
              isDarkMode
                ? "border-slate-800/80 bg-slate-900/60"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover shrink-0"
              />
            ) : (
              <div
                className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-xs font-bold shrink-0 ${
                  isDarkMode
                    ? "bg-slate-800 text-slate-200"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {getInitials(user.name)}
              </div>
            )}

            <div className="hidden md:flex flex-col text-left pr-1">
              <span
                className={`text-xs font-bold leading-tight ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
              >
                {user.name}
              </span>
              <span
                className={`text-[10px] font-medium leading-tight ${
                  isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {formatRole(user.role)}
              </span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}