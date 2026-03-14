import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LampIllustration from '../components/LampIllustration';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function SignupPage() {
  const [lampOn, setLampOn] = useState(false);
  const [threadPulled, setThreadPulled] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const nameRef = useRef(null);
  const navigate = useNavigate();
  const { signup, isAuthenticated } = useAuth();
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
  const labelClass = isDark ? 'text-slate-200' : 'text-slate-700';
  const inputClass = isDark
    ? 'border-blue-300/20 bg-slate-950/70 text-slate-100 placeholder:text-slate-500 focus:border-blue-400 focus:ring-blue-400/20'
    : 'border-blue-700/20 bg-white/90 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20';
  const helperClass = isDark ? 'text-slate-400' : 'text-slate-600';
  const linkClass = isDark ? 'text-amber-300 hover:text-amber-200' : 'text-amber-700 hover:text-amber-800';
  const outlineButton = isDark
    ? 'border-stone-500/40 bg-stone-900/50 text-stone-100 hover:bg-stone-800/70'
    : 'border-stone-300 bg-white/80 text-stone-800 hover:bg-stone-50';

  useEffect(() => {
    if (lampOn) {
      nameRef.current?.focus();
    }
  }, [lampOn]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();

    if (!trimmedName || !trimmedEmail || !formData.password || !formData.confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Enter a valid email address.');
      return;
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(formData.password)) {
      setError('Password must be at least 6 characters and include a letter and a number.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await signup({
        name: trimmedName,
        email: trimmedEmail,
        password: formData.password
      });

      navigate('/login', {
        replace: true,
        state: {
          signupMessage: 'Account created successfully. Please login.'
        }
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePullThread = () => {
    setThreadPulled(true);
    setLampOn((prev) => !prev);

    setTimeout(() => {
      setThreadPulled(false);
    }, 260);
  };

  return (
    <div className={`relative min-h-screen overflow-hidden px-4 py-10 font-serif transition-colors duration-300 ${pageClass}`}>
      <div className={`pointer-events-none absolute inset-0 ${overlayClass}`} />
      <div className="relative mx-auto w-full max-w-6xl animate-[fadeIn_.4s_ease-out]">
        <h1 className={`mb-6 text-center text-4xl tracking-wide md:text-6xl ${headingClass}`}>Signup page</h1>

        <div className="grid items-center gap-8 md:grid-cols-[0.95fr_1fr]">
          <div className="flex min-h-[360px] flex-col items-center justify-center">
            <LampIllustration lampOn={lampOn} threadPulled={threadPulled} onPull={handlePullThread} />
            <p className={`mt-3 text-center font-medium ${captionClass}`}>
              {lampOn ? 'Pull the thread again to hide signup details.' : 'Pull the thread to reveal signup details.'}
            </p>
          </div>

          <div
            className={`rounded-2xl border p-6 transition duration-300 md:p-8 ${cardClass} ${lampOn ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-6 scale-95 opacity-0'
              }`}
          >
            <h2 className={`text-4xl font-bold ${titleClass}`}>Create Account</h2>
            <p className={`mt-3 text-sm ${helperClass}`}>Create your DevSpace account to continue.</p>

            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className={`mb-1 block text-sm font-medium ${labelClass}`}>
                  Full Name
                </label>
                <input
                  ref={nameRef}
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-3 py-2 outline-none ring-0 transition focus:ring-4 ${inputClass}`}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className={`mb-1 block text-sm font-medium ${labelClass}`}>
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-3 py-2 outline-none ring-0 transition focus:ring-4 ${inputClass}`}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className={`mb-1 block text-sm font-medium ${labelClass}`}>
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-3 py-2 outline-none ring-0 transition focus:ring-4 ${inputClass}`}
                  placeholder="At least 6 characters"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className={`mb-1 block text-sm font-medium ${labelClass}`}>
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-3 py-2 outline-none ring-0 transition focus:ring-4 ${inputClass}`}
                  placeholder="Re-enter your password"
                />
              </div>

              {error ? <p className="text-sm text-rose-400">{error}</p> : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg border border-blue-400 bg-gradient-to-b from-blue-400 to-blue-600 px-3 py-2 font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-[0_10px_18px_rgba(67,131,255,0.28)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

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

            <p className={`mt-4 text-sm ${helperClass}`}>
              Already have an account?{' '}
              <Link to="/login" className={`font-semibold ${linkClass}`}>
                Go to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
