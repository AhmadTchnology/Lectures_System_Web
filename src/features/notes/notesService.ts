import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    deleteDoc,
    query,
} from 'firebase/firestore';
import { db } from '../../firebase';

export interface Note {
    id: string; // usually lectureId
    content: string;
    lastUpdatedAt: number;
    lectureTitle?: string;
}

export async function saveNote(userId: string, lectureId: string, content: string, lectureTitle: string) {
    if (!navigator.onLine) {
        // Simple offline fallback: store in localStorage
        const offlineNotesStr = localStorage.getItem(`offline_notes_${userId}`) || '{}';
        const offlineNotes = JSON.parse(offlineNotesStr);
        offlineNotes[lectureId] = { content, lastUpdatedAt: Date.now(), lectureTitle };
        localStorage.setItem(`offline_notes_${userId}`, JSON.stringify(offlineNotes));
        return;
    }

    const noteRef = doc(db, `users/${userId}/notes/${lectureId}`);
    await setDoc(noteRef, {
        content,
        lastUpdatedAt: Date.now(),
        lectureTitle,
    });
}

export async function getNote(userId: string, lectureId: string): Promise<Note | null> {
    const offlineNotesStr = localStorage.getItem(`offline_notes_${userId}`) || '{}';
    const offlineNotes = JSON.parse(offlineNotesStr);

    if (offlineNotes[lectureId]) {
        return {
            id: lectureId,
            content: offlineNotes[lectureId].content,
            lastUpdatedAt: offlineNotes[lectureId].lastUpdatedAt,
            lectureTitle: offlineNotes[lectureId].lectureTitle,
        };
    }

    if (!navigator.onLine) return null;

    const noteRef = doc(db, `users/${userId}/notes/${lectureId}`);
    const noteSnap = await getDoc(noteRef);

    if (noteSnap.exists()) {
        const data = noteSnap.data();
        return {
            id: noteSnap.id,
            content: data.content,
            lastUpdatedAt: data.lastUpdatedAt,
            lectureTitle: data.lectureTitle,
        };
    }
    return null;
}

export async function getAllNotes(userId: string): Promise<Note[]> {
    const notes: Note[] = [];

    // Offline + Online merge
    const offlineNotesStr = localStorage.getItem(`offline_notes_${userId}`) || '{}';
    const offlineNotes = JSON.parse(offlineNotesStr);
    for (const [id, data] of Object.entries(offlineNotes)) {
        notes.push({ id, ...(data as any) } as Note);
    }

    if (navigator.onLine) {
        const notesRef = collection(db, `users/${userId}/notes`);
        const querySnapshot = await getDocs(query(notesRef));

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Don't duplicate if offline is newer/exists, simple merge
            if (!notes.find((n) => n.id === doc.id)) {
                notes.push({
                    id: doc.id,
                    content: data.content,
                    lastUpdatedAt: data.lastUpdatedAt,
                    lectureTitle: data.lectureTitle,
                });
            }
        });
    }

    return notes.sort((a, b) => b.lastUpdatedAt - a.lastUpdatedAt);
}

export async function deleteNote(userId: string, lectureId: string) {
    const offlineNotesStr = localStorage.getItem(`offline_notes_${userId}`) || '{}';
    const offlineNotes = JSON.parse(offlineNotesStr);
    delete offlineNotes[lectureId];
    localStorage.setItem(`offline_notes_${userId}`, JSON.stringify(offlineNotes));

    if (navigator.onLine) {
        const noteRef = doc(db, `users/${userId}/notes/${lectureId}`);
        await deleteDoc(noteRef);
    }
}
