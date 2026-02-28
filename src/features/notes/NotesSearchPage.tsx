import { useState, useMemo } from 'react';
import { Search, FileText, Download, Trash2, Calendar } from 'lucide-react';
import { useNotes } from './useNotes';

export default function NotesSearchPage() {
    const { allNotes, isLoading, deleteNote, downloadMarkdown } = useNotes();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredNotes = useMemo(() => {
        if (!searchQuery.trim()) return allNotes;

        const lowerQ = searchQuery.toLowerCase();
        return allNotes.filter((note) => {
            const matchTitle = note.lectureTitle?.toLowerCase().includes(lowerQ);
            const matchContent = note.content.toLowerCase().includes(lowerQ);
            return matchTitle || matchContent;
        });
    }, [allNotes, searchQuery]);

    return (
        <div className="content-container">
            <div className="notes-search-header">
                <div>
                    <h2 className="section-title">My Notes</h2>
                    <p className="dashboard-subtitle">Search and manage all your lecture notes</p>
                </div>

                <div className="search-container notes-search-box">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="Search notes content or lecture titles..."
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="notes-loading">Loading notes...</div>
            ) : filteredNotes.length === 0 ? (
                <div className="dashboard-card notes-empty-state">
                    <FileText size={48} className="empty-icon" />
                    <h3>{searchQuery ? 'No notes matched your search' : 'No notes yet'}</h3>
                    <p>Open a lecture and click the notes icon to start writing.</p>
                </div>
            ) : (
                <div className="notes-grid">
                    {filteredNotes.map((note) => (
                        <div key={note.id} className="note-card">
                            <div className="note-card-header">
                                <h3 className="note-card-title">{note.lectureTitle || 'Untitled Note'}</h3>
                                <div className="note-card-actions">
                                    <button
                                        className="btn-icon"
                                        onClick={() => downloadMarkdown(note)}
                                        title="Export Markdown"
                                    >
                                        <Download size={16} />
                                    </button>
                                    <button
                                        className="btn-icon text-danger"
                                        onClick={() => window.confirm('Delete this note?') && deleteNote(note.id)}
                                        title="Delete Note"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="note-card-snippet">
                                {note.content ? (
                                    <p>{note.content.substring(0, 150)}{note.content.length > 150 ? '...' : ''}</p>
                                ) : (
                                    <p className="note-empty-text">Empty note</p>
                                )}
                            </div>

                            <div className="note-card-footer">
                                <Calendar size={14} />
                                <span>Updated: {new Date(note.lastUpdatedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
