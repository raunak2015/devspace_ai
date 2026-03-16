import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { del, get, post } from '../services/apiService';

function ChatPage() {
    const { projectId } = useParams();
    const { user } = useAuth();

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [project, setProject] = useState(null);
    const [error, setError] = useState('');
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [deletingMessageId, setDeletingMessageId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const bottomRef = useRef(null);
    const skipAutoScrollRef = useRef(false);

    const pageClass = 'bg-[#020617] text-white';
    const cardClass = 'bg-[#0f172a]/80 border border-slate-800 shadow-xl backdrop-blur-md';
    const subtitleClass = 'text-slate-400';
    const bubbleMine = 'bg-blue-600/90 text-white self-end rounded-2xl rounded-br-sm px-4 py-2 max-w-xs sm:max-w-sm text-sm shadow-[0_0_15px_rgba(37,99,235,0.2)]';
    const bubbleOther = 'bg-[#1e293b] text-slate-100 self-start rounded-2xl rounded-bl-sm px-4 py-2 max-w-xs sm:max-w-sm text-sm border border-slate-700';
    const inputClass = 'flex-1 rounded-xl border border-slate-700 bg-[#020617] px-4 py-2.5 text-white placeholder:text-slate-500 resize-none text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all';
    const btnOutline = 'rounded-lg border border-slate-700 bg-[#1e293b]/70 px-3 py-1.5 text-sm text-white hover:bg-slate-700 transition-all';
    const btnSend = 'rounded-xl border border-blue-600 bg-blue-600 hover:bg-blue-500 h-10 w-10 text-white transition-all hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 flex items-center justify-center font-bold disabled:opacity-60 shadow-lg';
    
    const senderName = user?.name || user?.email || 'Anonymous';
    const senderEmail = user?.email || '';

    useEffect(() => {
        setLoading(true);
        setError('');

        Promise.all([
            get(`/messages/${projectId}?page=1&limit=20`),
            get('/projects')
        ])
            .then(([messagesData, projectsData]) => {
                const sorted = (messagesData.messages || []).slice().reverse();
                setMessages(sorted);
                setPage(1);
                setHasMore((messagesData?.pagination?.page || 1) < (messagesData?.pagination?.totalPages || 1));

                const matchedProject = (projectsData.projects || []).find((item) => item._id === projectId) || null;
                setProject(matchedProject);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [projectId]);

    const ownerLabel = project
        ? (project.ownerName || project.ownerEmail || project.owner || 'Unknown')
        : 'Loading...';
    const memberList = Array.isArray(project?.members) ? project.members : [];

    useEffect(() => {
        if (skipAutoScrollRef.current) {
            skipAutoScrollRef.current = false;
            return;
        }
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    async function handleLoadOlder() {
        if (!hasMore || loadingMore) return;
        const nextPage = page + 1;
        setLoadingMore(true);
        setError('');
        try {
            const data = await get(`/messages/${projectId}?page=${nextPage}&limit=20`);
            const olderMessages = (data.messages || []).slice().reverse();
            skipAutoScrollRef.current = true;
            setMessages((prev) => {
                const existingIds = new Set(prev.map((item) => item._id));
                const uniqueOlder = olderMessages.filter((item) => !existingIds.has(item._id));
                return [...uniqueOlder, ...prev];
            });
            setPage(nextPage);
            setHasMore((data?.pagination?.page || nextPage) < (data?.pagination?.totalPages || nextPage));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingMore(false);
        }
    }

    async function handleSend(e) {
        e.preventDefault();
        const trimmed = text.trim();
        if (!trimmed || sending) return;
        setSending(true);
        try {
            const data = await post('/messages', {
                projectId,
                sender: senderName,
                message: trimmed
            });
            setMessages(prev => [...prev, data.data]);
            setText('');
        } catch {
            // silent – message not added
        } finally {
            setSending(false);
        }
    }

    async function handleDeleteMessage(messageId) {
        const confirmed = window.confirm('Delete this message?');
        if (!confirmed) return;
        setDeletingMessageId(messageId);
        setError('');
        try {
            await del(`/messages/${messageId}`);
            setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
        } catch (err) {
            setError(err.message);
        } finally {
            setDeletingMessageId('');
        }
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(e);
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
                                placeholder="Search messages..."
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
                                <Link to="/ai" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-blue-600/10 hover:text-blue-400 transition-all group">
                                    <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">smart_toy</span>
                                    <span className="text-sm font-medium hidden md:inline">AI Assistant</span>
                                </Link>
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 overflow-y-auto flex flex-col relative bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.02),transparent_50%)]">
                        {/* Page Header */}
                        <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b border-slate-800/50 gap-4 bg-[#030712]/30 backdrop-blur-sm sticky top-0 z-20">
                            <div>
                                <h1 className="text-xl font-bold flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blue-500">forum</span>
                                    {project?.title || 'Project Chat'}
                                </h1>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Members: {memberList.length}</span>
                                    <div className="h-1 w-1 rounded-full bg-slate-700"></div>
                                    <span className="text-[10px] font-medium text-slate-400">Leader: {ownerLabel}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Link to={`/projects/${projectId}/files`} className="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-xs text-white hover:bg-slate-700 transition-all flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">code</span> Code
                                </Link>
                                <Link to={`/projects/${projectId}/tasks`} className="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-xs text-white hover:bg-slate-700 transition-all flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">assignment</span> Tasks
                                </Link>
                                <Link to="/projects" className="rounded-lg border border-slate-700 bg-[#020617] px-3 py-1.5 text-xs text-white hover:bg-slate-800 transition-all flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </Link>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">
                            {loading && (
                                <div className="flex justify-center p-8">
                                    <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                            {!loading && error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm flex items-center gap-3">
                                    <span className="material-symbols-outlined">error</span>
                                    {error}
                                </div>
                            )}
                            
                            {!loading && hasMore && (
                                <button
                                    onClick={handleLoadOlder}
                                    disabled={loadingMore}
                                    className="mx-auto text-[10px] font-bold text-slate-500 hover:text-blue-400 uppercase tracking-widest transition-colors flex items-center gap-2"
                                >
                                    {loadingMore ? 'Syncing Older Messages...' : '↑ Load Chat History'}
                                </button>
                            )}

                            {!loading && !error && messages.length === 0 && (
                                <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                                    <span className="material-symbols-outlined text-6xl mb-4">chat_bubble</span>
                                    <p className="text-xl font-semibold">Start the conversation</p>
                                    <p className="text-sm mt-1">Messages are end-to-end synchronized.</p>
                                </div>
                            )}

                            {messages.map((msg, idx) => {
                                const messageSender = String(msg.sender || '').trim();
                                const normalizedSender = messageSender.toLowerCase();
                                const isMe = normalizedSender === senderName.toLowerCase() || (senderEmail && normalizedSender === senderEmail.toLowerCase());

                                const fullDateTime = new Date(msg.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                });

                                return (
                                    <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}>
                                        <div className={`flex items-baseline gap-2 mb-1.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <span className="text-[11px] font-bold text-slate-300">{isMe ? 'You' : messageSender}</span>
                                            <span className="text-[10px] text-slate-600 font-medium">{fullDateTime}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 max-w-[85%] sm:max-w-md">
                                            <div className={isMe ? bubbleMine : bubbleOther}>
                                                {msg.message}
                                            </div>
                                            {isMe && (
                                                <button
                                                    onClick={() => handleDeleteMessage(msg._id)}
                                                    disabled={deletingMessageId === msg._id}
                                                    className="opacity-0 group-hover:opacity-100 h-8 w-8 rounded-full flex items-center justify-center text-slate-600 hover:text-red-500 hover:bg-red-500/10 transition-all shrink-0"
                                                    title="Delete message"
                                                >
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={bottomRef} className="h-4" />
                        </div>

                        {/* Input Form */}
                        <div className="px-6 py-6 bg-[#030712]/50 border-t border-slate-800/50 backdrop-blur-md">
                            <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-end gap-3">
                                <textarea
                                    value={text}
                                    onChange={e => setText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Synthesize a message..."
                                    rows={1}
                                    className={inputClass}
                                />
                                <button
                                    type="submit"
                                    disabled={sending || !text.trim()}
                                    className={btnSend}
                                >
                                    {sending ? (
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <span className="material-symbols-outlined">send</span>
                                    )}
                                </button>
                            </form>
                            <div className="max-w-4xl mx-auto mt-2 flex justify-between items-center">
                                <p className="text-[10px] text-slate-600 font-medium">Shift + Enter for new line</p>
                                <div className="flex gap-4">
                                    <span className="material-symbols-outlined text-slate-700 text-sm hover:text-slate-400 cursor-pointer transition-colors">attach_file</span>
                                    <span className="material-symbols-outlined text-slate-700 text-sm hover:text-slate-400 cursor-pointer transition-colors">mood</span>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

export default ChatPage;
