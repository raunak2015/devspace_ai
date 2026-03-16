import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { del, get, patch, post } from '../services/apiService';

function FilesPage() {
    const { projectId } = useParams();
    const { user } = useAuth();
    const { isDark } = useTheme();

    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
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

    const pageClass = isDark ? 'bg-stone-950 text-stone-100' : 'bg-amber-50 text-stone-900';
    const headerCardClass = isDark
        ? 'border-stone-700 bg-stone-900/85 shadow-[0_4px_18px_rgba(0,0,0,0.3)]'
        : 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-100 shadow-[0_4px_18px_rgba(67,43,20,0.12)]';
    const subtitleClass = isDark ? 'text-stone-400' : 'text-stone-500';
    
    // Layout Classes
    const panelClass = isDark
        ? 'rounded-xl border border-stone-700 bg-stone-900/50 p-4'
        : 'rounded-xl border border-amber-200 bg-white/50 p-4';
    const fileItemClass = isDark
        ? 'flex items-center justify-between rounded-lg px-3 py-2 hover:bg-stone-800 transition cursor-pointer mb-1'
        : 'flex items-center justify-between rounded-lg px-3 py-2 hover:bg-amber-100/50 transition cursor-pointer mb-1';
    const fileItemActiveClass = isDark
        ? 'bg-stone-800 border border-stone-700'
        : 'bg-amber-100 border border-amber-300 shadow-sm';
    
    // Forms & Controls Classes
    const inputClass = isDark
        ? 'rounded-md border border-stone-600 bg-stone-800 px-3 py-1.5 text-stone-100 placeholder:text-stone-500 w-full text-sm focus:outline-none focus:ring-1 focus:ring-amber-600'
        : 'rounded-md border border-amber-300 bg-white px-3 py-1.5 text-stone-900 placeholder:text-stone-400 w-full text-sm focus:outline-none focus:ring-1 focus:ring-amber-500';
    const textareaClass = isDark
        ? 'rounded-md border border-stone-600 bg-stone-950 p-4 text-stone-300 font-mono text-sm w-full h-[500px] focus:outline-none focus:ring-1 focus:ring-amber-600'
        : 'rounded-md border border-amber-300 bg-amber-50/50 p-4 text-stone-800 font-mono text-sm w-full h-[500px] focus:outline-none focus:ring-1 focus:ring-amber-500';
    const codeViewerClass = isDark
        ? 'rounded-md border border-stone-700 bg-stone-950 p-4 text-stone-300 font-mono text-sm w-full h-[500px] overflow-auto whitespace-pre-wrap'
        : 'rounded-md border border-amber-200 bg-amber-50/50 p-4 text-stone-800 font-mono text-sm w-full h-[500px] overflow-auto whitespace-pre-wrap';
        
    const btnPrimary = 'rounded-lg border border-amber-700 bg-gradient-to-b from-amber-700 to-amber-900 px-3 py-1.5 text-xs text-amber-50 transition hover:-translate-y-0.5 font-semibold';
    const btnOutline = isDark
        ? 'rounded-lg border border-stone-600 bg-stone-800/70 px-3 py-1.5 text-xs text-stone-100 hover:bg-stone-700 transition'
        : 'rounded-lg border border-amber-200 bg-white/70 px-3 py-1.5 text-xs text-stone-900 hover:bg-white transition';

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

        // Reset the input value so the same file could be uploaded again if needed
        e.target.value = null;

        setUploading(true);
        setUploadError('');

        try {
            const content = await file.text();
            
            // Try to infer a simple language based on extension
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
            
            // Update local state
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
        <div className={`min-h-screen px-4 py-8 font-serif ${pageClass}`}>
            <div className="mx-auto max-w-6xl">
                
                {/* Header */}
                <div className={`flex flex-wrap items-center justify-between rounded-2xl border px-6 py-4 mb-6 gap-4 ${headerCardClass}`}>
                    <div>
                        <h1 className="text-2xl font-semibold">Code Repository</h1>
                        <p className={`text-xs mt-0.5 ${subtitleClass}`}>Project · {projectId}</p>
                    </div>
                    <div className="flex gap-2">
                        <Link to={`/projects/${projectId}/tasks`} className={btnOutline.replace('text-xs', 'text-sm')}>
                            Tasks
                        </Link>
                        <Link to={`/projects/${projectId}/chat`} className={btnOutline.replace('text-xs', 'text-sm')}>
                            Chat
                        </Link>
                        <Link to="/projects" className={btnOutline.replace('text-xs', 'text-sm')}>
                            ← Projects
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    
                    {/* Left Sidebar - File List */}
                    <div className={`${panelClass} md:col-span-1 flex flex-col h-[600px]`}>
                        <h2 className="text-sm font-semibold mb-3 uppercase tracking-wider">Files</h2>
                        
                        <form onSubmit={handleCreateFile} className="mb-4">
                            <div className="flex gap-1">
                                <input
                                    type="text"
                                    value={newFileName}
                                    onChange={e => setNewFileName(e.target.value)}
                                    placeholder="new_file.js"
                                    className={inputClass}
                                />
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className={`${btnPrimary} px-2 !py-1`}
                                >
                                    +
                                </button>
                            </div>
                            {createError && <p className="text-[10px] text-red-500 mt-1">{createError}</p>}
                        </form>

                        <div className="mb-4">
                             <label 
                                className={`block w-full text-center cursor-pointer ${btnOutline} border-dashed border-2 py-3`}
                             >
                                <span className={`text-[10px] font-medium tracking-wide ${uploading ? 'opacity-50' : ''}`}>
                                    {uploading ? 'UPLOADING...' : '+ UPLOAD FILE FROM DEVICE'}
                                </span>
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                />
                             </label>
                             {uploadError && <p className="text-[10px] text-red-500 mt-1">{uploadError}</p>}
                        </div>

                        <div className="flex-1 overflow-y-auto pr-1">
                            {loading && <p className={`text-xs ${subtitleClass}`}>Loading files...</p>}
                            {!loading && error && <p className="text-xs text-red-500">{error}</p>}
                            {!loading && !error && files.length === 0 && (
                                <p className={`text-xs italic ${subtitleClass}`}>No files yet.</p>
                            )}
                            
                            {files.map(file => (
                                <div 
                                    key={file._id} 
                                    onClick={() => selectFile(file)}
                                    className={`${fileItemClass} ${selectedFile?._id === file._id ? fileItemActiveClass : ''}`}
                                >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <span className="text-amber-600 text-lg leading-none">📄</span>
                                        <span className="text-sm truncate" title={file.name}>{file.name}</span>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteFile(file._id, file.name); }}
                                        className="text-red-500 opacity-50 hover:opacity-100 text-xs px-1"
                                        title="Delete File"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Main Area - Editor/Viewer */}
                    <div className={`${panelClass} md:col-span-3 flex flex-col h-[600px]`}>
                        {!selectedFile ? (
                            <div className={`flex h-full items-center justify-center ${subtitleClass}`}>
                                <p>Select a file to view or edit</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-3 border-b border-stone-500/20 pb-2">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-lg font-mono font-medium">{selectedFile.name}</h2>
                                        <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full border ${isDark ? 'border-stone-700 bg-stone-800' : 'border-amber-200 bg-amber-100'}`}>
                                            {selectedFile.language}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        {isEditingContent ? (
                                            <>
                                                <button 
                                                    onClick={handleSaveContent} 
                                                    disabled={saving || editContent === selectedFile.content}
                                                    className={`${btnPrimary} !text-sm disabled:opacity-50`}
                                                >
                                                    {saving ? 'Saving...' : 'Save File'}
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        if (editContent !== selectedFile.content && !window.confirm('Discard unsaved changes?')) return;
                                                        setIsEditingContent(false);
                                                        setEditContent(selectedFile.content || '');
                                                    }}
                                                    className={`${btnOutline} !text-sm`}
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <button 
                                                onClick={() => setIsEditingContent(true)}
                                                className={`${btnOutline} !text-sm`}
                                            >
                                                Edit File
                                            </button>
                                        )}
                                    </div>
                                </div>
                                
                                {saveError && <p className="mb-2 text-xs text-red-500">{saveError}</p>}
                                
                                <div className="flex-1 overflow-hidden relative">
                                    {isEditingContent ? (
                                        <textarea
                                            value={editContent}
                                            onChange={e => setEditContent(e.target.value)}
                                            className={textareaClass}
                                            spellCheck={false}
                                            placeholder="// Start typing your code here..."
                                        />
                                    ) : (
                                        <div className={codeViewerClass}>
                                            {selectedFile.content || <span className="opacity-40 italic">Empty file</span>}
                                        </div>
                                    )}
                                </div>
                                
                                <div className={`mt-2 flex justify-between text-[10px] ${subtitleClass}`}>
                                    <span>Added by: {selectedFile.owner}</span>
                                    <span>Last modified: {new Date(selectedFile.updatedAt).toLocaleString()}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default FilesPage;
