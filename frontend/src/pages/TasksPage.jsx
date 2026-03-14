import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { get, post } from '../services/apiService';

const STATUSES = ['To Do', 'In Progress', 'Completed'];

function TasksPage() {
    const { projectId } = useParams();
    const { isDark } = useTheme();

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [addingTo, setAddingTo] = useState(null);
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [creating, setCreating] = useState(false);
    const [formError, setFormError] = useState('');

    const pageClass = isDark ? 'bg-stone-950 text-stone-100' : 'bg-amber-50 text-stone-900';
    const headerCardClass = isDark
        ? 'border-stone-700 bg-stone-900/85 shadow-[0_4px_18px_rgba(0,0,0,0.3)]'
        : 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-100 shadow-[0_4px_18px_rgba(67,43,20,0.12)]';
    const subtitleClass = isDark ? 'text-stone-300' : 'text-stone-600';
    const columnClass = isDark
        ? 'rounded-xl border border-stone-700 bg-stone-900/50 p-4 min-h-64'
        : 'rounded-xl border border-amber-200 bg-white/50 p-4 min-h-64';
    const taskCardClass = isDark
        ? 'rounded-lg border border-stone-700 bg-stone-800 p-3 mb-3'
        : 'rounded-lg border border-amber-200 bg-white p-3 mb-3 shadow-sm';
    const inputClass = isDark
        ? 'rounded-md border border-stone-600 bg-stone-800 px-2 py-1.5 text-stone-100 placeholder:text-stone-500 w-full text-sm focus:outline-none focus:ring-1 focus:ring-amber-600'
        : 'rounded-md border border-amber-300 bg-white px-2 py-1.5 text-stone-900 placeholder:text-stone-400 w-full text-sm focus:outline-none focus:ring-1 focus:ring-amber-500';
    const btnPrimary = 'rounded-lg border border-amber-700 bg-gradient-to-b from-amber-700 to-amber-900 px-3 py-1.5 text-xs text-amber-50 transition hover:-translate-y-0.5 font-semibold';
    const btnOutline = isDark
        ? 'rounded-lg border border-stone-600 bg-stone-800/70 px-3 py-1.5 text-xs text-stone-100 hover:bg-stone-700 transition'
        : 'rounded-lg border border-amber-200 bg-white/70 px-3 py-1.5 text-xs text-stone-900 hover:bg-white transition';
    const colHeaderColors = {
        'To Do': isDark ? 'text-stone-300' : 'text-stone-600',
        'In Progress': isDark ? 'text-amber-400' : 'text-amber-700',
        'Completed': isDark ? 'text-emerald-400' : 'text-emerald-700'
    };

    useEffect(() => {
        get(`/tasks/${projectId}`)
            .then(data => setTasks(data.tasks || []))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [projectId]);

    function openAddForm(status) {
        setAddingTo(status);
        setNewTitle('');
        setNewDesc('');
        setFormError('');
    }

    function closeAddForm() {
        setAddingTo(null);
        setNewTitle('');
        setNewDesc('');
        setFormError('');
    }

    async function handleAddTask(status) {
        if (!newTitle.trim()) { setFormError('Title is required.'); return; }
        setCreating(true);
        setFormError('');
        try {
            const data = await post('/tasks', {
                title: newTitle.trim(),
                description: newDesc.trim(),
                status,
                projectId
            });
            setTasks(prev => [data.task, ...prev]);
            closeAddForm();
        } catch (err) {
            setFormError(err.message);
        } finally {
            setCreating(false);
        }
    }

    function moveTaskNext(taskId, currentStatus) {
        const nextIndex = STATUSES.indexOf(currentStatus) + 1;
        if (nextIndex >= STATUSES.length) return;
        const nextStatus = STATUSES[nextIndex];
        setTasks(prev =>
            prev.map(t => t._id === taskId ? { ...t, status: nextStatus } : t)
        );
    }

    const tasksByStatus = status => tasks.filter(t => t.status === status);

    return (
        <div className={`min-h-screen px-4 py-8 font-serif ${pageClass}`}>
            <div className="mx-auto max-w-5xl">

                {/* Header */}
                <div className={`flex flex-wrap items-center justify-between rounded-2xl border px-6 py-4 mb-6 gap-4 ${headerCardClass}`}>
                    <div>
                        <h1 className="text-2xl font-semibold">Task Board</h1>
                        <p className={`text-xs mt-0.5 ${subtitleClass}`}>Project · {projectId}</p>
                    </div>
                    <div className="flex gap-2">
                        <Link to={`/projects/${projectId}/chat`} className={btnOutline.replace('text-xs', 'text-sm')}>
                            Chat
                        </Link>
                        <Link to="/projects" className={btnOutline.replace('text-xs', 'text-sm')}>
                            ← Projects
                        </Link>
                    </div>
                </div>

                {loading && <p className={subtitleClass}>Loading tasks…</p>}
                {!loading && error && <p className="text-red-500">{error}</p>}

                {/* Kanban Board */}
                {!loading && !error && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {STATUSES.map(status => (
                            <div key={status} className={columnClass}>
                                <h2 className={`mb-3 font-semibold text-sm tracking-wide uppercase ${colHeaderColors[status]}`}>
                                    {status}
                                    <span className={`ml-2 text-xs font-normal ${subtitleClass}`}>
                                        ({tasksByStatus(status).length})
                                    </span>
                                </h2>

                                {/* Task cards */}
                                {tasksByStatus(status).map(task => (
                                    <div key={task._id} className={taskCardClass}>
                                        <p className="font-medium text-sm leading-snug">{task.title}</p>
                                        {task.description && (
                                            <p className={`mt-1 text-xs ${subtitleClass}`}>{task.description}</p>
                                        )}
                                        {status !== 'Completed' && (
                                            <button
                                                onClick={() => moveTaskNext(task._id, status)}
                                                className={`mt-2 ${btnOutline}`}
                                            >
                                                → {STATUSES[STATUSES.indexOf(status) + 1]}
                                            </button>
                                        )}
                                    </div>
                                ))}

                                {/* Inline add form */}
                                {addingTo === status ? (
                                    <div className="mt-2">
                                        <input
                                            type="text"
                                            value={newTitle}
                                            onChange={e => setNewTitle(e.target.value)}
                                            placeholder="Task title…"
                                            className={`${inputClass} mb-1.5`}
                                            autoFocus
                                        />
                                        <input
                                            type="text"
                                            value={newDesc}
                                            onChange={e => setNewDesc(e.target.value)}
                                            placeholder="Description (optional)"
                                            className={`${inputClass} mb-2`}
                                        />
                                        {formError && <p className="mb-1.5 text-xs text-red-500">{formError}</p>}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAddTask(status)}
                                                disabled={creating}
                                                className={`${btnPrimary} disabled:opacity-60`}
                                            >
                                                {creating ? 'Adding…' : 'Add'}
                                            </button>
                                            <button onClick={closeAddForm} className={btnOutline}>
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => openAddForm(status)}
                                        className={`mt-2 w-full text-left text-xs ${subtitleClass} hover:opacity-75 transition`}
                                    >
                                        + Add task
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default TasksPage;
