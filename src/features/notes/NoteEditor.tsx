import { useState, useEffect } from 'react';
import { Save, Download, Trash2, CheckCircle2 } from 'lucide-react';
import { useNotes } from './useNotes';

interface NoteEditorProps {
    lectureId: string;
    lectureTitle: string;
}

export default function NoteEditor({ lectureId, lectureTitle }: NoteEditorProps) {
    const { note, isLoading, isSaving, updateNote, deleteNote, downloadMarkdown } = useNotes(lectureId);
    const [localContent, setLocalContent] = useState('');

    useEffect(() => {
        if (note && note.content !== undefined) {
            setLocalContent(note.content);
        }
    }, [note?.id]); // Only run when changing lectures, not an every type

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setLocalContent(val);
        updateNote(val, lectureTitle);
    };

    if (isLoading && !note) {
        return <div className="note-editor-loading">Loading notes...</div>;
    }

    const charCount = localContent.length;

    return (
        <div className="note-editor">
            <div className="note-editor-toolbar">
                <div className="note-editor-status">
                    {isSaving ? (
                        <span className="saving-text"><Save size={14} /> Saving...</span>
                    ) : note?.lastUpdatedAt ? (
                        <span className="saved-text">
                            <CheckCircle2 size={14} /> Saved {new Date(note.lastUpdatedAt).toLocaleTimeString()}
                        </span>
                    ) : null}
                </div>
                <div className="note-editor-actions">
                    <button
                        className="btn-icon"
                        onClick={() => note && downloadMarkdown({ ...note, content: localContent })}
                        title="Export as Markdown"
                        disabled={!localContent}
                    >
                        <Download size={18} />
                    </button>
                    <button
                        className="btn-icon text-danger"
                        onClick={() => {
                            if (window.confirm('Clear all notes for this lecture?')) {
                                deleteNote(lectureId);
                                setLocalContent('');
                            }
                        }}
                        title="Clear Note"
                        disabled={!localContent}
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            <textarea
                className="note-editor-textarea"
                placeholder="Start typing your notes here. Markdown is supported later..."
                value={localContent}
                onChange={handleChange}
            />

            <div className="note-editor-footer">
                <span className="char-count">{charCount} characters</span>
            </div>
        </div>
    );
}
