import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function ProfilePage() {
  const { user, refreshProfile, updateProfile } = useAuth();
  const { isDark } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const pageClass = isDark ? 'bg-stone-950 text-stone-100' : 'bg-amber-50 text-stone-900';
  const cardClass = isDark
    ? 'border-stone-700 bg-stone-900/85 shadow-[0_18px_42px_rgba(0,0,0,0.35)]'
    : 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-100 shadow-[0_18px_42px_rgba(67,43,20,0.18)]';
  const subtitleClass = isDark ? 'text-stone-300' : 'text-stone-600';
  const inputClass = isDark
    ? 'w-full rounded-lg border border-stone-600 bg-stone-800 px-3 py-2 text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-600'
    : 'w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500';
  const outlineClass = isDark
    ? 'rounded-lg border border-stone-600 bg-stone-800/70 px-3 py-2 text-sm text-stone-100 hover:bg-stone-700 transition'
    : 'rounded-lg border border-amber-200 bg-white/70 px-3 py-2 text-sm text-stone-900 hover:bg-white transition';
  const buttonClass = 'rounded-lg border border-amber-700 bg-gradient-to-b from-amber-700 to-amber-900 px-4 py-2 text-amber-50 transition hover:-translate-y-0.5 disabled:opacity-60';

  useEffect(() => {
    setLoading(true);
    refreshProfile()
      .then((profileUser) => {
        setName(profileUser?.name || '');
        setEmail(profileUser?.email || '');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [refreshProfile]);

  useEffect(() => {
    if (user) {
      setName((prev) => prev || user.name || '');
      setEmail((prev) => prev || user.email || '');
    }
  }, [user]);

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
    <div className={`min-h-screen px-4 py-8 font-serif ${pageClass}`}>
      <div className={`mx-auto max-w-3xl rounded-2xl border p-6 sm:p-8 ${cardClass}`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl">Profile / Settings</h1>
            <p className={`mt-2 ${subtitleClass}`}>Update your account details and password.</p>
          </div>
          <Link to="/dashboard" className={outlineClass}>← Dashboard</Link>
        </div>

        {loading ? (
          <p className={`mt-6 ${subtitleClass}`}>Loading profile...</p>
        ) : (
          <form onSubmit={handleSave} className="mt-6 space-y-4">
            <div>
              <label className={`mb-1 block text-sm ${subtitleClass}`}>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                maxLength={60}
              />
            </div>

            <div>
              <label className={`mb-1 block text-sm ${subtitleClass}`}>Email</label>
              <input
                type="email"
                value={email}
                className={`${inputClass} opacity-70`}
                disabled
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={`mb-1 block text-sm ${subtitleClass}`}>Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={inputClass}
                  placeholder="Leave blank to keep current"
                />
              </div>
              <div>
                <label className={`mb-1 block text-sm ${subtitleClass}`}>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClass}
                  placeholder="At least 6 chars with letter+number"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-emerald-500">{success}</p>}

            <button type="submit" disabled={saving} className={buttonClass}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
