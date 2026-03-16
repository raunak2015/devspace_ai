import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { del, get, patch, post } from '../services/apiService';

function ProjectsPage() {
    const { user } = useAuth();
    const { isDark } = useTheme();

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

    const pageClass = isDark ? 'bg-stone-950 text-stone-100' : 'bg-amber-50 text-stone-900';
    const cardClass = isDark
        ? 'border-stone-700 bg-stone-900/85 shadow-[0_18px_42px_rgba(0,0,0,0.35)]'
        : 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-100 shadow-[0_18px_42px_rgba(67,43,20,0.18)]';
    const subtitleClass = isDark ? 'text-stone-300' : 'text-stone-600';
    const inputClass = isDark
        ? 'rounded-lg border border-stone-600 bg-stone-800 px-3 py-2 text-stone-100 w-full focus:outline-none focus:ring-1 focus:ring-amber-600'
        : 'rounded-lg border border-amber-300 bg-white px-3 py-2 text-stone-900 w-full focus:outline-none focus:ring-1 focus:ring-amber-500';
    const projectCardClass = isDark
        ? 'rounded-xl border border-stone-700 bg-stone-800/60 p-5'
        : 'rounded-xl border border-amber-200 bg-white/70 p-5 shadow-sm';
    const btnPrimary = 'rounded-lg border border-amber-700 bg-gradient-to-b from-amber-700 to-amber-900 px-4 py-2 text-amber-50 transition hover:-translate-y-0.5 text-sm font-semibold';
    const btnOutline = isDark
        ? 'rounded-lg border border-stone-600 bg-stone-800/70 px-3 py-2 text-sm text-stone-100 hover:bg-stone-700 transition'
        : 'rounded-lg border border-amber-200 bg-white/70 px-3 py-2 text-sm text-stone-900 hover:bg-white transition';

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
        <div className={`min-h-screen px-4 py-8 font-serif ${pageClass}`}>
            <div className={`mx-auto max-w-4xl rounded-2xl border p-6 sm:p-8 ${cardClass}`}>

                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl">Projects</h1>
                        <p className={`mt-1 text-sm ${subtitleClass}`}>Manage your DevSpace projects</p>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/dashboard" className={btnOutline}>← Dashboard</Link>
                        <button onClick={openForm} className={btnPrimary}>
                            + New Project
                        </button>
                    </div>
                </div>

                <div className="mt-4">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search projects or members"
                        className={inputClass}
                    />
                </div>

                {/* Create Form */}
                {showForm && (
                    <form onSubmit={handleCreate} className="mt-6 flex gap-3">
                        <input
                            type="text"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            placeholder="Project name…"
                            className={inputClass}
                            maxLength={80}
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={creating}
                            className={`${btnPrimary} whitespace-nowrap disabled:opacity-60`}
                        >
                            {creating ? 'Creating…' : 'Create'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className={btnOutline}
                        >
                            Cancel
                        </button>
                    </form>
                )}
                {formError && <p className="mt-2 text-sm text-red-500">{formError}</p>}

                {/* Project List */}
                <div className="mt-8">
                    {loading && <p className={subtitleClass}>Loading projects…</p>}
                    {!loading && error && <p className="text-red-500">{error}</p>}
                    {!loading && !error && projects.length === 0 && (
                        <p className={subtitleClass}>No projects yet — create your first one above.</p>
                    )}
                    {!loading && projects.length > 0 && filteredProjects.length === 0 && (
                        <p className={subtitleClass}>No projects match your search.</p>
                    )}
                    {!loading && filteredProjects.length > 0 && (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {filteredProjects.map(project => (
                                <div key={project._id} className={projectCardClass}>
                                    <h2 className="text-xl font-semibold">{project.name}</h2>
                                    <p className={`mt-1 text-xs ${subtitleClass}`}>
                                        Created {new Date(project.createdAt).toLocaleDateString()}
                                    </p>
                                    <div className="mt-4 flex gap-2">
                                        <Link
                                            to={`/projects/${project._id}/tasks`}
                                            className={btnPrimary}
                                        >
                                            Tasks
                                        </Link>
                                        <Link
                                            to={`/projects/${project._id}/files`}
                                            className={btnOutline}
                                        >
                                            Code
                                        </Link>
                                        <Link
                                            to={`/projects/${project._id}/chat`}
                                            className={btnOutline}
                                        >
                                            Chat
                                        </Link>
                                        { (project.owner === user?._id || project.owner === user?.email || project.ownerEmail === user?.email) && (
                                            <button
                                                type="button"
                                                disabled={deletingProjectId === project._id}
                                                onClick={() => handleDeleteProject(project._id, project.name)}
                                                className="rounded-lg border border-red-500/70 bg-red-500/10 px-3 py-2 text-sm text-red-500 transition hover:bg-red-500/20 disabled:opacity-60"
                                            >
                                                {deletingProjectId === project._id ? 'Deleting…' : 'Delete'}
                                            </button>
                                        )}
                                    </div>

                                    <div className="mt-4">
                                        <p className={`text-xs ${subtitleClass}`}>Members</p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {(project.members || []).length === 0 && (
                                                <span className={`text-xs ${subtitleClass}`}>No members added.</span>
                                            )}
                                            {(project.members || []).map((member) => (
                                                <span key={member} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/70 px-3 py-1 text-xs text-stone-700">
                                                    {member}
                                                    { (project.owner === user?._id || project.owner === user?.email || project.ownerEmail === user?.email) && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveMember(project, member)}
                                                            disabled={memberSavingId === project._id}
                                                            className="text-red-500 hover:text-red-600 disabled:opacity-60"
                                                        >
                                                            ×
                                                        </button>
                                                    )}
                                                </span>
                                            ))}
                                        </div>

                                        { (project.owner === user?._id || project.owner === user?.email || project.ownerEmail === user?.email) && (
                                            <div className="mt-3 flex gap-2">
                                                <input
                                                    type="email"
                                                    value={memberInputs[project._id] || ''}
                                                    onChange={(e) => updateMemberInput(project._id, e.target.value)}
                                                    placeholder="Add member email"
                                                    className={inputClass}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddMember(project)}
                                                    disabled={memberSavingId === project._id}
                                                    className={`${btnPrimary} whitespace-nowrap disabled:opacity-60`}
                                                >
                                                    {memberSavingId === project._id ? 'Saving…' : 'Add'}
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
        </div>
    );
}

export default ProjectsPage;
