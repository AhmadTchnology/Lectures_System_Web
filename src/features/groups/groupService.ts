import {
    collection, addDoc, deleteDoc, doc, updateDoc,
    query, orderBy, onSnapshot, arrayUnion, arrayRemove, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase';
import type { Group } from '../../types';

export function subscribeGroups(
    callback: (groups: Group[]) => void,
    onError?: (err: Error) => void
) {
    const q = query(collection(db, 'groups'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Group)));
    }, (err) => onError?.(err as Error));
}

export async function createGroup(data: Omit<Group, 'id' | 'createdAt'>) {
    return addDoc(collection(db, 'groups'), {
        ...data,
        createdAt: serverTimestamp(),
    });
}

export async function deleteGroup(groupId: string) {
    return deleteDoc(doc(db, 'groups', groupId));
}

export async function updateGroup(groupId: string, data: Partial<Group>) {
    return updateDoc(doc(db, 'groups', groupId), data);
}

export async function addMember(groupId: string, userId: string) {
    return updateDoc(doc(db, 'groups', groupId), {
        members: arrayUnion(userId),
    });
}

export async function removeMember(groupId: string, userId: string) {
    return updateDoc(doc(db, 'groups', groupId), {
        members: arrayRemove(userId),
    });
}
