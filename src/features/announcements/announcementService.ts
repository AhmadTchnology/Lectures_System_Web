import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    onSnapshot,
    updateDoc,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase';
import type { Announcement } from '../../types';

export function subscribeAnnouncements(
    callback: (announcements: Announcement[]) => void,
    onError?: (error: Error) => void
) {
    const q = query(
        collection(db, 'announcements'),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const list = snapshot.docs.map((d) => ({
                id: d.id,
                ...d.data(),
            })) as Announcement[];
            callback(list);
        },
        (error) => {
            console.error('Error fetching announcements:', error);
            onError?.(error as Error);
        }
    );
}

export async function addAnnouncement(data: {
    title: string;
    content: string;
    type: Announcement['type'];
    createdBy: string;
    creatorName: string;
    expiryDate?: string;
}) {
    return addDoc(collection(db, 'announcements'), {
        ...data,
        expiryDate: data.expiryDate || null,
        createdAt: serverTimestamp(),
    });
}

export async function deleteAnnouncement(announcementId: string) {
    return deleteDoc(doc(db, 'announcements', announcementId));
}

export async function markAsRead(
    userId: string,
    announcementId: string,
    currentRead: string[]
) {
    if (currentRead.includes(announcementId)) return currentRead;

    const updatedRead = [...currentRead, announcementId];
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { unreadAnnouncements: updatedRead });
    return updatedRead;
}
