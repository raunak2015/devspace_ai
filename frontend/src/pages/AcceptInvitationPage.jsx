import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { post } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

function AcceptInvitationPage() {
    const { token } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');
    const [projectName, setProjectName] = useState('');
    const [projectId, setProjectId] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid invitation link.');
            return;
        }

        const verifyAndAccept = async () => {
            try {
                const response = await post('/projects/accept-invitation', { token });
                setStatus('success');
                setMessage(response.message);
                setProjectName(response.projectName);
                setProjectId(response.projectId);
            } catch (err) {
                setStatus('error');
                setMessage(err.message || 'Failed to accept invitation.');
            }
        };

        verifyAndAccept();
    }, [token]);

    const pageClass = 'bg-[#020617] text-white';
    const cardClass = 'bg-[#0f172a]/95 border border-slate-800 shadow-2xl backdrop-blur-xl';

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 font-display ${pageClass}`}>
            <div className={`max-w-md w-full rounded-[32px] border p-8 md:p-12 text-center relative overflow-hidden ${cardClass}`}>
                {/* Decorative glow */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                
                <div className="mb-8">
                    <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
                        status === 'verifying' ? 'bg-blue-600/10 border-blue-500/20' : 
                        status === 'success' ? 'bg-emerald-600/10 border-emerald-500/20' : 
                        'bg-red-600/10 border-red-500/20'
                    } border`}>
                        <span className={`material-symbols-outlined text-3xl ${
                            status === 'verifying' ? 'text-blue-500 anim-pulse' : 
                            status === 'success' ? 'text-emerald-500' : 
                            'text-red-500'
                        }`}>
                            {status === 'verifying' ? 'sync' : status === 'success' ? 'verified' : 'error'}
                        </span>
                    </div>
                    
                    <h1 className="text-3xl font-black tracking-tight mb-2">
                        {status === 'verifying' ? 'Syncing Node...' : 
                         status === 'success' ? 'Access Granted' : 
                         'Gate Blocked'}
                    </h1>
                    
                    <p className="text-sm text-slate-400 font-medium">
                        {status === 'verifying' ? 'Verifying your collaboration token...' : message}
                    </p>
                </div>

                {status === 'success' && (
                    <div className="space-y-6">
                        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-sm font-bold">
                            You are now a member of <span className="text-white">"${projectName}"</span>.
                        </div>
                        
                        <button
                            onClick={() => navigate(`/projects/${projectId}/tasks`)}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95"
                        >
                            Enter Workspace
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-6">
                        <Link
                            to="/projects"
                            className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest text-sm rounded-xl transition-all block text-center"
                        >
                            Return to Storage
                        </Link>
                    </div>
                )}

                <div className="mt-10 pt-8 border-t border-slate-800/50">
                    <div className="flex items-center justify-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                        <span className="h-1 w-1 rounded-full bg-slate-700"></span>
                        DevSpace Protocol
                        <span className="h-1 w-1 rounded-full bg-slate-700"></span>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes pulse-slow {
                    0%, 100% { opacity: 1; transform: rotate(0deg); }
                    50% { opacity: 0.5; transform: rotate(180deg); }
                }
                .anim-pulse {
                    animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}} />
        </div>
    );
}

export default AcceptInvitationPage;
