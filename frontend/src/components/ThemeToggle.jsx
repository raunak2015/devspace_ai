import { useTheme } from '../context/ThemeContext';

function ThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme();
  const buttonClass = isDark
    ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]'
    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-sm';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold tracking-wide uppercase transition-all hover:scale-105 active:scale-95 ${buttonClass}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Current: ${theme}. Click to switch.`}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${isDark ? 'bg-slate-400' : 'bg-amber-400'}`} />
      <span>{isDark ? 'Light' : 'Dark'}</span>
    </button>
  );
}

export default ThemeToggle;
