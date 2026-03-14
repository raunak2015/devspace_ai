import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { get, post } from '../services/apiService';

function ChatPage() {
    const { projectId } = useParams();
    const { user } = useAuth();
    const { isDark } = useTheme();

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const bottomRef = useRef(null);

    const pageClass = isDark ? 'bg-stone-950 text-stone-100' : 'bg-amber-50 text-stone-900';
    const cardClass = isDark
        ? 'border-stone-700 bg-stone-900/85 shadow-[0_18px_42px_rgba(0,0,0,0.35)]'
        : 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-100 shadow-[0_18px_42px_rgba(67,43,20,0.18)]';
    const subtitleClass = isDark ? 'text-stone-300' : 'text-stone-600';
    const bubbleMine = isDark
        ? 'bg-amber-800/80 text-amber-50 self-end rounded-2xl rounded-br-sm px-4 py-2 max-w-xs sm:max-w-sm text-sm'
        : 'bg-amber-700 text-white self-end rounded-2xl rounded-br-sm px-4 py-2 max-w-xs sm:max-w-sm text-sm';
    const bubbleOther = isDark
        ? 'bg-stone-700 text-stone-100 self-start rounded-2xl rounded-bl-sm px-4 py-2 max-w-xs sm:max-w-sm text-sm'
        : 'bg-white text-stone-900 self-start rounded-2xl rounded-bl-sm px-4 py-2 max-w-xs sm:max-w-sm text-sm shadow-sm';
    const inputClass = isDark
        ? 'flex-1 rounded-xl border border-stone-600 bg-stone-800 px-4 py-2 text-stone-100 placeholder:text-stone-500 resize-none text-sm focus:outline-none focus:ring-1 focus:ring-amber-600'
        : 'flex-1 rounded-xl border border-amber-300 bg-white px-4 py-2 text-stone-900 placeholder:text-stone-400 resize-none text-sm focus:outline-none focus:ring-1 focus:ring-amber-500';
    const btnOutline = isDark
        ? 'rounded-lg border border-stone-600 bg-stone-800/70 px-3 py-1.5 text-sm text-stone-100 hover:bg-stone-700 transition'
        : 'rounded-lg border border-amber-200 bg-white/70 px-3 py-1.5 text-sm text-stone-900 hover:bg-white transition';
    const btnSend = 'rounded-xl border border-amber-700 bg-gradient-to-b from-amber-700 to-amber-900 px-4 py-2 text-amber-50 transition hover:-translate-y-0.5 text-sm font-semibold self-end';
    const dividerClass = isDark ? 'border-stone-700' : 'border-amber-200';

    const senderName = user?.name || user?.email || 'Anonymous';

    useEffect(() => {
        get(`/messages/${projectId}`)
            .then(data => {
                const sorted = (data.messages || []).slice().reverse();
                setMessages(sorted);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [projectId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

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

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(e);
        }
    }

    return (
        <div className={`min-h-screen px-4 py-8 font-serif ${pageClass}`}>
            <div className={`mx-auto max-w-3xl flex flex-col rounded-2xl border overflow-hidden ${cardClass}`} style={{ height: 'calc(100vh - 4rem)' }}>

                {/* Header */}
                <div className={`flex flex-wrap items-center justify-between px-6 py-4 border-b gap-3 ${dividerClass}`}>
                    <div>
                        <h1 className="text-xl font-semibold">Project Chat</h1>
                        <p className={`text-xs mt-0.5 truncate max-w-xs ${subtitleClass}`}>{projectId}</p>
                    </div>
                    <div className="flex gap-2">
                        <Link to={`/projects/${projectId}/tasks`} className={btnOutline}>Tasks</Link>
                        <Link to="/projects" className={btnOutline}>← Projects</Link>
                    </div>
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
                    {loading && <p className={subtitleClass}>Loading messages…</p>}
                    {!loading && error && <p className="text-red-500">{error}</p>}
                    {!loading && !error && messages.length === 0 && (
                        <p className={`text-sm ${subtitleClass}`}>No messages yet — start the conversation!</p>
                    )}
                    {messages.map(msg => {
                        const isMe = msg.sender === senderName;
                        return (
                            <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                {!isMe && (
                                    <span className={`text-xs mb-0.5 ${subtitleClass}`}>{msg.sender}</span>
                                )}
                                <div className={isMe ? bubbleMine : bubbleOther}>{msg.message}</div>
                                <span className={`text-xs mt-0.5 ${subtitleClass}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        );
                    })}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <form
                    onSubmit={handleSend}
                    className={`flex items-end gap-3 border-t px-6 py-4 ${dividerClass}`}
                >
                    <textarea
                        value={text}
                        onChange={e => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
                        rows={2}
                        className={inputClass}
                    />
                    <button
                        type="submit"
                        disabled={sending || !text.trim()}
                        className={`${btnSend} disabled:opacity-60`}
                    >
                        {sending ? '…' : 'Send'}
                    </button>
                </form>

            </div>
        </div>
    );
}

export default ChatPage;
