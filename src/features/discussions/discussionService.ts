import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    deleteDoc,
    doc,
    updateDoc,
} from 'firebase/firestore';
import { db } from '../../firebase';

export interface Comment {
    id: string;
    text: string;
    userId: string;
    userName: string;
    userRole?: string;
    createdAt: any; // Firestore Timestamp
    lectureId: string;
    isPinned?: boolean;
}

export function subscribeToComments(lectureId: string, onUpdate: (comments: Comment[]) => void) {
    if (!navigator.onLine) {
        // Fallback for offline reading (no offline adding supported for simplicity)
        const cached = localStorage.getItem(`comments_${lectureId}`);
        if (cached) onUpdate(JSON.parse(cached));
        return () => { };
    }

    const commentsRef = collection(db, `lectures/${lectureId}/comments`);
    const q = query(commentsRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const comments = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Comment[];

        // Sort pinned comments to the top
        comments.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return 0; // preserve original orderBy('createdAt', 'asc') for others
        });

        // Cache for offline
        localStorage.setItem(`comments_${lectureId}`, JSON.stringify(comments));
        onUpdate(comments);
    });

    return unsubscribe;
}

export async function addComment(lectureId: string, text: string, userId: string, userName: string, userRole?: string) {
    if (!navigator.onLine) throw new Error('Cannot post comments while offline');

    const commentsRef = collection(db, `lectures/${lectureId}/comments`);
    await addDoc(commentsRef, {
        text,
        userId,
        userName,
        userRole,
        lectureId,
        createdAt: serverTimestamp(),
        isPinned: false,
    });
}

export async function deleteComment(lectureId: string, commentId: string) {
    if (!navigator.onLine) throw new Error('Cannot delete comments while offline');

    const commentRef = doc(db, `lectures/${lectureId}/comments/${commentId}`);
    await deleteDoc(commentRef);
}

export async function togglePinComment(lectureId: string, commentId: string, isPinned: boolean) {
    if (!navigator.onLine) throw new Error('Cannot pin comments while offline');

    const commentRef = doc(db, `lectures/${lectureId}/comments/${commentId}`);
    await updateDoc(commentRef, {
        isPinned,
    });
}
