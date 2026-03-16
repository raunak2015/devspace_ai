import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { del, get, patch, post } from '../services/apiService';

const STATUSES = ['To Do', 'In Progress', 'Completed'];

function TasksPage() {
    const { projectId } = useParams();
    const { isDark } = useTheme();

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 10 });
    const [searchTerm, setSearchTerm] = useState('');
    const [addingTo, setAddingTo] = useState(null);
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newAssignee, setNewAssignee] = useState('');
    const [newDeadline, setNewDeadline] = useState('');
    const [creating, setCreating] = useState(false);
    const [formError, setFormError] = useState('');
    const [updatingTaskId, setUpdatingTaskId] = useState('');
    const [deletingTaskId, setDeletingTaskId] = useState('');
    const [editingTaskId, setEditingTaskId] = useState('');
    const [editTitle, setEditTitle] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editAssignee, setEditAssignee] = useState('');
    const [editDeadline, setEditDeadline] = useState('');
    const [savingEdit, setSavingEdit] = useState(false);

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

    async function loadTasks(targetPage, showLoader = true) {
        if (showLoader) {
            setLoading(true);
        }

        setError('');

        try {
            const query = searchTerm.trim();
            const searchParam = query ? `&q=${encodeURIComponent(query)}` : '';
            const data = await get(`/tasks/${projectId}?page=${targetPage}&limit=10${searchParam}`);
            setTasks(data.tasks || []);
            setPagination(data.pagination || { page: targetPage, totalPages: 1, total: 0, limit: 10 });
        } catch (err) {
            setError(err.message);
        } finally {
            if (showLoader) {
                setLoading(false);
            }
        }
    }

    useEffect(() => {
        loadTasks(page, true);
    }, [projectId, page]);

    useEffect(() => {
        setPage(1);
    }, [searchTerm]);

    function openAddForm(status) {
        setAddingTo(status);
        setNewTitle('');
        setNewDesc('');
        setNewAssignee('');
        setNewDeadline('');
        setFormError('');
    }

    function closeAddForm() {
        setAddingTo(null);
        setNewTitle('');
        setNewDesc('');
        setNewAssignee('');
        setNewDeadline('');
        setFormError('');
    }

    async function handleAddTask(status) {
        if (!newTitle.trim()) { setFormError('Title is required.'); return; }
        setCreating(true);
        setFormError('');
        try {
            await post('/tasks', {
                title: newTitle.trim(),
                description: newDesc.trim(),
                assignedTo: newAssignee.trim(),
                deadline: newDeadline || null,
                status,
                projectId
            });

            if (page === 1) {
                await loadTasks(1, false);
            } else {
                setPage(1);
            }

            closeAddForm();
        } catch (err) {
            setFormError(err.message);
        } finally {
            setCreating(false);
        }
    }

    async function moveTaskNext(taskId, currentStatus) {
        const nextIndex = STATUSES.indexOf(currentStatus) + 1;
        if (nextIndex >= STATUSES.length) return;
        const nextStatus = STATUSES[nextIndex];

        setUpdatingTaskId(taskId);

        // Optimistic UI update for snappy task movement.
        setTasks(prev =>
            prev.map(t => t._id === taskId ? { ...t, status: nextStatus } : t)
        );

        try {
            await patch(`/tasks/${taskId}/status`, { status: nextStatus });
        } catch (err) {
            setTasks(prev =>
                prev.map(t => t._id === taskId ? { ...t, status: currentStatus } : t)
            );
            setError(err.message);
        } finally {
            setUpdatingTaskId('');
        }
    }

    async function handleDeleteTask(taskId, title) {
        const confirmed = window.confirm(`Delete task "${title}"?`);
        if (!confirmed) return;

        const previousTasks = tasks;
        setDeletingTaskId(taskId);
        setError('');
        setTasks((prev) => prev.filter((task) => task._id !== taskId));

        try {
            await del(`/tasks/${taskId}`);

            if (previousTasks.length === 1 && page > 1) {
                setPage((prev) => prev - 1);
            } else {
                await loadTasks(page, false);
            }
        } catch (err) {
            setTasks(previousTasks);
            setError(err.message);
        } finally {
            setDeletingTaskId('');
        }
    }

    const normalizedSearch = searchTerm.trim().toLowerCase();
    const tasksByStatus = status => tasks.filter((task) => {
        if (task.status !== status) {
            return false;
        }

        if (!normalizedSearch) {
            return true;
        }

        const haystack = [task.title, task.description, task.assignedTo]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

        return haystack.includes(normalizedSearch);
    });

    const formatDeadline = (value) => {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        return date.toLocaleDateString();
    };

    const isOverdue = (task) => {
        if (!task?.deadline || task.status === 'Completed') return false;
        const deadlineDate = new Date(task.deadline);
        if (Number.isNaN(deadlineDate.getTime())) return false;
        return deadlineDate.getTime() < Date.now();
    };

    const formatDeadlineInput = (value) => {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0];
    };

    const startEditTask = (task) => {
        setEditingTaskId(task._id);
        setEditTitle(task.title || '');
        setEditDesc(task.description || '');
        setEditAssignee(task.assignedTo || '');
        setEditDeadline(formatDeadlineInput(task.deadline));
        setFormError('');
        setError('');
    };

    const cancelEditTask = () => {
        setEditingTaskId('');
        setEditTitle('');
        setEditDesc('');
        setEditAssignee('');
        setEditDeadline('');
        setSavingEdit(false);
    };

    const saveTaskEdit = async (taskId) => {
        const trimmedTitle = editTitle.trim();
        if (!trimmedTitle) {
            setFormError('Title is required.');
            return;
        }

        setSavingEdit(true);
        setFormError('');

        try {
            const data = await patch(`/tasks/${taskId}`, {
                title: trimmedTitle,
                description: editDesc.trim(),
                assignedTo: editAssignee.trim(),
                deadline: editDeadline || null
            });

            setTasks((prev) => prev.map((task) => (task._id === taskId ? data.task : task)));
            cancelEditTask();
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSavingEdit(false);
        }
    };

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
                        <Link to={`/projects/${projectId}/files`} className={btnOutline.replace('text-xs', 'text-sm')}>
                            Code
                        </Link>
                        <Link to={`/projects/${projectId}/chat`} className={btnOutline.replace('text-xs', 'text-sm')}>
                            Chat
                        </Link>
                        <Link to="/projects" className={btnOutline.replace('text-xs', 'text-sm')}>
                            ← Projects
                        </Link>
                    </div>
                </div>

                <div className="mb-4">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search tasks, descriptions, or assignee"
                        className={inputClass}
                    />
                </div>

                {loading && <p className={subtitleClass}>Loading tasks…</p>}
                {!loading && error && <p className="text-red-500">{error}</p>}

                {!loading && !error && (
                    <div className="mb-4 flex items-center justify-between rounded-xl border border-amber-200/40 px-4 py-2 text-xs sm:text-sm">
                        <p className={subtitleClass}>Page {pagination.page} of {pagination.totalPages} · {pagination.total} tasks</p>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                disabled={page <= 1}
                                className={`${btnOutline} disabled:opacity-60`}
                            >
                                Prev
                            </button>
                            <button
                                type="button"
                                onClick={() => setPage((prev) => Math.min(prev + 1, pagination.totalPages || 1))}
                                disabled={page >= (pagination.totalPages || 1)}
                                className={`${btnOutline} disabled:opacity-60`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

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
                                    <div
                                        key={task._id}
                                        className={`${taskCardClass} ${isOverdue(task) ? 'ring-1 ring-red-500/60 bg-red-500/5' : ''}`}
                                    >
                                        {editingTaskId === task._id ? (
                                            <div className="space-y-2">
                                                <input
                                                    type="text"
                                                    value={editTitle}
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                    className={inputClass}
                                                    placeholder="Task title"
                                                />
                                                <input
                                                    type="text"
                                                    value={editDesc}
                                                    onChange={(e) => setEditDesc(e.target.value)}
                                                    className={inputClass}
                                                    placeholder="Description"
                                                />
                                                <input
                                                    type="text"
                                                    value={editAssignee}
                                                    onChange={(e) => setEditAssignee(e.target.value)}
                                                    className={inputClass}
                                                    placeholder="Assignee"
                                                />
                                                <input
                                                    type="date"
                                                    value={editDeadline}
                                                    onChange={(e) => setEditDeadline(e.target.value)}
                                                    className={inputClass}
                                                />
                                                {formError && <p className="text-xs text-red-500">{formError}</p>}
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => saveTaskEdit(task._id)}
                                                        disabled={savingEdit}
                                                        className={`${btnPrimary} disabled:opacity-60`}
                                                    >
                                                        {savingEdit ? 'Saving…' : 'Save'}
                                                    </button>
                                                    <button type="button" onClick={cancelEditTask} className={btnOutline}>
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="font-medium text-sm leading-snug">{task.title}</p>
                                                    {isOverdue(task) && (
                                                        <span className="rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-red-500">
                                                            Overdue
                                                        </span>
                                                    )}
                                                </div>
                                                {task.description && (
                                                    <p className={`mt-1 text-xs ${subtitleClass}`}>{task.description}</p>
                                                )}
                                                {task.assignedTo && (
                                                    <p className={`mt-1 text-xs ${subtitleClass}`}>Assigned to {task.assignedTo}</p>
                                                )}
                                                {task.deadline && (
                                                    <p className={`mt-1 text-xs ${subtitleClass}`}>Due {formatDeadline(task.deadline)}</p>
                                                )}
                                                {status !== 'Completed' && (
                                                    <button
                                                        onClick={() => moveTaskNext(task._id, status)}
                                                        disabled={updatingTaskId === task._id || deletingTaskId === task._id || editingTaskId === task._id}
                                                        className={`mt-2 ${btnOutline} disabled:opacity-60`}
                                                    >
                                                        {updatingTaskId === task._id ? 'Updating…' : `→ ${STATUSES[STATUSES.indexOf(status) + 1]}`}
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => startEditTask(task)}
                                                    disabled={editingTaskId === task._id}
                                                    className="mt-2 rounded-lg border border-amber-500/60 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-600 transition hover:bg-amber-500/20 disabled:opacity-60"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteTask(task._id, task.title)}
                                                    disabled={deletingTaskId === task._id}
                                                    className="mt-2 rounded-lg border border-red-500/70 bg-red-500/10 px-3 py-1.5 text-xs text-red-500 transition hover:bg-red-500/20 disabled:opacity-60"
                                                >
                                                    {deletingTaskId === task._id ? 'Deleting…' : 'Delete'}
                                                </button>
                                            </>
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
                                        <input
                                            type="text"
                                            value={newAssignee}
                                            onChange={e => setNewAssignee(e.target.value)}
                                            placeholder="Assignee (optional)"
                                            className={`${inputClass} mb-2`}
                                        />
                                        <input
                                            type="date"
                                            value={newDeadline}
                                            onChange={e => setNewDeadline(e.target.value)}
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
