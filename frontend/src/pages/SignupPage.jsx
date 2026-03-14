import { Link } from 'react-router-dom';
import LampIllustration from '../components/LampIllustration';
import { useTheme } from '../context/ThemeContext';

function SignupPage() {
  const { isDark } = useTheme();
  const pageClass = isDark
    ? 'bg-[#0b1020] text-slate-100'
    : 'bg-[#d8e2fb] text-slate-900';
  const overlayClass = isDark
    ? 'bg-[radial-gradient(circle_at_50%_-10%,rgba(248,229,145,0.16),transparent_30%),radial-gradient(circle_at_10%_80%,rgba(62,80,128,0.22),transparent_28%),radial-gradient(circle_at_88%_22%,rgba(33,53,95,0.2),transparent_30%)]'
    : 'bg-[radial-gradient(circle_at_50%_-10%,rgba(255,231,150,0.28),transparent_30%),radial-gradient(circle_at_10%_80%,rgba(128,150,196,0.28),transparent_28%),radial-gradient(circle_at_88%_22%,rgba(138,162,212,0.28),transparent_30%)]';
  const headingClass = isDark ? 'text-amber-300' : 'text-amber-700';
  const captionClass = isDark ? 'text-slate-300' : 'text-slate-700';
  const cardClass = isDark
    ? 'border-blue-400/30 bg-gradient-to-b from-slate-900/90 to-slate-950/95 shadow-[0_0_0_1px_rgba(104,148,255,0.18),0_0_32px_rgba(70,131,255,0.35)]'
    : 'border-blue-500/30 bg-gradient-to-b from-slate-50/95 to-blue-50/95 shadow-[0_0_0_1px_rgba(52,99,204,0.18),0_0_24px_rgba(66,114,220,0.24)]';
  const titleClass = isDark ? 'text-slate-50' : 'text-slate-800';
  const helperClass = isDark ? 'text-slate-400' : 'text-slate-600';
  const outlineButton = isDark
    ? 'border-stone-500/40 bg-stone-900/50 text-stone-100 hover:bg-stone-800/70'
    : 'border-stone-300 bg-white/80 text-stone-800 hover:bg-stone-50';

  return (
    <div className={`relative min-h-screen overflow-hidden px-4 py-10 font-serif transition-colors duration-300 ${pageClass}`}>
      <div className={`pointer-events-none absolute inset-0 ${overlayClass}`} />
      <div className="relative mx-auto w-full max-w-6xl animate-[fadeIn_.4s_ease-out]">
        <h1 className={`mb-6 text-center text-4xl tracking-wide md:text-6xl ${headingClass}`}>Signup page</h1>

        <div className="grid items-center gap-8 md:grid-cols-[0.95fr_1fr]">
          <div className="flex min-h-[360px] flex-col items-center justify-center">
            <LampIllustration lampOn={true} threadPulled={false} buttonLabel="Ready" />
            <p className={`mt-3 text-center font-medium ${captionClass}`}>Signup section uses the same theme as Login.</p>
          </div>

          <div className={`rounded-2xl border p-6 md:p-8 ${cardClass}`}>
            <h2 className={`text-4xl font-bold ${titleClass}`}>Create Account</h2>
            <p className={`mt-3 text-sm ${helperClass}`}>Signup page will be fully implemented in the next commit unit.</p>
            <div className="mt-6 flex gap-3">
              <Link
                to="/login"
                className="inline-block rounded-lg border border-blue-400 bg-gradient-to-b from-blue-400 to-blue-600 px-5 py-2 text-center font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-[0_10px_18px_rgba(67,131,255,0.28)]"
              >
                Back to Login
              </Link>
              <Link to="/" className={`inline-block rounded-lg border px-5 py-2 text-center font-semibold transition hover:-translate-y-0.5 ${outlineButton}`}>
                Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
