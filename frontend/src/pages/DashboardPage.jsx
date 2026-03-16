import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { get } from '../services/apiService';

function DashboardPage() {
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0
  });
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // Added to match ProjectsPage header structure

  useEffect(() => {
    get('/projects/summary')
      .then((data) => {
        setSummary(data?.summary || {
          totalProjects: 0,
          totalTasks: 0,
          completedTasks: 0,
          pendingTasks: 0
        });
      })
      .catch((err) => setSummaryError(err.message))
      .finally(() => setSummaryLoading(false));
  }, []);

  const pageClass = 'bg-[#020617] text-white';
  const cardClass = 'bg-[#0f172a]/80 border border-slate-800 shadow-xl backdrop-blur-sm';
  const subtitleClass = 'text-slate-400';
  const outlineClass = 'rounded-lg border border-slate-700 bg-[#1e293b]/50 px-3 py-1.5 text-sm text-white hover:bg-slate-700 transition-all';
  const buttonClass = 'rounded-lg border border-blue-600 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:-translate-y-0.5';

  return (
    <div className={`min-h-screen font-display ${pageClass} selection:bg-blue-500/30`}>
      {/* Layout Wrapper */}
      <div className="relative flex h-screen w-full flex-col overflow-hidden">

        {/* Header */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-800 bg-[#030712]/90 px-4 sm:px-10 py-4 z-10 shrink-0 backdrop-blur-md">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 text-blue-500">
              <div className="material-symbols-outlined text-3xl drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">hexagon</div>
              <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em] hidden sm:block">DevSpace</h2>
            </div>
            <label className="flex flex-col min-w-40 h-10 max-w-md w-96 relative group hidden md:flex">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                <span className="material-symbols-outlined text-xl">search</span>
              </div>
              <input
                className="form-input flex w-full h-full pl-10 pr-4 py-2 bg-[#1e293b]/50 border border-slate-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-full text-sm text-white placeholder:text-slate-500 transition-all font-medium"
                placeholder="Search projects or teammates..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </label>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative text-slate-500 hover:text-blue-400 transition-colors">
              <span className="material-symbols-outlined text-2xl">notifications</span>
              <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
            </button>
            <div className="flex items-center gap-3 cursor-pointer group">
              <Link to="/profile" className="h-10 w-10 rounded-full bg-blue-500/10 border border-blue-500/30 overflow-hidden flex items-center justify-center group-hover:ring-2 ring-blue-500/50 transition-all">
                <span className="material-symbols-outlined text-blue-500 text-xl">person</span>
              </Link>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-white">{user?.name || user?.email || 'User'}</p>
                <p className="text-xs text-slate-500">Developer</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden relative">
          {/* Sidebar */}
          <aside className="w-16 md:w-64 flex-shrink-0 flex flex-col justify-between border-r border-slate-800 bg-[#030712]/50 p-4 h-full overflow-y-auto z-0">
            <div className="flex flex-col gap-8">
              <nav className="flex flex-col gap-1.5 mt-4">
                <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-600/10 text-blue-400 font-semibold border border-blue-600/30 shadow-[0_0_15px_rgba(37,99,235,0.1)]">
                  <span className="material-symbols-outlined text-[20px]">dashboard</span>
                  <span className="text-sm hidden md:inline">Dashboard</span>
                </Link>
                <Link to="/projects" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-blue-600/10 hover:text-blue-400 transition-all group">
                  <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">folder_special</span>
                  <span className="text-sm font-medium hidden md:inline">Projects</span>
                </Link>
                <Link to="/ai" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-blue-600/10 hover:text-blue-400 transition-all group">
                  <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">smart_toy</span>
                  <span className="text-sm font-medium hidden md:inline">AI Assistant</span>
                </Link>
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="max-w-6xl mx-auto flex flex-col gap-8 relative z-10">
              {/* Page Header */}
              <div className="flex flex-col sm:flex-row items-center justify-between pb-4 border-b border-slate-800/50 gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard Overview</h1>
                  <p className={`mt-1 text-sm ${subtitleClass}`}>Welcome back, {user?.name || user?.email}. Here's what's happening.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button onClick={logout} className="flex-1 sm:flex-none items-center justify-center flex gap-2 bg-[#1e293b] hover:bg-[#334155] border border-slate-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all">
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    Logout
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Projects', value: summary.totalProjects, icon: 'folder', color: 'text-blue-500' },
                  { label: 'Total Tasks', value: summary.totalTasks, icon: 'list_alt', color: 'text-purple-500' },
                  { label: 'Completed Tasks', value: summary.completedTasks, icon: 'check_circle', color: 'text-emerald-500' },
                  { label: 'Pending Tasks', value: summary.pendingTasks, icon: 'pending', color: 'text-amber-500' }
                ].map((item) => (
                  <div key={item.label} className={`${cardClass} rounded-xl p-5 flex items-center gap-4`}>
                    <div className={`h-12 w-12 rounded-lg bg-white/5 flex items-center justify-center ${item.color}`}>
                      <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                    </div>
                    <div>
                      <p className={`text-xs uppercase tracking-wider font-semibold ${subtitleClass}`}>{item.label}</p>
                      <p className="text-2xl font-bold text-white mt-1">{summaryLoading ? '...' : item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {summaryError && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                  {summaryError}
                </div>
              )}

              {/* Navigation Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link to="/projects" className={`${cardClass} group rounded-2xl p-6 transition-all hover:border-blue-500/50`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-600/10 text-blue-500 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-2xl">folder</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-600 group-hover:text-blue-500 transition-colors">arrow_forward</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Projects</h3>
                  <p className={subtitleClass}>Manage your development projects, coordinate with teammates, and track milestones.</p>
                </Link>

                <Link to="/ai" className={`${cardClass} group rounded-2xl p-6 transition-all hover:border-blue-500/50`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-xl bg-purple-600/10 text-purple-500 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-2xl">smart_toy</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-600 group-hover:text-purple-500 transition-colors">arrow_forward</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">AI Assistant</h3>
                  <p className={subtitleClass}>Get help with code refactoring, debugging, and general documentation using advanced AI models.</p>
                </Link>
              </div>

              {/* Profile Shortcut */}
              <div className={`${cardClass} rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6`}>
                <div className="flex items-center gap-6 text-center md:text-left">
                  <div className="h-20 w-20 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-500 text-4xl">person</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{user?.name || user?.email}</h2>
                    <p className={subtitleClass}>Update your account settings and preferences.</p>
                  </div>
                </div>
                <Link to="/profile" className={buttonClass}>
                  Manage Profile
                </Link>
              </div>

            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
