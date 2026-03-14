import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { post } from '../services/apiService';

function AIAssistantPage() {
    const { isDark } = useTheme();

    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const pageClass = isDark ? 'bg-stone-950 text-stone-100' : 'bg-amber-50 text-stone-900';
    const cardClass = isDark
        ? 'border-stone-700 bg-stone-900/85 shadow-[0_18px_42px_rgba(0,0,0,0.35)]'
        : 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-100 shadow-[0_18px_42px_rgba(67,43,20,0.18)]';
    const subtitleClass = isDark ? 'text-stone-300' : 'text-stone-600';
    const textareaClass = isDark
        ? 'w-full rounded-xl border border-stone-600 bg-stone-800 px-4 py-3 text-stone-100 placeholder:text-stone-500 resize-y font-mono text-sm leading-relaxed focus:outline-none focus:ring-1 focus:ring-amber-600'
        : 'w-full rounded-xl border border-amber-300 bg-white px-4 py-3 text-stone-900 placeholder:text-stone-400 resize-y font-mono text-sm leading-relaxed focus:outline-none focus:ring-1 focus:ring-amber-500';
    const responseClass = isDark
        ? 'w-full rounded-xl border border-stone-600 bg-stone-800/50 px-4 py-4 text-stone-200 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words'
        : 'w-full rounded-xl border border-amber-200 bg-white/70 px-4 py-4 text-stone-800 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words';
    const btnPrimary = 'rounded-xl border border-amber-700 bg-gradient-to-b from-amber-700 to-amber-900 px-6 py-2.5 text-amber-50 transition hover:-translate-y-0.5 font-semibold disabled:opacity-60';
    const btnOutline = isDark
        ? 'rounded-lg border border-stone-600 bg-stone-800/70 px-3 py-1.5 text-sm text-stone-100 hover:bg-stone-700 transition'
        : 'rounded-lg border border-amber-200 bg-white/70 px-3 py-1.5 text-sm text-stone-900 hover:bg-white transition';

    async function handleAsk(e) {
        e.preventDefault();
        const trimmed = prompt.trim();
        if (!trimmed) return;
        setLoading(true);
        setError('');
        setResponse('');
        try {
            const data = await post('/ai/explain', { prompt: trimmed });
            setResponse(data.explanation || data.message || 'No response received.');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={`min-h-screen px-4 py-8 font-serif ${pageClass}`}>
            <div className={`mx-auto max-w-3xl rounded-2xl border p-6 sm:p-8 ${cardClass}`}>

                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl">AI Assistant</h1>
                        <p className={`mt-1 text-sm ${subtitleClass}`}>Explain code, debug issues, or ask anything</p>
                    </div>
                    <Link to="/dashboard" className={btnOutline}>← Dashboard</Link>
                </div>

                {/* Prompt Form */}
                <form onSubmit={handleAsk} className="space-y-4">
                    <div>
                        <label className={`block text-sm mb-2 ${subtitleClass}`}>
                            Paste your code or describe the problem
                        </label>
                        <textarea
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            placeholder={'// paste code here…\nfunction example() {\n  return "hello";\n}'}
                            rows={10}
                            className={textareaClass}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !prompt.trim()}
                        className={btnPrimary}
                    >
                        {loading ? 'Thinking…' : 'Ask AI'}
                    </button>
                </form>

                {/* Error */}
                {error && (
                    <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3">
                        <p className="text-sm text-red-500">{error}</p>
                        {(error.toLowerCase().includes('not configured') || error.toLowerCase().includes('ai provider')) && (
                            <p className={`mt-1.5 text-xs ${subtitleClass}`}>
                                Set <code className="font-mono">AI_PROVIDER</code> and{' '}
                                <code className="font-mono">AI_API_KEY</code> in{' '}
                                <code className="font-mono">backend/.env</code> to enable real AI responses.
                            </p>
                        )}
                    </div>
                )}

                {/* Response */}
                {response && (
                    <div className="mt-6">
                        <h2 className={`text-xs uppercase tracking-wide mb-2 ${subtitleClass}`}>Response</h2>
                        <div className={responseClass}>{response}</div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default AIAssistantPage;
