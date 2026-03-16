import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { del, get, patch, post } from '../services/apiService';

function ProjectsPage() {
    const { user } = useAuth();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [creating, setCreating] = useState(false);
    const [formError, setFormError] = useState('');
    const [deletingProjectId, setDeletingProjectId] = useState('');
    const [memberInputs, setMemberInputs] = useState({});
    const [memberSavingId, setMemberSavingId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const pageClass = 'bg-[#020617] text-white';
    const subtitleClass = 'text-slate-400';
    const cardClass = 'bg-[#0f172a]/80 border border-slate-800 shadow-xl backdrop-blur-sm';
    const inputClass = 'rounded-lg border border-slate-700 bg-[#1e293b]/50 px-3 py-2 text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-500';
    const projectCardClass = 'rounded-xl border border-slate-800 bg-[#0f172a] p-5 hover:border-blue-500/50 transition-all duration-300 shadow-lg group';

    useEffect(() => {
        get('/projects')
            .then(data => setProjects(data.projects || []))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    function openForm() {
        setShowForm(true);
        setFormError('');
        setNewName('');
    }

    async function handleCreate(e) {
        e.preventDefault();
        const trimmed = newName.trim();
        if (!trimmed) { setFormError('Project name is required.'); return; }
        setCreating(true);
        setFormError('');
        try {
            const data = await post('/projects', {
                name: trimmed,
                owner: user?._id || user?.email || 'unknown'
            });
            setProjects(prev => [data.project, ...prev]);
            setNewName('');
            setShowForm(false);
        } catch (err) {
            setFormError(err.message);
        } finally {
            setCreating(false);
        }
    }

    async function handleDeleteProject(projectId, projectName) {
        const confirmed = window.confirm(`Delete project "${projectName}"? This will remove all tasks and chat messages.`);
        if (!confirmed) return;

        setDeletingProjectId(projectId);
        setError('');

        try {
            await del(`/projects/${projectId}`);
            setProjects((prev) => prev.filter((project) => project._id !== projectId));
        } catch (err) {
            setError(err.message);
        } finally {
            setDeletingProjectId('');
        }
    }

    function updateMemberInput(projectId, value) {
        setMemberInputs((prev) => ({
            ...prev,
            [projectId]: value
        }));
    }

    async function handleAddMember(project) {
        const raw = memberInputs[project._id] || '';
        const trimmed = raw.trim().toLowerCase();

        if (!trimmed) {
            setError('Member email is required.');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            setError('Please enter a valid email address.');
            return;
        }

        if ((project.members || []).includes(trimmed)) {
            setError('Member already added to this project.');
            return;
        }

        setMemberSavingId(project._id);
        setError('');

        try {
            const updatedMembers = [...(project.members || []), trimmed];
            const data = await patch(`/projects/${project._id}/members`, { members: updatedMembers });
            setProjects((prev) => prev.map((item) => (item._id === project._id ? data.project : item)));
            setMemberInputs((prev) => ({ ...prev, [project._id]: '' }));
        } catch (err) {
            setError(err.message);
        } finally {
            setMemberSavingId('');
        }
    }

    async function handleRemoveMember(project, member) {
        setMemberSavingId(project._id);
        setError('');

        try {
            const updatedMembers = (project.members || []).filter((item) => item !== member);
            const data = await patch(`/projects/${project._id}/members`, { members: updatedMembers });
            setProjects((prev) => prev.map((item) => (item._id === project._id ? data.project : item)));
        } catch (err) {
            setError(err.message);
        } finally {
            setMemberSavingId('');
        }
    }

    const normalizedSearch = searchTerm.trim().toLowerCase();
    const filteredProjects = projects.filter((project) => {
        if (!normalizedSearch) return true;
        const haystack = [project.name, ...(project.members || [])]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
        return haystack.includes(normalizedSearch);
    });

    return (
        <div className={`min-h-screen font-display ${pageClass} selection:bg-primary/30`}>
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
                                placeholder="Search projects or teammates..."
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
                                <Link to="/projects" className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-blue-600/10 text-blue-400 font-semibold border border-blue-600/30 shadow-[0_0_15px_rgba(37,99,235,0.1)]">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-[20px]">folder_special</span>
                                        <span className="text-sm hidden md:inline">Projects</span>
                                    </div>
                                    <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full hidden md:inline">{projects.length}</span>
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
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
                        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>

                        <div className="max-w-6xl mx-auto flex flex-col gap-8 relative z-10">
                            {/* Page Header */}
                            <div className="flex flex-col sm:flex-row items-center justify-between pb-4 border-b border-slate-800/50 gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight text-white">Active Projects</h1>
                                    <p className={`mt-1 text-sm ${subtitleClass}`}>Manage and track your ongoing initiatives.</p>
                                </div>
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <button onClick={openForm} className="flex-1 sm:flex-none items-center justify-center flex gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] hover:-translate-y-0.5">
                                        <span className="material-symbols-outlined text-[20px]">add</span>
                                        New Project
                                    </button>
                                </div>
                            </div>

                            {/* Form Grid */}
                            <div className="flex flex-col gap-4">
                                <label className="flex md:hidden flex-col min-w-40 h-10 max-w-md w-full relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                        <span className="material-symbols-outlined text-xl">search</span>
                                    </div>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search projects..."
                                        className="flex w-full h-full pl-10 pr-4 py-2 bg-slate-200/50 bg-slate-800/50 border border-transparent focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-full text-sm placeholder:text-slate-500 transition-all shadow-inner"
                                    />
                                </label>

                                {/* Create Form */}
                                {showForm && (
                                    <form onSubmit={handleCreate} className="flex gap-3 max-w-md">
                                        <input
                                            type="text"
                                            value={newName}
                                            onChange={e => setNewName(e.target.value)}
                                            placeholder="Project name…"
                                            className="flex-1 w-full pl-4 pr-4 py-2 bg-slate-800/50 border border-slate-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-full text-sm transition-all text-slate-100 placeholder:text-slate-500"
                                            maxLength={80}
                                            autoFocus
                                        />
                                        <button
                                            type="submit"
                                            disabled={creating}
                                            className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all disabled:opacity-50"
                                        >
                                            {creating ? 'Creating…' : 'Create'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowForm(false)}
                                            className="px-5 py-2.5 rounded-full border border-slate-600/50 hover:bg-slate-800/50 transition-all text-sm font-semibold text-slate-300"
                                        >
                                            Cancel
                                        </button>
                                    </form>
                                )}
                                {formError && <p className="text-sm text-red-500">{formError}</p>}
                            </div>


                            {/* Project List */}
                            <div className="mt-4">
                                {loading && <p className={subtitleClass}>Loading projects…</p>}
                                {!loading && error && <p className="text-red-500">{error}</p>}

                                {!loading && !error && projects.length === 0 && (
                                    <div onClick={openForm} className="rounded-2xl p-6 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-slate-700/50 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer min-h-[250px] group">
                                        <div className="h-14 w-14 rounded-full bg-slate-800/50 text-slate-400 flex items-center justify-center group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                            <span className="material-symbols-outlined text-3xl">add_circle</span>
                                        </div>
                                        <p className="text-slate-400 font-medium group-hover:text-slate-300">Create New Project</p>
                                    </div>
                                )}

                                {!loading && projects.length > 0 && filteredProjects.length === 0 && (
                                    <p className={subtitleClass}>No projects match your search.</p>
                                )}

                                {!loading && filteredProjects.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {filteredProjects.map(project => (
                                            <div key={project._id} className={`${cardClass} rounded-xl p-6 flex flex-col gap-5 transition-all duration-200 group hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] border`}>

                                                <div className="flex justify-between items-start">
                                                    <div className="h-11 w-11 rounded-lg bg-blue-600/10 text-blue-500 flex items-center justify-center border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]">
                                                        <span className="material-symbols-outlined text-2xl">folder</span>
                                                    </div>

                                                    {(project.owner === user?._id || project.owner === user?.email || project.ownerEmail === user?.email) && (
                                                        <button
                                                            type="button"
                                                            disabled={deletingProjectId === project._id}
                                                            onClick={() => handleDeleteProject(project._id, project.name)}
                                                            className="flex items-center gap-1 text-red-400 text-xs font-medium px-2.5 py-1 rounded-md hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                                        >
                                                            {deletingProjectId === project._id ? 'Deleting…' : 'Delete'}
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="flex flex-col gap-1">
                                                    <h3 className="text-base font-semibold text-slate-100">{project.name}</h3>
                                                </div>

                                                <div className="flex items-center gap-4 text-xs text-slate-400">
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="material-symbols-outlined text-[15px]">calendar_month</span>
                                                        {new Date(project.createdAt).toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="material-symbols-outlined text-[15px]">person</span>
                                                        {(project.members || []).length + 1} Members
                                                    </span>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="pt-4 border-t border-slate-700/50 flex gap-2">
                                                    <Link
                                                        to={`/projects/${project._id}/tasks`}
                                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-600/50 text-slate-300 hover:bg-slate-800/50 hover:border-slate-500 transition-all text-sm font-medium"
                                                    >
                                                        <span className="material-symbols-outlined text-[17px]">list_alt</span>
                                                        Tasks
                                                    </Link>
                                                    <Link
                                                        to={`/projects/${project._id}/files`}
                                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-600/50 text-slate-300 hover:bg-slate-800/50 hover:border-slate-500 transition-all text-sm font-medium"
                                                    >
                                                        <span className="material-symbols-outlined text-[17px]">code</span>
                                                        Code
                                                    </Link>
                                                    <Link
                                                        to={`/projects/${project._id}/chat`}
                                                        className="flex items-center justify-center w-10 h-10 rounded-lg border border-slate-600/50 text-slate-300 hover:bg-slate-800/50 hover:border-slate-500 transition-all"
                                                    >
                                                        <span className="material-symbols-outlined text-[17px]">chat_bubble</span>
                                                    </Link>
                                                </div>

                                                {/* Members Area */}
                                                <div className="mt-2">
                                                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Team</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        <span className="inline-flex items-center gap-1.5 rounded-md border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[11px] font-medium text-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.05)]">
                                                            <span className="material-symbols-outlined text-[13px] text-blue-400">stars</span>
                                                            {project.ownerName || 'Owner'}
                                                        </span>

                                                        {(project.members || []).map((member) => (
                                                            <span key={member} className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800/50 px-2.5 py-1 text-[11px] font-medium text-slate-300">
                                                                {member}
                                                                {(project.owner === user?._id || project.owner === user?.email || project.ownerEmail === user?.email) && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveMember(project, member)}
                                                                        disabled={memberSavingId === project._id}
                                                                        className="text-slate-500 hover:text-red-400 ml-0.5 hover:bg-red-500/10 rounded w-3.5 h-3.5 flex items-center justify-center disabled:opacity-50 transition-colors"
                                                                        title="Remove member"
                                                                    >
                                                                        ×
                                                                    </button>
                                                                )}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    {/* Add Member Form */}
                                                    {(project.owner === user?._id || project.owner === user?.email || project.ownerEmail === user?.email) && (
                                                        <div className="mt-3 flex gap-2">
                                                            <input
                                                                type="email"
                                                                value={memberInputs[project._id] || ''}
                                                                onChange={(e) => updateMemberInput(project._id, e.target.value)}
                                                                placeholder="Invite member..."
                                                                className="flex-1 w-full pl-3 pr-3 py-1.5 bg-slate-800/50 border border-slate-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-md text-xs text-slate-100 placeholder:text-slate-500 transition-all"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => handleAddMember(project)}
                                                                disabled={memberSavingId === project._id}
                                                                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-md text-xs font-semibold transition-all disabled:opacity-50 shadow-[0_0_10px_rgba(37,99,235,0.2)]"
                                                            >
                                                                {memberSavingId === project._id ? '…' : 'Add'}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

export default ProjectsPage;
