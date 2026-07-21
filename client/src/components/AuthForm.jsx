import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sun,
  Moon,
  User,
  ChevronDown,
  UserCog,
  AlertCircle,
  Truck,
  ShieldCheck,
  BarChart3,
} from 'lucide-react';
import logo from "../assets/logo.png";
import truck from "../assets/truck.png";
import { useTheme } from "../context/ThemeContext";

const ROLE_OPTIONS = [
  { label: "Fleet Manager", value: "FLEET_MANAGER" },
  { label: "Driver", value: "DRIVER" },
  { label: "Safety Officer", value: "SAFETY_OFFICER" },
  { label: "Financial Analyst", value: "FINANCIAL_ANALYST" },
];

export default function AuthForm() {
  const { isDarkMode, setIsDarkMode } = useTheme();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [rememberMe, setRememberMe] = useState(
    () => localStorage.getItem("rememberMe") === "true"
  );
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (value) => {
    setFormData((prev) => ({ ...prev, role: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");

    if (!formData.role) {
      setError("Please select a role to continue.");
      return;
    }

    if (isRegister && !acceptTerms) {
      setError("Please accept the Terms & Conditions.");
      return;
    }
    
    if (!isRegister) {
      localStorage.setItem("rememberMe", rememberMe);
    }
    setLoading(true);

    try {
      let response;

      if (isRegister) {
        response = await API.post("/auth/register", {
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });
      } else {
        response = await API.post("/auth/login", {
          email: formData.email,
          password: formData.password,
        });
      }

      if (!isRegister) {
        const { token, user } = response.data.data;
        const resolvedRole = user.role || formData.role;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("role", resolvedRole);

        navigate("/dashboard");
        return;
      }

      alert("Account created successfully! Please login.");

      setFormData({
        fullName: "",
        email: "",
        password: "",
        role: "",
      });

      setAcceptTerms(false);
      setIsRegister(false);
    } catch (err) {
      setError(
        err.response?.data?.error?.message || err.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-5xl rounded-2xl md:rounded-[24px] border overflow-hidden flex flex-col md:flex-row relative transition-all duration-300 ${
      isDarkMode
        ? 'bg-[#0f172a] border-slate-800 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.5)]'
        : 'bg-white border-slate-200 shadow-[0_32px_64px_-15px_rgba(15,23,42,0.08)]'
    }`}>

      <div className={`absolute top-5 right-6 z-30 hidden md:flex items-center rounded-full p-1 border transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
      }`}>
        <button
          type="button"
          onClick={() => setIsDarkMode(false)}
          className={`flex cursor-pointer items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-all ${
            !isDarkMode
              ? 'bg-white text-[#B8860B] shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sun size={12} className="stroke-[2.5]" /> Light
        </button>
        <button
          type="button"
          onClick={() => setIsDarkMode(true)}
          className={`flex cursor-pointer items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-all ${
            isDarkMode
              ? 'bg-[#1e293b] text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Moon size={12} className="stroke-[2.5]" /> Dark
        </button>
      </div>

      <div className="w-full md:w-1/2 p-6 md:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden bg-[#F2B705]">

        <button
          type="button"
          onClick={() => setIsDarkMode(!isDarkMode)}
          aria-label="Toggle theme"
          className="absolute top-4 right-4 z-30 flex cursor-pointer md:hidden p-2 rounded-full bg-neutral-900/10 hover:bg-neutral-900/20 text-neutral-900 transition-colors"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="pointer-events-none absolute left-[-20px] top-[12%] w-[260px] md:w-[300px] h-[300px] opacity-[0.18]">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-neutral-900">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <svg viewBox="0 0 100 50" className="absolute top-4 left-24 w-48 h-24 stroke-neutral-900 stroke-[2] fill-none" strokeDasharray="4,4">
            <path d="M0,25 Q40,0 80,10" />
          </svg>
        </div>

        <div className="z-10 flex flex-row md:flex-col justify-between items-center md:items-start gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 md:mb-5">
              <img src={logo} alt="LogiFleet logo" className="h-6 w-6 md:h-7 md:w-7 object-contain" />
              <span className="font-bold text-base md:text-lg text-neutral-900">LogiFleet</span>
            </div>
            <p className="hidden md:block text-[10px] font-semibold tracking-[0.2em] text-neutral-800/80 mb-1.5">
              SMART TRANSPORT OPERATIONS
            </p>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900 leading-none">
              LOGIFLEET
            </h1>
            <p className="mt-1 md:mt-2.5 text-neutral-800/90 text-xs md:text-base">
              Drive <span className="mx-0.5 md:mx-1 text-neutral-800/50">•</span> Manage{" "}
              <span className="mx-0.5 md:mx-1 text-neutral-800/50">•</span> Deliver
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-center shrink-0 md:w-full md:py-4">
            <img
              src={truck}
              alt="LogiFleet delivery truck"
              className="w-24 sm:w-28 md:w-full md:max-w-[280px] lg:max-w-xs object-contain drop-shadow-xl md:drop-shadow-2xl"
            />
          </div>
        </div>

        <div className="hidden md:grid relative z-10 grid-cols-3 gap-2 mt-4 md:mt-0">
          <FeatureChip icon={<Truck size={17} />} label={"Optimized\nFleet"} />
          <FeatureChip icon={<ShieldCheck size={17} />} label={"Safe &\nCompliant"} />
          <FeatureChip icon={<BarChart3 size={17} />} label={"Data Driven\nInsights"} />
        </div>
      </div>

      <div className={`w-full md:w-1/2 p-6 sm:p-10 md:p-10 lg:p-12 flex flex-col justify-center transition-colors duration-300 ${
        isDarkMode ? 'bg-[#0f172a]' : 'bg-white'
      }`}>
        <div className="w-full max-w-md mx-auto my-auto">

          <div className="mb-5 sm:mb-6">
            <h3 className={`text-xl sm:text-2xl font-extrabold tracking-tight transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              {isRegister ? 'Create your account' : 'Welcome Back'}
            </h3>
            <p className={`text-xs mt-1 transition-colors duration-300 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              {isRegister ? 'Set up your LogiFleet account to get started' : 'Login to your account and continue'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            {isRegister && (
              <div>
                <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1 transition-colors duration-300 ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
                    <User size={15} />
                  </span>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter Your Name"
                    required
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#F5B301] focus:ring-2 focus:ring-[#F5B301]/40 transition-all ${
                      isDarkMode
                        ? "bg-slate-900/60 border-slate-800 text-slate-100 placeholder-slate-600"
                        : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                    }`}
                  />
                </div>
              </div>
            )}

            <RoleSelect value={formData.role} onChange={handleRoleChange} isDarkMode={isDarkMode} />

            <div>
              <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1 transition-colors duration-300 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>Email address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
                  <Mail size={15} />
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  required
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#F5B301] focus:ring-2 focus:ring-[#F5B301]/40 transition-all ${
                    isDarkMode
                      ? "bg-slate-900/60 border-slate-800 text-slate-100 placeholder-slate-600"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1 transition-colors duration-300 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
                  <Lock size={15} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className={`w-full pl-10 pr-11 py-3 border rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#F5B301] focus:ring-2 focus:ring-[#F5B301]/40 transition-all ${
                    isDarkMode
                      ? "bg-slate-900/60 border-slate-800 text-slate-100 placeholder-slate-600"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className={`flex items-center gap-2 cursor-pointer select-none transition-colors duration-300 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                <input
                  type="checkbox"
                  checked={isRegister ? acceptTerms : rememberMe}
                  onChange={(e) =>
                    isRegister
                      ? setAcceptTerms(e.target.checked)
                      : setRememberMe(e.target.checked)
                  }
                  className="w-3.5 h-3.5 cursor-pointer rounded border-slate-300 accent-[#F5B301]"
                />
                {isRegister ? "I agree to the Terms & Conditions" : "Remember me on this device"}
              </label>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg px-3.5 py-2 text-xs">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1.5 cursor-pointer bg-[#F5B301] hover:bg-[#e0a400] text-neutral-900 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md group active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-xs sm:text-sm"
            >
              {loading ? "Please wait..." : isRegister ? "Create Account" : "Login"}
              {!loading && (
                <ArrowRight
                  size={14}
                  className="transform group-hover:translate-x-0.5 transition-transform"
                />
              )}
            </button>
          </form>

          <div className="relative flex items-center my-5">
            <div className={`flex-grow border-t transition-colors duration-300 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}></div>
            <span className={`flex-shrink mx-3 text-[9px] font-bold tracking-widest uppercase transition-colors duration-300 ${
              isDarkMode ? 'text-slate-500' : 'text-slate-400'
            }`}>Secure Connection</span>
            <div className={`flex-grow border-t transition-colors duration-300 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}></div>
          </div>

          <p className={`text-center text-xs font-normal transition-colors duration-300 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setError("");
                setAcceptTerms(false);
                setFormData({
                  fullName: "",
                  email: "",
                  password: "",
                  role: "",
                });
                setIsRegister(!isRegister);
              }}
              className="font-bold cursor-pointer text-[#B8860B] hover:underline ml-0.5 transition-colors"
            >
              {isRegister ? 'Log in' : 'Create account'}
            </button>
          </p>

        </div>
      </div>

    </div>
  );
}

function RoleSelect({ value, onChange, isDarkMode }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selected = ROLE_OPTIONS.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen((o) => !o);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1 transition-colors duration-300 ${
        isDarkMode ? 'text-slate-400' : 'text-slate-500'
      }`}>
        Role <span className="text-[#B8860B] normal-case">*</span>
      </label>

      <div className="relative flex items-center">
        <button
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          required
          onClick={() => setIsOpen((o) => !o)}
          onKeyDown={handleKeyDown}
          className={`w-full cursor-pointer pl-10 pr-9 py-3 border rounded-xl text-xs sm:text-sm text-left focus:outline-none focus:ring-2 focus:ring-[#F5B301]/40 transition-all ${
            isOpen ? "border-[#F5B301] ring-2 ring-[#F5B301]/40" : ""
          } ${
            isDarkMode
              ? "bg-slate-900/60 border-slate-800 text-slate-100"
              : "bg-slate-50 border-slate-200 text-slate-900"
          } ${selected ? "" : isDarkMode ? "text-slate-600" : "text-slate-400"}`}
        >
          {selected ? selected.label : "Select your role"}
        </button>

        <span className="pointer-events-none absolute left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
          <UserCog size={15} />
        </span>
        <ChevronDown
          size={15}
          className={`pointer-events-none absolute right-3 text-slate-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && (
        <ul
          role="listbox"
          className={`absolute z-20 mt-1.5 w-full rounded-xl border shadow-lg py-1 max-h-56 overflow-auto ${
            isDarkMode
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-200"
          }`}
        >
          {ROLE_OPTIONS.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={value === opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`px-3.5 py-2 text-xs sm:text-sm cursor-pointer transition-colors ${
                value === opt.value
                  ? isDarkMode
                    ? "bg-[#F5B301]/20 text-white font-semibold"
                    : "bg-[#FDE9A8]/60 text-neutral-900 font-semibold"
                  : isDarkMode
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FeatureChip({ icon, label }) {
  return (
    <div className="flex items-center gap-2 bg-[#FDE9A8]/70 rounded-2xl px-2.5 py-2">
      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#F5B301]/40 text-neutral-900 shrink-0">
        {icon}
      </span>
      <span className="text-[10px] font-semibold text-neutral-800 leading-tight whitespace-pre-line">
        {label}
      </span>
    </div>
  );
}