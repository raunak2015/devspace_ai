import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function DashboardPage() {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const pageClass = isDark ? 'bg-stone-950 text-stone-100' : 'bg-amber-50 text-stone-900';
  const cardClass = isDark
    ? 'border-stone-700 bg-stone-900/85 shadow-[0_18px_42px_rgba(0,0,0,0.35)]'
    : 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-100 shadow-[0_18px_42px_rgba(67,43,20,0.18)]';
  const subtitleClass = isDark ? 'text-stone-300' : 'text-stone-600';
  const outlineClass = isDark
    ? 'border-stone-600 bg-stone-800/70 text-stone-100 hover:bg-stone-700'
    : 'border-amber-200 bg-white/70 text-stone-900 hover:bg-white';
  const buttonClass = 'rounded-lg border border-amber-700 bg-gradient-to-b from-amber-700 to-amber-900 px-4 py-2 text-amber-50 transition hover:-translate-y-0.5';

  return (
    <div className={`min-h-screen px-4 py-8 font-serif ${pageClass}`}>
      <div className={`mx-auto max-w-4xl rounded-2xl border p-6 sm:p-8 ${cardClass}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl">Dashboard</h1>
            <p className={`mt-2 ${subtitleClass}`}>Welcome, {user?.name || user?.email}</p>
          </div>
          <div className="flex gap-3">
            <Link to="/profile" className={`rounded-lg border px-4 py-2 font-semibold transition hover:-translate-y-0.5 ${outlineClass}`}>
              Profile
            </Link>
            <button onClick={logout} className={buttonClass}>
              Logout
            </button>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            to="/projects"
            className={`group rounded-xl border p-5 transition hover:-translate-y-0.5 hover:shadow-lg ${outlineClass}`}
          >
            <div className="text-2xl mb-2">📁</div>
            <h2 className="font-semibold text-lg">Projects</h2>
            <p className={`mt-1 text-sm ${subtitleClass}`}>Create and manage your projects, tasks, and team chat.</p>
          </Link>

          <Link
            to="/ai"
            className={`group rounded-xl border p-5 transition hover:-translate-y-0.5 hover:shadow-lg ${outlineClass}`}
          >
            <div className="text-2xl mb-2">🤖</div>
            <h2 className="font-semibold text-lg">AI Assistant</h2>
            <p className={`mt-1 text-sm ${subtitleClass}`}>Explain code, debug issues, or ask the AI anything.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
