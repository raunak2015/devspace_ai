import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { post } from '../services/apiService';

function AIAssistantPage() {
    const { user } = useAuth();
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [provider, setProvider] = useState('');
    const [retryAfterSeconds, setRetryAfterSeconds] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const pageClass = 'bg-[#020617] text-white';
    const cardClass = 'bg-[#0f172a]/80 border border-slate-800 shadow-xl backdrop-blur-sm';
    const subtitleClass = 'text-slate-400';
    const textareaClass = 'w-full rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 text-white placeholder:text-slate-600 resize-y font-mono text-sm leading-relaxed focus:outline-none focus:ring-1 focus:ring-blue-500/50 shadow-inner min-h-[250px] transition-all';
    const responseClass = 'w-full rounded-xl border border-slate-700 bg-[#0f172a] px-5 py-5 text-slate-200 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words border border-slate-800 shadow-xl';
    const btnPrimary = 'rounded-xl border border-blue-600 bg-blue-600 hover:bg-blue-500 px-8 py-3 text-white transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 font-bold disabled:opacity-60 shadow-lg flex items-center gap-2';

    async function handleAsk(e) {
        e.preventDefault();
        const trimmed = prompt.trim();
        if (!trimmed) return;
        setLoading(true);
        setError('');
        setResponse('');
        setProvider('');
        setRetryAfterSeconds(null);
        try {
            const data = await post('/ai/explain', { prompt: trimmed });
            setResponse(data.explanation || data.message || 'No response received.');
            setProvider(data.provider || '');
        } catch (err) {
            setError(err.message);
            setRetryAfterSeconds(err.retryAfterSeconds || null);
        } finally {
            setLoading(false);
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
                                placeholder="Ask anything..."
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
                                <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-blue-600/10 hover:text-blue-400 transition-all group">
                                    <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">dashboard</span>
                                    <span className="text-sm font-medium hidden md:inline">Dashboard</span>
                                </Link>
                                <Link to="/projects" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-blue-600/10 hover:text-blue-400 transition-all group">
                                    <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">folder_special</span>
                                    <span className="text-sm font-medium hidden md:inline">Projects</span>
                                </Link>
                                <Link to="/ai" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-600/10 text-blue-400 font-semibold border border-blue-600/30 shadow-[0_0_15px_rgba(37,99,235,0.1)]">
                                    <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                                    <span className="text-sm hidden md:inline">AI Assistant</span>
                                </Link>
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
                        {/* Background decorative elements */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>
                        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[80px] pointer-events-none"></div>

                        <div className="max-w-5xl mx-auto flex flex-col gap-8 relative z-10">
                            {/* Page Header */}
                            <div className="flex flex-col sm:flex-row items-center justify-between pb-4 border-b border-slate-800/50 gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                                        <span className="material-symbols-outlined text-blue-500 text-3xl">psychology</span>
                                        Intelligence Center
                                    </h1>
                                    <p className={`mt-1 text-sm ${subtitleClass}`}>Get expert help with explanation, debugging, and code generation.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                {/* Input Panel */}
                                <div className="xl:col-span-2 space-y-6">
                                    <form onSubmit={handleAsk} className={`${cardClass} rounded-2xl p-6 sm:p-8 space-y-6`}>
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <label className={`text-sm font-semibold text-slate-300`}>Your Request</label>
                                                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-xs">info</span>
                                                    Supports Markdown & Code
                                                </span>
                                            </div>
                                            <textarea
                                                value={prompt}
                                                onChange={e => setPrompt(e.target.value)}
                                                placeholder={'// Paste your code snippet here...\n\nHow does this function work?\nIs there a memory leak here?'}
                                                className={textareaClass}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                                                <span className="text-[11px] text-slate-400 font-medium">Model: Advanced-Agentic-V1</span>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={loading || !prompt.trim()}
                                                className={btnPrimary}
                                            >
                                                {loading ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                        Analyzing...
                                                    </div>
                                                ) : (
                                                    <>
                                                        <span className="material-symbols-outlined text-[20px]">bolt</span>
                                                        Generate Solution
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>

                                    {/* Error Message */}
                                    {error && (
                                        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 flex items-start gap-3">
                                            <span className="material-symbols-outlined text-red-500">error</span>
                                            <div>
                                                <p className="text-sm font-semibold text-red-500">{error}</p>
                                                {retryAfterSeconds && (
                                                    <p className="text-xs text-red-400/80 mt-1">Please wait {retryAfterSeconds}s before next attempt.</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Result Area */}
                                    {response && (
                                        <div className="animate-[fadeIn_0.5s_ease-out] space-y-3">
                                            <div className="flex items-center justify-between px-2">
                                                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-emerald-500 text-lg">auto_awesome</span>
                                                    AI Response
                                                </h3>
                                                {provider && (
                                                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{provider} ENGINE</span>
                                                )}
                                            </div>
                                            <div className={responseClass}>
                                                {response}
                                            </div>
                                            <div className="flex justify-end pr-2">
                                                <button className="text-[11px] text-slate-500 hover:text-blue-400 flex items-center gap-1 transition-colors">
                                                    <span className="material-symbols-outlined text-sm">content_copy</span>
                                                    Copy to Clipboard
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Sidebar / Info Panel */}
                                <div className="space-y-6">
                                    <div className={`${cardClass} rounded-2xl p-6`}>
                                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-blue-500">tips_and_updates</span>
                                            Capabilities
                                        </h3>
                                        <ul className="space-y-4">
                                            {[
                                                { title: 'Code Explanation', desc: 'Understanding complex logic or legacy systems.', icon: 'description' },
                                                { title: 'Bug Detection', desc: 'Finding logical errors and syntax issues.', icon: 'bug_report' },
                                                { title: 'Refactoring', desc: 'Improving code quality and performance.', icon: 'rebase_edit' },
                                                { title: 'Documentation', desc: 'Generating comments and README content.', icon: 'menu_book' }
                                            ].map((cap) => (
                                                <li key={cap.title} className="flex gap-3">
                                                    <span className="material-symbols-outlined text-blue-400/70 text-[20px]">{cap.icon}</span>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-200">{cap.title}</p>
                                                        <p className="text-[11px] text-slate-500 mt-0.5">{cap.desc}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className={`${cardClass} rounded-2xl p-6 bg-gradient-to-br from-blue-600/10 to-transparent`}>
                                        <h3 className="text-white font-bold mb-2">Need a faster response?</h3>
                                        <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">Ensure you have your environment variables configured for direct API access to specialized LLM providers.</p>
                                        <div className="bg-[#020617] rounded-lg p-3 font-mono text-[10px] text-blue-400 border border-slate-800">
                                            AI_PROVIDER=gemini<br/>
                                            AI_API_KEY=your_key_here
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

export default AIAssistantPage;
