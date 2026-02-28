import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import * as notesService from './notesService';
import type { Note } from './notesService';

export function useNotes(lectureId?: string) {
    const { currentUser } = useAuth();
    const [note, setNote] = useState<Note | null>(null);
    const [allNotes, setAllNotes] = useState<Note[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Debounce timer
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch single note
    useEffect(() => {
        if (!currentUser?.id || !lectureId) return;

        const fetchNote = async () => {
            setIsLoading(true);
            try {
                const fetchedNote = await notesService.getNote(currentUser.id, lectureId);
                setNote(fetchedNote || { id: lectureId, content: '', lastUpdatedAt: 0, lectureTitle: '' });
            } catch (err) {
                console.error('Failed to load note', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNote();
    }, [currentUser?.id, lectureId]);

    // Fetch all notes (for search page)
    useEffect(() => {
        if (!currentUser?.id || lectureId) return; // Only fetch all if NOT looking at a specific lecture

        const fetchAll = async () => {
            setIsLoading(true);
            try {
                const fetched = await notesService.getAllNotes(currentUser.id);
                setAllNotes(fetched);
            } catch (err) {
                console.error('Failed to load all notes', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAll();
    }, [currentUser?.id, lectureId]);

    const updateNote = useCallback(
        (content: string, lectureTitle: string) => {
            if (!currentUser?.id || !lectureId) return;

            setNote((prev) => ({
                id: lectureId,
                content,
                lastUpdatedAt: Date.now(),
                lectureTitle,
            }));

            setIsSaving(true);

            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }

            saveTimeoutRef.current = setTimeout(async () => {
                try {
                    await notesService.saveNote(currentUser.id, lectureId, content, lectureTitle);
                } catch (err) {
                    console.error('Failed to save note', err);
                } finally {
                    setIsSaving(false);
                }
            }, 2000); // 2-second debounce
        },
        [currentUser?.id, lectureId]
    );

    const deleteNote = async (idToDelete: string) => {
        if (!currentUser?.id) return;
        try {
            await notesService.deleteNote(currentUser.id, idToDelete);

            // Update local state
            if (lectureId === idToDelete) {
                setNote({ id: lectureId, content: '', lastUpdatedAt: 0, lectureTitle: '' });
            }
            setAllNotes((prevNotes) => prevNotes.filter((n) => n.id !== idToDelete));

        } catch (err) {
            console.error('Failed to delete note', err);
        }
    };

    const downloadMarkdown = (n: Note) => {
        const title = n.lectureTitle || 'Lecture Note';
        const blob = new Blob([`# ${title}\n\n${n.content}`], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return {
        note,
        allNotes,
        isSaving,
        isLoading,
        updateNote,
        deleteNote,
        downloadMarkdown,
    };
}
