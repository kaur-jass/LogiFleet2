import { useEffect, useRef, useState } from "react";
import {
  Bell,
  CheckCheck,
  Truck,
  Fuel,
  DollarSign,
  Wrench,
  User,
  Car,
  BellRing,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notificationService";

export default function NotificationBell() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const navigationTimerRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load notifications initially + Auto Refresh every 30 seconds
  useEffect(() => {
    void loadNotifications();

    const interval = setInterval(() => {
      void loadNotifications();
    }, 30000);

    return () => {
      clearInterval(interval);
      if (navigationTimerRef.current) {
        clearTimeout(navigationTimerRef.current);
      }
    };
  }, []);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);

      const notificationsRes = await getNotifications();
      const countRes = await getUnreadNotificationCount();

      setNotifications(notificationsRes.data.notifications);
      setCount(countRes.data.count);
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDropdown = () => {
    setOpen((prev) => {
      const nextState = !prev;

      if (nextState) {
        void loadNotifications();
      }

      return nextState;
    });
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await markNotificationAsRead(notification.id);

        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id
              ? { ...item, isRead: true }
              : item
          )
        );

        setCount((prev) => Math.max(prev - 1, 0));
      }

      // Safe navigation delay with ref cleanup handling
      if (navigationTimerRef.current) {
        clearTimeout(navigationTimerRef.current);
      }

      navigationTimerRef.current = setTimeout(() => {
        setOpen(false);

        if (notification.actionUrl) {
          navigate(notification.actionUrl);
        }
      }, 150);
    } catch (error) {
      console.error(error);
    }
  };

  const handleReadAll = async () => {
    try {
      await markAllNotificationsAsRead();

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          isRead: true,
        }))
      );

      setCount(0);
      setOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const created = new Date(date);

    const seconds = Math.floor((now - created) / 1000);

    if (seconds < 60) return "Just now";

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60)
      return `${minutes} min${minutes > 1 ? "s" : ""} ago`;

    const hours = Math.floor(minutes / 60);

    if (hours < 24)
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;

    const days = Math.floor(hours / 24);

    if (days === 1) return "Yesterday";

    if (days < 7)
      return `${days} day${days > 1 ? "s" : ""} ago`;

    return created.toLocaleDateString();
  };

  // Helper to map category types to Lucide Icons & labels
  const getTypeBadge = (type) => {
    switch (type) {
      case "TRIP":
        return { icon: Truck, label: "TRIP", color: "text-blue-400 bg-blue-950/60 border-blue-800/40" };
      case "FUEL":
        return { icon: Fuel, label: "FUEL", color: "text-amber-400 bg-amber-950/60 border-amber-800/40" };
      case "EXPENSE":
        return { icon: DollarSign, label: "EXPENSE", color: "text-emerald-400 bg-emerald-950/60 border-emerald-800/40" };
      case "MAINTENANCE":
        return { icon: Wrench, label: "MAINTENANCE", color: "text-purple-400 bg-purple-950/60 border-purple-800/40" };
      case "DRIVER":
        return { icon: User, label: "DRIVER", color: "text-sky-400 bg-sky-950/60 border-sky-800/40" };
      case "VEHICLE":
        return { icon: Car, label: "VEHICLE", color: "text-indigo-400 bg-indigo-950/60 border-indigo-800/40" };
      default:
        return { icon: BellRing, label: type || "INFO", color: "text-slate-400 bg-slate-800/60 border-slate-700/40" };
    }
  };

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        title="Notifications"
        onClick={handleToggleDropdown}
        className="relative flex h-10 w-10 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-slate-800 bg-[#111827] text-slate-300 transition-all hover:bg-slate-800 hover:text-white focus:outline-none"
        aria-label="Open notifications"
      >
        <Bell className="h-4 w-4" />

        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f5b301] px-1 text-[10px] font-bold text-slate-950 shadow-sm">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {open && (
        <div className="fixed left-4 right-4 top-16 z-50 mt-2 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0b0f19] shadow-2xl backdrop-blur-md sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-3 sm:w-80">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3.5">
            <h3 className="text-sm font-semibold tracking-wide text-slate-100">
              Notifications
            </h3>

            {count > 0 && (
              <button
                onClick={handleReadAll}
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-[#f5b301] transition-colors hover:bg-[#f5b301]/10 focus:outline-none"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all
              </button>
            )}
          </div>

          {/* Notification List with Custom Scrollbar */}
          <div className="max-h-[60vh] sm:max-h-[400px] overflow-y-auto divide-y divide-slate-800/50 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-800 [&::-webkit-scrollbar-track]:bg-transparent">
            {loading ? (
              <div className="space-y-3 p-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-xl bg-slate-900/60 p-4 border border-slate-800/50"
                  >
                    <div className="mb-2 h-4 w-32 rounded bg-slate-800"></div>
                    <div className="h-3 w-full rounded bg-slate-800/60"></div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="mx-auto mb-3 h-8 w-8 text-slate-600" />
                <p className="text-sm font-semibold text-slate-300">
                  No new notifications
                </p>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed max-w-[200px] mx-auto">
                  We'll notify you about trips, maintenance, and fleet updates.
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const typeInfo = getTypeBadge(notification.type);
                const TypeIcon = typeInfo.icon;

                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`group flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-slate-900/70 ${
                      !notification.isRead ? "bg-slate-900/40" : ""
                    }`}
                  >
                    <div className="pt-1 shrink-0">
                      {!notification.isRead ? (
                        <div className="h-2 w-2 rounded-full bg-[#f5b301]" />
                      ) : (
                        <div className="h-2 w-2" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="truncate text-xs font-semibold text-slate-200 group-hover:text-white">
                          {notification.title}
                        </h4>

                        <span className="shrink-0 text-[10px] text-slate-400">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>

                      <p className="mt-1 line-clamp-2 text-xs text-slate-400 leading-relaxed">
                        {notification.message}
                      </p>

                      <div className="mt-2.5 flex items-center gap-2">
                        {/* Type Label */}
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase ${typeInfo.color}`}
                        >
                          <TypeIcon className="h-2.5 w-2.5" />
                          {typeInfo.label}
                        </span>

                        {/* Priority Badge */}
                        <span
                          className={`inline-block rounded-full border px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase ${
                            notification.priority === "HIGH"
                              ? "bg-red-950/80 text-red-400 border-red-800/50"
                              : notification.priority === "MEDIUM"
                              ? "bg-amber-950/80 text-amber-400 border-amber-800/50"
                              : "bg-emerald-950/80 text-emerald-300 border-emerald-800/50"
                          }`}
                        >
                          {notification.priority}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}