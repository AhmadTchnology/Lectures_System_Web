import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase';
import type { Category } from '../../types';
import { OfflineDataCache } from '../../utils/offlineDataCache';

export function subscribeCategories(
    callback: (categories: Category[]) => void,
    onError?: (error: Error) => void
) {
    const q = query(
        collection(db, 'categories'),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const list = snapshot.docs.map((d) => ({
                id: d.id,
                ...d.data(),
            })) as Category[];

            if (list.length > 0) {
                OfflineDataCache.saveCategories(list);
            }
            callback(list);
        },
        (error) => {
            console.error('Error fetching categories:', error);
            onError?.(error as Error);
        }
    );
}

export async function addCategory(name: string, type: 'subject' | 'stage') {
    return addDoc(collection(db, 'categories'), {
        name: name.trim(),
        type,
        createdAt: serverTimestamp(),
    });
}

export async function deleteCategory(categoryId: string) {
    return deleteDoc(doc(db, 'categories', categoryId));
}
