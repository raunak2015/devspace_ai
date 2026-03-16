import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LampIllustration from '../components/LampIllustration';
import { useAuth } from '../context/AuthContext';

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

  const pageClass = 'bg-[#020617] text-white';
  const overlayClass = 'bg-[radial-gradient(circle_at_50%_-10%,rgba(59,130,246,0.1),transparent_30%),radial-gradient(circle_at_10%_80%,rgba(37,99,235,0.05),transparent_28%)]';
  const cardClass = 'border-slate-800 bg-[#0f172a]/95 shadow-2xl backdrop-blur-md';
  const labelClass = 'text-slate-400 font-bold uppercase tracking-widest text-[10px]';
  const inputClass = 'border-slate-800 bg-[#020617] text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-blue-500/10 shadow-inner';
  const linkClass = 'text-blue-400 hover:text-blue-300 transition-colors';

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
    <div className={`relative min-h-screen overflow-hidden px-4 py-10 font-display transition-colors duration-300 ${pageClass}`}>
      <div className={`pointer-events-none absolute inset-0 ${overlayClass}`} />
      
      {/* Decorative background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="relative mx-auto w-full max-w-6xl z-10">
        <div className="flex flex-col items-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="h-12 w-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-blue-500 text-2xl">hexagon</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase italic text-center">
              Identity <span className="text-blue-500">Registry</span>
            </h1>
        </div>

        <div className="grid items-center gap-12 md:grid-cols-[1fr_1.1fr]">
          <div className="flex min-h-[400px] flex-col items-center justify-center animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="p-8 rounded-full bg-blue-600/5 border border-blue-600/10 relative">
                <div className="absolute inset-0 bg-blue-600/10 rounded-full blur-[40px]"></div>
                <LampIllustration lampOn={lampOn} threadPulled={threadPulled} onPull={handlePullThread} />
            </div>

            <p className="mt-8 text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              {lampOn ? 'Secure session to prevent data extraction' : 'Register new identifier to initialize core access'}
            </p>
          </div>

          <div
            className={`rounded-[32px] border p-8 md:p-12 transition-all duration-700 ${cardClass} ${lampOn ? 'translate-y-0 translate-x-0 rotate-0 scale-100 opacity-100' : 'pointer-events-none translate-y-12 translate-x-4 rotate-1 scale-95 opacity-0'}`}
          >
            <div className="mb-8">
                <h2 className="text-3xl font-black text-white mb-2">Create Profile</h2>
                <p className="text-sm text-slate-500 font-medium">Provision new authorization keys for your developer account.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="name" className={labelClass}>Callsign / Full Name</label>
                <input
                  ref={nameRef}
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full rounded-xl border px-4 py-3 outline-none transition-all ${inputClass}`}
                  placeholder="e.g. Raunak Shahu"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className={labelClass}>Network Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full rounded-xl border px-4 py-3 outline-none transition-all ${inputClass}`}
                  placeholder="operator@nexus.io"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="password" className={labelClass}>New Passphrase</label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full rounded-xl border px-4 py-3 outline-none transition-all ${inputClass}`}
                      placeholder="Min 6 chars"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className={labelClass}>Verify Pass</label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full rounded-xl border px-4 py-3 outline-none transition-all ${inputClass}`}
                      placeholder="Repeat"
                    />
                  </div>
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
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-4 font-black text-white uppercase tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Synthesizing...' : 'Register Identity'}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-800/50 flex flex-col items-center gap-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Existing operator? {' '}
                  <Link className={linkClass} to="/login">Initialize Session</Link>
                </p>
                <div className="flex gap-6 mt-2">
                    <Link to="/" className="text-[10px] text-slate-600 hover:text-white transition-colors flex items-center gap-1 font-bold italic">
                       <span className="material-symbols-outlined text-xs">home</span> Home
                    </Link>
                    <Link to="/login" className="text-[10px] text-slate-600 hover:text-white transition-colors flex items-center gap-1 font-bold italic">
                       <span className="material-symbols-outlined text-xs">login</span> Login
                    </Link>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
