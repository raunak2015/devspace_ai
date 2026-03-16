import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { del, get, patch, post } from '../services/apiService';

const STATUSES = ['To Do', 'In Progress', 'Completed'];

function TasksPage() {
    const { projectId } = useParams();
    const { user } = useAuth();

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

    const pageClass = 'bg-[#020617] text-white';
    const cardClass = 'bg-[#0f172a]/80 border border-slate-800 shadow-xl backdrop-blur-md';
    const subtitleClass = 'text-slate-400';
    const columnClass = 'rounded-xl border border-slate-800 bg-[#0f172a]/40 p-5 min-h-[500px] shadow-lg backdrop-blur-sm flex flex-col gap-4';
    const taskCardClass = 'rounded-xl border border-slate-800 bg-[#1e293b]/30 p-4 hover:border-blue-500/50 hover:bg-[#1e293b]/50 transition-all cursor-pointer group relative overflow-hidden';
    const inputClass = 'rounded-lg border border-slate-800 bg-[#030712] px-3 py-2 text-white placeholder:text-slate-600 w-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all';
    
    const btnPrimary = 'rounded-lg border border-blue-600 bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs text-white transition-all hover:shadow-[0_0_15px_rgba(37,99,235,0.3)] font-bold';
    const btnOutline = 'rounded-lg border border-slate-700 bg-[#1e293b]/70 px-4 py-2 text-xs text-white hover:bg-slate-700 transition-all';
    
    const colHeaderColors = {
        'To Do': 'text-slate-400',
        'In Progress': 'text-blue-400',
        'Completed': 'text-emerald-400'
    };

    async function loadTasks(targetPage, showLoader = true) {
        if (showLoader) setLoading(true);
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
            if (showLoader) setLoading(false);
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
            if (page === 1) await loadTasks(1, false); else setPage(1);
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
        setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: nextStatus } : t));
        try {
            await patch(`/tasks/${taskId}/status`, { status: nextStatus });
        } catch (err) {
            setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: currentStatus } : t));
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
        setTasks((prev) => prev.filter((task) => task._id !== taskId));
        try {
            await del(`/tasks/${taskId}`);
            if (previousTasks.length === 1 && page > 1) setPage((prev) => prev - 1); else await loadTasks(page, false);
        } catch (err) {
            setTasks(previousTasks);
            setError(err.message);
        } finally {
            setDeletingTaskId('');
        }
    }

    const tasksByStatus = status => tasks.filter(t => t.status === status);

    const formatDeadline = (value) => {
        if (!value) return '';
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString();
    };

    const isOverdue = (task) => {
        if (!task?.deadline || task.status === 'Completed') return false;
        return new Date(task.deadline).getTime() < Date.now();
    };

    const startEditTask = (task) => {
        setEditingTaskId(task._id);
        setEditTitle(task.title || '');
        setEditDesc(task.description || '');
        setEditAssignee(task.assignedTo || '');
        setEditDeadline(task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '');
        setFormError('');
    };

    const cancelEditTask = () => setEditingTaskId('');

    const saveTaskEdit = async (taskId) => {
        const trimmedTitle = editTitle.trim();
        if (!trimmedTitle) { setFormError('Title is required.'); return; }
        setSavingEdit(true);
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
                                placeholder="Search tasks..."
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
                    <main className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
                        {/* Background decorative elements */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>
                        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-[80px] pointer-events-none"></div>

                        <div className="max-w-full mx-auto flex flex-col gap-6 relative z-10">
                            {/* Page Header */}
                            <div className="flex flex-col sm:flex-row items-center justify-between pb-4 border-b border-slate-800/50 gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                                        <span className="material-symbols-outlined text-blue-500 text-3xl">view_kanban</span>
                                        Project Sprint
                                    </h1>
                                    <p className={`mt-1 text-sm ${subtitleClass}`}>Orchestrate tasks and coordinate across development phases.</p>
                                </div>
                                <div className="flex gap-2">
                                    <Link to={`/projects/${projectId}/files`} className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm text-white hover:bg-slate-700 transition-all flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg text-blue-400">code</span> Files
                                    </Link>
                                    <Link to={`/projects/${projectId}/chat`} className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm text-white hover:bg-slate-700 transition-all flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg text-blue-400">forum</span> Chat
                                    </Link>
                                    <Link to="/projects" className="rounded-lg border border-slate-700 bg-[#020617] px-4 py-2 text-sm text-white hover:bg-slate-800 transition-all flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg rotate-180">arrow_forward</span>
                                    </Link>
                                </div>
                            </div>

                            {/* Pagination and Info */}
                            <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-blue-600/5 border border-blue-600/10 mb-2">
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Page {pagination.page} / {pagination.totalPages}</span>
                                    <div className="h-1 w-1 rounded-full bg-blue-600/30"></div>
                                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">{pagination.total} Total Actions</span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page <= 1} className="h-8 w-8 rounded-lg bg-[#020617] border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30">
                                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                                    </button>
                                    <button onClick={() => setPage(p => Math.min(p + 1, pagination.totalPages))} disabled={page >= pagination.totalPages} className="h-8 w-8 rounded-lg bg-[#020617] border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30">
                                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm flex items-center gap-3">
                                    <span className="material-symbols-outlined">error</span> {error}
                                </div>
                            )}

                            {/* Kanban Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {STATUSES.map(status => (
                                    <div key={status} className={columnClass}>
                                        <div className="flex items-center justify-between mb-2">
                                            <h2 className={`font-bold text-xs uppercase tracking-[0.2em] font-display ${colHeaderColors[status]}`}>{status}</h2>
                                            <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full font-bold text-slate-500">{tasksByStatus(status).length}</span>
                                        </div>

                                        {/* Task List */}
                                        <div className="flex flex-col gap-3 flex-1">
                                            {tasksByStatus(status).map(task => (
                                                <div key={task._id} className={`${taskCardClass} ${isOverdue(task) ? 'ring-2 ring-red-500/30 !bg-red-500/5' : ''}`}>
                                                    {editingTaskId === task._id ? (
                                                        <div className="space-y-3">
                                                            <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className={inputClass} placeholder="Update title..."/>
                                                            <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} className={inputClass + " h-20 resize-none"} placeholder="Update description..."/>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <input value={editAssignee} onChange={e => setEditAssignee(e.target.value)} className={inputClass} placeholder="Member..."/>
                                                                <input type="date" value={editDeadline} onChange={e => setEditDeadline(e.target.value)} className={inputClass}/>
                                                            </div>
                                                            <div className="flex gap-2 pt-2">
                                                                <button onClick={() => saveTaskEdit(task._id)} disabled={savingEdit} className={btnPrimary + " w-full"}>COMMIT</button>
                                                                <button onClick={cancelEditTask} className={btnOutline}>CLOSE</button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                                <h3 className="text-sm font-bold text-slate-200 leading-tight group-hover:text-white transition-colors">{task.title}</h3>
                                                                {isOverdue(task) && (
                                                                    <span className="bg-red-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded">CRITICAL</span>
                                                                )}
                                                            </div>
                                                            {task.description && <p className="text-[11px] text-slate-500 line-clamp-2 mb-3 leading-relaxed">{task.description}</p>}
                                                            
                                                            <div className="flex flex-wrap items-center gap-3 mt-auto">
                                                                {task.assignedTo && (
                                                                    <div className="flex items-center gap-1.5 bg-slate-800/50 rounded-full pl-1 pr-3 py-0.5 border border-slate-700">
                                                                        <div className="h-4 w-4 rounded-full bg-blue-500/20 flex items-center justify-center text-[8px] font-bold text-blue-400">{task.assignedTo[0].toUpperCase()}</div>
                                                                        <span className="text-[10px] text-slate-400 font-bold">{task.assignedTo}</span>
                                                                    </div>
                                                                )}
                                                                {task.deadline && (
                                                                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600">
                                                                        <span className="material-symbols-outlined text-sm">schedule</span>
                                                                        {formatDeadline(task.deadline)}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="mt-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all border-t border-slate-800/50 pt-3">
                                                                <div className="flex gap-2">
                                                                    <button onClick={() => startEditTask(task)} className="h-7 w-7 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all">
                                                                        <span className="material-symbols-outlined text-sm">edit</span>
                                                                    </button>
                                                                    <button onClick={() => handleDeleteTask(task._id, task.title)} className="h-7 w-7 rounded bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                                                                        <span className="material-symbols-outlined text-sm">delete</span>
                                                                    </button>
                                                                </div>
                                                                {status !== 'Completed' && (
                                                                    <button onClick={() => moveTaskNext(task._id, status)} className="h-7 px-3 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-1">
                                                                        PUSH <span className="material-symbols-outlined text-xs">arrow_forward</span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Add Form */}
                                        {addingTo === status ? (
                                            <div className="p-4 rounded-xl bg-[#020617] border border-slate-800 shadow-xl animate-in fade-in slide-in-from-top-2 duration-300">
                                                <input value={newTitle} onChange={e => setNewTitle(e.target.value)} className={inputClass} placeholder="Goal name..." autoFocus/>
                                                <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} className={inputClass + " mt-2 h-20 resize-none"} placeholder="Add details..."/>
                                                <div className="grid grid-cols-2 gap-2 mt-2">
                                                    <input value={newAssignee} onChange={e => setNewAssignee(e.target.value)} className={inputClass} placeholder="Assignee"/>
                                                    <input type="date" value={newDeadline} onChange={e => setNewDeadline(e.target.value)} className={inputClass}/>
                                                </div>
                                                {formError && <p className="text-[10px] text-red-500 mt-2 font-bold">{formError}</p>}
                                                <div className="flex gap-2 mt-4">
                                                    <button onClick={() => handleAddTask(status)} disabled={creating} className={btnPrimary + " w-full"}>INITIALIZE</button>
                                                    <button onClick={closeAddForm} className={btnOutline}>ABORT</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button onClick={() => openAddForm(status)} className="w-full py-3 rounded-xl border-dashed border-2 border-slate-800 text-slate-600 hover:border-blue-500/30 hover:text-blue-500/50 transition-all flex items-center justify-center gap-2 group">
                                                <span className="material-symbols-outlined text-sm group-hover:scale-125 transition-transform">add_circle</span>
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">New Action</span>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

export default TasksPage;
