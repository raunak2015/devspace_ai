import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LampIllustration from '../components/LampIllustration';

function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lampOn, setLampOn] = useState(false);
  const [threadPulled, setThreadPulled] = useState(false);
  const emailRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const signupMessage = location.state?.signupMessage || '';

  useEffect(() => {
    if (lampOn) {
      emailRef.current?.focus();
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

    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Email and password are required.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      await login({
        email: formData.email.trim(),
        password: formData.password
      });

      const redirectTo = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (caughtError) {
      if (caughtError.status === 403) {
          navigate('/verify-otp', {
              state: { email: caughtError.email, message: caughtError.message }
          });
          return;
      }
      setError(caughtError instanceof Error ? caughtError.message : 'Login failed. Please try again.');
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

  const pageClass = 'bg-[#020617] text-white';
  const overlayClass = 'bg-[radial-gradient(circle_at_50%_-10%,rgba(59,130,246,0.1),transparent_30%),radial-gradient(circle_at_10%_80%,rgba(37,99,235,0.05),transparent_28%)]';
  const cardClass = 'border-slate-800 bg-[#0f172a]/95 shadow-2xl backdrop-blur-md';
  const labelClass = 'text-slate-400 font-bold uppercase tracking-widest text-[10px]';
  const inputClass = 'border-slate-800 bg-[#020617] text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-blue-500/10 shadow-inner';
  const helperClass = 'text-slate-500';
  const linkClass = 'text-blue-400 hover:text-blue-300 transition-colors';

  return (
    <div className={`relative h-screen overflow-hidden px-4 py-6 font-display flex items-center justify-center transition-colors duration-300 ${pageClass}`}>
      <div className={`pointer-events-none absolute inset-0 ${overlayClass}`} />
      
      {/* Decorative background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="relative mx-auto w-full max-w-6xl z-10">
        <div className="flex flex-col items-center mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="h-10 w-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-blue-500 text-xl">hexagon</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase italic">
              Authorization <span className="text-blue-500">Node</span>
            </h1>
        </div>

        <div className="grid items-center gap-12 md:grid-cols-[1fr_1.1fr]">
          <div className="flex min-h-[300px] flex-col items-center justify-center animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="p-6 rounded-full bg-blue-600/5 border border-blue-600/10 relative scale-90 md:scale-100">
                <div className="absolute inset-0 bg-blue-600/10 rounded-full blur-[40px]"></div>
                <LampIllustration lampOn={lampOn} threadPulled={threadPulled} onPull={handlePullThread} />
            </div>

            <p className="mt-6 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              {lampOn ? 'Deactivate sensory input to secure terminal' : 'Activate sensory input to reveal console'}
            </p>
          </div>

          <div
            className={`rounded-[32px] border p-6 md:p-8 transition-all duration-700 ${cardClass} ${lampOn ? 'translate-y-0 translate-x-0 rotate-0 scale-100 opacity-100' : 'pointer-events-none translate-y-12 translate-x-4 rotate-1 scale-95 opacity-0'}`}
          >
            <div className="mb-6">
                <h2 className="text-2xl font-black text-white mb-1">Initialize Session</h2>
                <p className="text-xs text-slate-500 font-medium">Please enter your credentials to access the DevSpace kernel.</p>
            </div>

            {signupMessage && (
                <div className="mb-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    {signupMessage}
                </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="email" className={labelClass}>Terminal Identifier</label>
                <input
                  ref={emailRef}
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full rounded-xl border px-4 py-3.5 outline-none transition-all ${inputClass}`}
                  placeholder="name@domain.com"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className={labelClass}>Security Passphrase</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full rounded-xl border px-4 py-3.5 outline-none transition-all ${inputClass}`}
                  placeholder="••••••••••••"
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">warning</span>
                    {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-3.5 font-black text-white uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Establish Connection'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-800/50 flex flex-col items-center gap-3">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  New operator? {' '}
                  <Link className={linkClass} to="/signup">Create Identity</Link>
                </p>
                <Link to="/" className="text-[9px] text-slate-600 hover:text-white transition-colors flex items-center gap-1 font-bold italic">
                   <span className="material-symbols-outlined text-[10px]">arrow_back</span> Return to public zone
                </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
