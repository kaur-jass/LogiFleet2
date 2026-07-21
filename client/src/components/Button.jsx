export default function Button({ children, type = 'button', className = '', ...props }) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-xl bg-[#F5B301] px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-[#e0a200] focus:outline-none focus:ring-2 focus:ring-[#F5B301]/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}