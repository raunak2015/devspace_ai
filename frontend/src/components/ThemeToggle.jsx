import { useTheme } from '../context/ThemeContext';

function ThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme();
  const buttonClass = isDark
    ? 'border-amber-700/40 bg-stone-900/70 text-stone-100 hover:bg-stone-800/80'
    : 'border-stone-300 bg-white/80 text-stone-800 hover:bg-stone-50';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`fixed right-4 top-4 z-40 inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold shadow-sm backdrop-blur transition ${buttonClass}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Current: ${theme}. Click to switch.`}
    >
      <span className={`h-3 w-3 rounded-full ${isDark ? 'bg-amber-400' : 'bg-stone-700'}`} />
      <span>{isDark ? 'Dark' : 'Light'}</span>
    </button>
  );
}

export default ThemeToggle;
