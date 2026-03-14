import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

function HomePage() {
  const { isDark } = useTheme();
  const pageClass = isDark
    ? 'bg-stone-950 text-stone-100'
    : 'bg-amber-50 text-stone-900';
  const cardClass = isDark
    ? 'border-stone-700 bg-stone-900/85 shadow-[0_18px_42px_rgba(0,0,0,0.35)]'
    : 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-100 shadow-[0_18px_42px_rgba(67,43,20,0.18)]';
  const subtitleClass = isDark ? 'text-stone-300' : 'text-stone-600';
  const primaryClass = isDark
    ? 'border-amber-700 bg-gradient-to-b from-amber-700 to-amber-900 text-amber-50'
    : 'border-amber-700 bg-gradient-to-b from-amber-700 to-amber-900 text-amber-50';
  const secondaryClass = isDark
    ? 'border-stone-600 bg-stone-800/70 text-stone-100 hover:bg-stone-700'
    : 'border-amber-200 bg-white/70 text-stone-900 hover:bg-white';

  return (
    <div className={`flex min-h-screen items-center justify-center px-4 py-8 font-serif ${pageClass}`}>
      <div className={`w-full max-w-2xl rounded-3xl border p-8 text-center sm:p-10 ${cardClass}`}>
        <h1 className="text-3xl sm:text-5xl">Welcome to DevSpace</h1>
        <p className={`mt-3 text-base sm:text-lg ${subtitleClass}`}>AI-powered developer collaboration platform</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/login" className={`rounded-lg border px-5 py-2 font-semibold transition hover:-translate-y-0.5 ${primaryClass}`}>
            Login
          </Link>
          <Link to="/signup" className={`rounded-lg border px-5 py-2 font-semibold transition hover:-translate-y-0.5 ${secondaryClass}`}>
            Signup
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
