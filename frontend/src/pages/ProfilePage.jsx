import { useTheme } from '../context/ThemeContext';

function ProfilePage() {
  const { isDark } = useTheme();
  const pageClass = isDark ? 'bg-stone-950 text-stone-100' : 'bg-amber-50 text-stone-900';
  const cardClass = isDark
    ? 'border-stone-700 bg-stone-900/85 shadow-[0_18px_42px_rgba(0,0,0,0.35)]'
    : 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-100 shadow-[0_18px_42px_rgba(67,43,20,0.18)]';
  const subtitleClass = isDark ? 'text-stone-300' : 'text-stone-600';

  return (
    <div className={`min-h-screen px-4 py-8 font-serif ${pageClass}`}>
      <div className={`mx-auto max-w-3xl rounded-2xl border p-6 sm:p-8 ${cardClass}`}>
        <h1 className="text-3xl">Profile / Settings</h1>
        <p className={`mt-2 ${subtitleClass}`}>Profile features will be expanded in upcoming commits.</p>
      </div>
    </div>
  );
}

export default ProfilePage;
