import { Suspense, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useTheme } from "../context/ThemeContext";

// Premium styled loading spinner fallback
function PageLoader() {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 py-12">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent dark:border-[#F5B301] dark:border-t-transparent"></div>
      <p className="text-sm font-semibold tracking-wide text-slate-500 animate-pulse dark:text-slate-400">
        Loading platform data...
      </p>
    </div>
  );
}

export default function AppLayout() {
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Hide layout sidebars and navbars on authentication screens
  const isAuthPage = location.pathname === "/" || location.pathname === "/auth";

  if (isAuthPage) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-4 transition-all duration-300 ${
          isDarkMode
            ? "bg-[#0B0B0B] text-white"
            : "bg-white text-black"
        }`}
      >
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen w-full max-w-full overflow-x-hidden transition-all duration-300 ${
        isDarkMode
          ? "bg-[#0B0B0B] text-white"
          : "bg-white text-black"
      }`}
    >
      {/* Added max-w-full & overflow-x-hidden to outer container */}
      <div className="flex min-h-screen w-full max-w-full overflow-x-hidden">
        <Sidebar
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />
        
        {/* CRITICAL FIX: min-w-0 allows the flex item to contract properly */}
        <div className="flex-1 min-w-0 w-full max-w-full overflow-x-hidden flex flex-col">
          <Navbar
            onToggleSidebar={() => setMobileOpen(true)}
          />
          <main className="flex-1 w-full max-w-full min-w-0 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}