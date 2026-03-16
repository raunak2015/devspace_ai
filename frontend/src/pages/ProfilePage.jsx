import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProfilePage() {
  const { user, refreshProfile, updateProfile } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [profileId, setProfileId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const pageClass = 'bg-[#020617] text-white';
  const cardClass = 'bg-[#0f172a]/80 border border-slate-800 shadow-xl backdrop-blur-sm';
  const subtitleClass = 'text-slate-400';
  const inputClass = 'w-full rounded-lg border border-slate-700 bg-[#1e293b]/50 px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all';
  const buttonClass = 'rounded-lg border border-blue-600 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 disabled:opacity-60 shadow-lg font-semibold';

  useEffect(() => {
    if (user) {
      setName((prev) => prev || user.name || '');
      setEmail((prev) => prev || user.email || '');
      setCreatedAt((prev) => prev || user.createdAt || '');
      setProfileId((prev) => prev || user.id || user._id || '');
    }

    setLoading(true);
    refreshProfile()
      .then((profileUser) => {
        setName(profileUser?.name || '');
        setEmail(profileUser?.email || '');
        setCreatedAt(profileUser?.createdAt || '');
        setProfileId(profileUser?.id || profileUser?._id || '');
      })
      .catch((err) => {
        if (!user) {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user) {
      setName((prev) => prev || user.name || '');
      setEmail((prev) => prev || user.email || '');
      setCreatedAt((prev) => prev || user.createdAt || '');
      setProfileId((prev) => prev || user.id || user._id || '');
    }
  }, [user]);

  const joinedOn = createdAt ? new Date(createdAt).toLocaleDateString() : 'Unknown';

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Name is required.');
      return;
    }

    const wantsPassword = Boolean(currentPassword || newPassword);
    if (wantsPassword && (!currentPassword || !newPassword)) {
      setError('Provide both current and new password to change password.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        name: trimmedName,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined
      });
      setCurrentPassword('');
      setNewPassword('');
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

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
                placeholder="Search..."
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
              <Link to="/profile" className="h-10 w-10 rounded-full bg-blue-500/20 ring-2 ring-blue-500/50 overflow-hidden flex items-center justify-center transition-all">
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
                <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-blue-600/10 hover:text-blue-400 transition-all group">
                  <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">dashboard</span>
                  <span className="text-sm font-medium hidden md:inline">Dashboard</span>
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

            <div className="max-w-4xl mx-auto flex flex-col gap-8 relative z-10">
              {/* Page Header */}
              <div className="flex flex-col sm:flex-row items-center justify-between pb-4 border-b border-slate-800/50 gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white">Profile Settings</h1>
                  <p className={`mt-1 text-sm ${subtitleClass}`}>Manage your identity and account security.</p>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center gap-3 p-8">
                  <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className={subtitleClass}>Loading profile data...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Avatar Card */}
                  <div className={`${cardClass} rounded-2xl p-8 flex flex-col items-center text-center h-fit`}>
                    <div className="h-24 w-24 rounded-full bg-blue-500/10 border-2 border-blue-500/30 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                      <span className="material-symbols-outlined text-blue-500 text-5xl">person</span>
                    </div>
                    <h2 className="text-xl font-bold text-white">{name}</h2>
                    <p className={`text-sm mb-6 ${subtitleClass}`}>Developer Account</p>
                    <div className="w-full pt-6 border-t border-slate-800 space-y-3">
                      <div className="flex justify-between text-xs">
                        <span className={subtitleClass}>User ID</span>
                        <span className="text-slate-300 font-mono">{profileId.slice(-8)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className={subtitleClass}>Joined</span>
                        <span className="text-slate-300">{joinedOn}</span>
                      </div>
                    </div>
                  </div>

                  {/* Settings Form */}
                  <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSave} className={`${cardClass} rounded-2xl p-6 sm:p-8 space-y-6`}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="sm:col-span-2">
                          <label className={`mb-2 block text-sm font-semibold text-slate-300`}>Full Name</label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={inputClass}
                            placeholder="Your Name"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className={`mb-2 block text-sm font-semibold text-slate-300`}>Email Address</label>
                          <input
                            type="email"
                            value={email}
                            className={`${inputClass} opacity-60 cursor-not-allowed`}
                            disabled
                          />
                          <p className="mt-1.5 text-[11px] text-slate-500 italic">Email cannot be changed after registration.</p>
                        </div>

                        <div className="pt-4 sm:col-span-2 border-t border-slate-800 mt-2">
                          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg text-blue-500">lock</span>
                            Password Security
                          </h3>
                        </div>

                        <div>
                          <label className={`mb-2 block text-sm font-semibold text-slate-300`}>Current Password</label>
                          <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className={inputClass}
                            placeholder="••••••••"
                          />
                        </div>
                        <div>
                          <label className={`mb-2 block text-sm font-semibold text-slate-300`}>New Password</label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={inputClass}
                            placeholder="At least 6 chars"
                          />
                        </div>
                      </div>

                      {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg">error</span>
                          {error}
                        </div>
                      )}
                      {success && (
                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg">check_circle</span>
                          {success}
                        </div>
                      )}

                      <div className="pt-4 flex justify-end">
                        <button type="submit" disabled={saving} className={buttonClass}>
                          {saving ? 'Saving...' : 'Update Account'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
