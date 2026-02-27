import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    onSnapshot,
    updateDoc,
    getDoc,
} from 'firebase/firestore';
import { db } from '../../firebase';
import type { Lecture } from '../../types';
import { OfflineDataCache } from '../../utils/offlineDataCache';
import { OfflineAuthManager } from '../../utils/offlineAuth';

export function subscribeLectures(
    callback: (lectures: Lecture[]) => void,
    onError?: (error: Error) => void
) {
    const lecturesQuery = query(
        collection(db, 'lectures'),
        orderBy('uploadDate', 'desc')
    );

    return onSnapshot(
        lecturesQuery,
        (snapshot) => {
            const lecturesList = snapshot.docs.map((d) => ({
                id: d.id,
                ...d.data(),
            })) as Lecture[];

            if (lecturesList.length > 0) {
                OfflineDataCache.saveLectures(lecturesList);
            }
            callback(lecturesList);
        },
        (error) => {
            console.error('Error fetching lectures:', error);
            onError?.(error as Error);
        }
    );
}

export async function addLecture(data: {
    title: string;
    subject: string;
    stage: string;
    pdfUrl: string;
    uploadedBy: string;
}) {
    return addDoc(collection(db, 'lectures'), {
        ...data,
        uploadDate: new Date().toISOString().split('T')[0],
    });
}

export async function deleteLecture(lectureId: string) {
    return deleteDoc(doc(db, 'lectures', lectureId));
}

export async function uploadPdfToServer(file: File): Promise<string> {
    const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:7444';

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${SERVER_URL}/api/upload`, {
        method: 'POST',
        // Authorization header is no longer needed here; it's handled securely by the Express server
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    const uploadedUrl = result.files?.[0]?.url || result.url;

    if (!uploadedUrl) {
        throw new Error('No URL returned from upload.');
    }

    return uploadedUrl;
}

export async function toggleFavorite(
    userId: string,
    lectureId: string
) {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const favorites = userDoc.data()?.favorites || [];

    const updatedFavorites = favorites.includes(lectureId)
        ? favorites.filter((id: string) => id !== lectureId)
        : [...favorites, lectureId];

    OfflineAuthManager.updateCachedUser({ favorites: updatedFavorites });

    if (navigator.onLine) {
        await updateDoc(userRef, { favorites: updatedFavorites });
    }

    return updatedFavorites;
}

export async function toggleCompletion(
    userId: string,
    lectureId: string
) {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const completedLectures = userDoc.data()?.completedLectures || [];

    const updatedCompleted = completedLectures.includes(lectureId)
        ? completedLectures.filter((id: string) => id !== lectureId)
        : [...completedLectures, lectureId];

    OfflineAuthManager.updateCachedUser({ completedLectures: updatedCompleted });

    if (navigator.onLine) {
        await updateDoc(userRef, { completedLectures: updatedCompleted });
    }

    return updatedCompleted;
}

export function handleViewPDF(lecture: Lecture) {
    if (!navigator.onLine) {
        fetch(lecture.pdfUrl)
            .then((response) => {
                if (response.ok) {
                    window.open(lecture.pdfUrl, '_blank');
                } else {
                    alert('This lecture is not available offline.');
                }
            })
            .catch(() => {
                alert('This lecture is not available offline. Please connect to the internet.');
            });
        return;
    }
    window.open(lecture.pdfUrl, '_blank');
}
