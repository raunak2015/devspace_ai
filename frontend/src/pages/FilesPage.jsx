import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { del, get, patch, post } from '../services/apiService';

function FilesPage() {
    const { projectId } = useParams();
    const { user } = useAuth();

    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Editor State
    const [selectedFile, setSelectedFile] = useState(null);
    const [isEditingContent, setIsEditingContent] = useState(false);
    const [editContent, setEditContent] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    // Creation State
    const [creating, setCreating] = useState(false);
    const [newFileName, setNewFileName] = useState('');
    const [createError, setCreateError] = useState('');
    
    // Upload State
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    const pageClass = 'bg-[#020617] text-white';
    const cardClass = 'bg-[#0f172a]/80 border border-slate-800 shadow-xl backdrop-blur-md';
    const subtitleClass = 'text-slate-400';
    
    const panelClass = 'rounded-xl border border-slate-800 bg-[#0f172a]/50 p-4 shadow-lg backdrop-blur-sm h-full';
    const fileItemClass = 'flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-blue-600/10 hover:text-blue-400 transition cursor-pointer mb-1 border border-transparent group';
    const fileItemActiveClass = 'bg-blue-600/10 border border-blue-600/30 text-blue-400 font-bold shadow-[0_0_15px_rgba(37,99,235,0.1)]';
    
    const inputClass = 'rounded-md border border-slate-700 bg-[#020617] px-3 py-1.5 text-white placeholder:text-slate-500 w-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all';
    const textareaClass = 'rounded-md border border-slate-800 bg-[#020617] p-5 text-slate-300 font-mono text-sm w-full h-[600px] focus:outline-none focus:ring-1 focus:ring-blue-500/50 shadow-inner resize-none';
    const codeViewerClass = 'rounded-md border border-slate-800 bg-[#020617] p-5 text-slate-300 font-mono text-sm w-full h-[600px] overflow-auto whitespace-pre-wrap shadow-inner';
        
    const btnPrimary = 'rounded-lg border border-blue-600 bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs text-white transition-all hover:shadow-[0_0_10px_rgba(37,99,235,0.3)] font-semibold';
    const btnOutline = 'rounded-lg border border-slate-700 bg-[#1e293b]/70 px-3 py-1.5 text-xs text-white hover:bg-slate-700 transition-all';

    useEffect(() => {
        loadFiles();
    }, [projectId]);

    async function loadFiles() {
        setLoading(true);
        setError('');
        try {
            const data = await get(`/files/${projectId}`);
            setFiles(data.files || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateFile(e) {
        e.preventDefault();
        const trimmed = newFileName.trim();
        if (!trimmed) {
            setCreateError('Filename is required');
            return;
        }
        setCreating(true);
        setCreateError('');
        try {
            const data = await post('/files', {
                name: trimmed,
                projectId
            });
            setFiles([data.file, ...files]);
            setNewFileName('');
            setSelectedFile(data.file);
            setEditContent(data.file.content || '');
            setIsEditingContent(true);
        } catch (err) {
            setCreateError(err.message);
        } finally {
            setCreating(false);
        }
    }

    async function handleFileUpload(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = null;
        setUploading(true);
        setUploadError('');
        try {
            const content = await file.text();
            const ext = file.name.split('.').pop()?.toLowerCase();
            let language = 'plaintext';
            if (ext === 'js' || ext === 'jsx') language = 'javascript';
            else if (ext === 'ts' || ext === 'tsx') language = 'typescript';
            else if (ext === 'py') language = 'python';
            else if (ext === 'html') language = 'html';
            else if (ext === 'css') language = 'css';
            else if (ext === 'json') language = 'json';
            else if (ext === 'md') language = 'markdown';

            const data = await post('/files', {
                name: file.name,
                content: content,
                language: language,
                projectId
            });
            setFiles([data.file, ...files]);
            setSelectedFile(data.file);
            setEditContent(data.file.content || '');
            setIsEditingContent(false);
        } catch (err) {
            setUploadError(err.message || 'Failed to read or upload file');
        } finally {
            setUploading(false);
        }
    }

    async function handleDeleteFile(fileId, fileName) {
        if (!window.confirm(`Are you sure you want to delete ${fileName}?`)) return;
        try {
            await del(`/files/${fileId}`);
            setFiles(files.filter(f => f._id !== fileId));
            if (selectedFile?._id === fileId) {
                setSelectedFile(null);
                setEditContent('');
                setIsEditingContent(false);
            }
        } catch (err) {
            alert(`Failed to delete file: ${err.message}`);
        }
    }

    function selectFile(file) {
        if (isEditingContent && editContent !== selectedFile?.content) {
            if (!window.confirm('You have unsaved changes. Discard?')) {
                return;
            }
        }
        setSelectedFile(file);
        setEditContent(file.content || '');
        setIsEditingContent(false);
        setSaveError('');
    }

    async function handleSaveContent() {
        if (!selectedFile) return;
        setSaving(true);
        setSaveError('');
        try {
            const data = await patch(`/files/${selectedFile._id}`, {
                content: editContent
            });
            const updatedFile = data.file;
            setFiles(files.map(f => f._id === updatedFile._id ? updatedFile : f));
            setSelectedFile(updatedFile);
            setIsEditingContent(false);
        } catch (err) {
            setSaveError(err.message);
        } finally {
            setSaving(false);
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
                                placeholder="Search repository..."
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
                        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[80px] pointer-events-none"></div>

                        <div className="max-w-7xl mx-auto flex flex-col gap-6 h-full relative z-10">
                            {/* Page Header */}
                            <div className="flex flex-col sm:flex-row items-center justify-between pb-4 border-b border-slate-800/50 gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                                        <span className="material-symbols-outlined text-blue-500 text-3xl">code</span>
                                        Code Repository
                                    </h1>
                                    <p className={`mt-1 text-sm ${subtitleClass}`}>Manage artifacts, prototypes, and production assets.</p>
                                </div>
                                <div className="flex gap-2">
                                    <Link to={`/projects/${projectId}/tasks`} className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm text-white hover:bg-slate-700 transition-all flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg text-blue-400">assignment</span> Tasks
                                    </Link>
                                    <Link to={`/projects/${projectId}/chat`} className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm text-white hover:bg-slate-700 transition-all flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg text-blue-400">forum</span> Chat
                                    </Link>
                                    <Link to="/projects" className="rounded-lg border border-slate-700 bg-[#020617] px-4 py-2 text-sm text-white hover:bg-slate-800 transition-all flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg rotate-180">arrow_forward</span>
                                    </Link>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-[700px]">
                                {/* File Explorer Sidebar */}
                                <div className={`${panelClass} flex flex-col`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xs uppercase font-bold text-slate-500 tracking-widest">Repository</h2>
                                        <span className="text-[10px] bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">{files.length} Files</span>
                                    </div>
                                    
                                    <form onSubmit={handleCreateFile} className="mb-4">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newFileName}
                                                onChange={e => setNewFileName(e.target.value)}
                                                placeholder="New filename..."
                                                className={inputClass}
                                            />
                                            <button
                                                type="submit"
                                                disabled={creating}
                                                className="bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded-md transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                            >
                                                <span className="material-symbols-outlined text-lg">add</span>
                                            </button>
                                        </div>
                                        {createError && <p className="text-[10px] text-red-500 mt-2 font-medium">{createError}</p>}
                                    </form>

                                    <div className="mb-6">
                                         <label className="block w-full text-center cursor-pointer rounded-xl border-dashed border-2 border-slate-800 bg-[#030712]/30 py-4 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group">
                                            <span className="material-symbols-outlined text-slate-500 group-hover:text-blue-400 transition-colors mb-1 block">cloud_upload</span>
                                            <span className="text-[9px] font-bold text-slate-500 group-hover:text-blue-400 uppercase tracking-widest">
                                                {uploading ? 'Processing...' : 'Upload Asset'}
                                            </span>
                                            <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading}/>
                                         </label>
                                         {uploadError && <p className="text-[10px] text-red-500 mt-2 font-medium text-center">{uploadError}</p>}
                                    </div>

                                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                        {loading && (
                                            <div className="flex items-center gap-2 py-4">
                                                <div className="h-3 w-3 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Syncing...</p>
                                            </div>
                                        )}
                                        
                                        {files.map(file => (
                                            <div 
                                                key={file._id} 
                                                onClick={() => selectFile(file)}
                                                className={`${fileItemClass} ${selectedFile?._id === file._id ? fileItemActiveClass : ''}`}
                                            >
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <span className="material-symbols-outlined text-blue-500/70 text-lg group-hover:text-blue-400">description</span>
                                                    <span className="text-[13px] font-medium truncate" title={file.name}>{file.name}</span>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteFile(file._id, file.name); }}
                                                    className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-500 transition-all p-1"
                                                >
                                                    <span className="material-symbols-outlined text-sm">close</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Code Editor / Viewer */}
                                <div className={`${panelClass} lg:col-span-3 flex flex-col overflow-hidden`}>
                                    {!selectedFile ? (
                                        <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-center p-12">
                                            <span className="material-symbols-outlined text-8xl mb-4">folder_open</span>
                                            <h3 className="text-2xl font-bold">Workspace Empty</h3>
                                            <p className="text-sm mt-2 max-w-xs">Select a file from the repository to synchronize your development workspace.</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800/50">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 bg-blue-600/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-blue-500">article</span>
                                                    </div>
                                                    <div>
                                                        <h2 className="text-xl font-bold text-white leading-none">{selectedFile.name}</h2>
                                                        <div className="flex items-center gap-2 mt-1.5">
                                                            <span className="text-[10px] font-bold text-blue-400 uppercase bg-blue-600/10 px-2 py-0.5 rounded border border-blue-500/20">
                                                                {selectedFile.language || 'Plaintext'}
                                                            </span>
                                                            <span className="text-[10px] text-slate-600 font-medium">Synchronized with Edge-V1</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    {isEditingContent ? (
                                                        <>
                                                            <button onClick={handleSaveContent} disabled={saving} className={btnPrimary}>
                                                                {saving ? 'Saving...' : 'Commit Changes'}
                                                            </button>
                                                            <button onClick={() => { setIsEditingContent(false); setEditContent(selectedFile.content || ''); }} className={btnOutline}>
                                                                Discard
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button onClick={() => setIsEditingContent(true)} className={btnOutline + " !bg-blue-600/10 !text-blue-400 !border-blue-600/30"}>
                                                            Modify File
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {saveError && (
                                                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-sm">error</span>
                                                    {saveError}
                                                </div>
                                            )}

                                            <div className="flex-1 overflow-hidden relative group">
                                                {isEditingContent ? (
                                                    <textarea
                                                        value={editContent}
                                                        onChange={e => setEditContent(e.target.value)}
                                                        className={textareaClass}
                                                        spellCheck={false}
                                                    />
                                                ) : (
                                                    <div className={codeViewerClass}>
                                                        {selectedFile.content || <span className="opacity-20 italic">Empty Source Code</span>}
                                                    </div>
                                                )}
                                                <div className="absolute top-4 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="h-8 w-8 bg-slate-800 rounded flex items-center justify-center text-slate-400 hover:text-white" title="Expand View">
                                                        <span className="material-symbols-outlined text-sm">fullscreen</span>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-slate-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                                                <div className="flex gap-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-0.5">Author</span>
                                                        <span className="text-[11px] text-slate-300 font-medium">{selectedFile.owner}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-0.5">Revision</span>
                                                        <span className="text-[11px] text-slate-300 font-medium">{new Date(selectedFile.updatedAt).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1.5 h-1.5">
                                                    <div className="w-12 rounded-full bg-blue-600"></div>
                                                    <div className="w-8 rounded-full bg-slate-800"></div>
                                                    <div className="w-4 rounded-full bg-slate-800"></div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

export default FilesPage;
