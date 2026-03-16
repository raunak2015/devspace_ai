import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function VerifyOTPPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { confirmOtp, requestNewOtp } = useAuth();
    
    // Attempt to get email from navigation state or redirect back
    const email = location.state?.email || '';
    const initialMessage = location.state?.message || 'Verification required.';

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [resendStatus, setResendStatus] = useState('');
    const [timer, setTimer] = useState(60);
    
    const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

    useEffect(() => {
        if (!email) {
            navigate('/login');
        }
    }, [email, navigate]);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer(t => t - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        // Move to next input
        if (value && index < 5) {
            inputRefs[index + 1].current.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs[index - 1].current.focus();
        }
    };

    const handlePaste = (e) => {
        const data = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(data)) return;
        
        const newOtp = [...otp];
        data.split('').forEach((char, i) => {
            if (i < 6) newOtp[i] = char;
        });
        setOtp(newOtp);
        inputRefs[Math.min(data.length, 5)].current.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length !== 6) {
            setError('Please enter all 6 digits.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await confirmOtp({ email, otp: code });
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;
        setResending(true);
        setResendStatus('');
        try {
            const res = await requestNewOtp(email);
            setResendStatus(res.message);
            setTimer(60);
        } catch (err) {
            setError(err.message);
        } finally {
            setResending(false);
        }
    };

    const pageClass = 'bg-[#020617] text-white';
    const cardClass = 'bg-[#0f172a]/95 border border-slate-800 shadow-2xl backdrop-blur-xl';
    
    return (
        <div className={`min-h-screen flex items-center justify-center p-4 font-display ${pageClass}`}>
            <div className={`max-w-md w-full rounded-[32px] border p-8 md:p-12 text-center relative overflow-hidden ${cardClass}`}>
                {/* Decorative glow */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                
                <div className="mb-8">
                    <div className="h-16 w-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-blue-500 text-3xl">mark_email_read</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">Verify Repository</h1>
                    <p className="text-sm text-slate-400 font-medium">
                        Enter the encrypted sequence sent to <br/>
                        <span className="text-blue-400 font-bold">{email}</span>
                    </p>
                </div>

                {initialMessage && !error && !resendStatus && (
                    <div className="mb-6 p-4 rounded-xl bg-blue-600/5 border border-blue-600/10 text-blue-400 text-xs font-bold">
                        {initialMessage}
                    </div>
                )}

                {resendStatus && (
                    <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                        {resendStatus}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="flex justify-between gap-2">
                        {otp.map((digit, i) => (
                            <input
                                key={i}
                                ref={inputRefs[i]}
                                type="text"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleChange(i, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(i, e)}
                                onPaste={i === 0 ? handlePaste : undefined}
                                className="w-12 h-14 bg-[#030712] border border-slate-800 rounded-xl text-center text-xl font-black text-blue-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                            />
                        ))}
                    </div>

                    {error && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold flex items-center gap-2 justify-center">
                            <span className="material-symbols-outlined text-base">warning</span>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Decrypting...' : 'Authorize Access'}
                    </button>
                </form>

                <div className="mt-10 pt-8 border-t border-slate-800/50">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                        Didn't receive the package?
                    </p>
                    <button
                        onClick={handleResend}
                        disabled={resending || timer > 0}
                        className={`text-sm font-black transition-colors ${timer > 0 ? 'text-slate-700 cursor-not-allowed' : 'text-blue-400 hover:text-blue-300'}`}
                    >
                        {resending ? 'RE-TRANSMITTING...' : timer > 0 ? `RESEND AVAILABLE IN ${timer}S` : 'RE-SEND CODE'}
                    </button>
                    
                    <div className="mt-8">
                        <Link to="/login" className="text-[10px] text-slate-600 hover:text-white transition-colors flex items-center gap-1 justify-center font-bold italic">
                            <span className="material-symbols-outlined text-xs">arrow_back</span> Return to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VerifyOTPPage;
