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
    writeBatch,
    getDocs,
} from 'firebase/firestore';
import {
    createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth, db } from '../../firebase';
import type { User, Role } from '../../types';

export function subscribeUsers(
    callback: (users: User[]) => void,
    onError?: (error: Error) => void
) {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));

    return onSnapshot(
        q,
        (snapshot) => {
            const usersList = snapshot.docs.map((d) => ({
                id: d.id,
                ...d.data(),
            })) as User[];
            callback(usersList);
        },
        (error) => {
            console.error('Error fetching users:', error);
            onError?.(error as Error);
        }
    );
}

export async function addUser(data: {
    email: string;
    password: string;
    name: string;
    role: Role;
}) {
    const credential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
    );

    const newUser: Omit<User, 'id' | 'password'> & { uid: string } = {
        email: data.email,
        role: data.role,
        name: data.name,
        createdAt: serverTimestamp(),
        uid: credential.user.uid,
        favorites: [],
        completedLectures: [],
    };

    return addDoc(collection(db, 'users'), newUser);
}

export async function editUser(
    userId: string,
    data: { name: string; email: string; role: Role }
) {
    return updateDoc(doc(db, 'users', userId), {
        name: data.name,
        email: data.email,
        role: data.role,
    });
}

export async function deleteUser(userId: string) {
    return deleteDoc(doc(db, 'users', userId));
}

export async function forceSignOutAll() {
    const batch = writeBatch(db);
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const forceSignOutTime = Date.now();

    usersSnapshot.docs.forEach((userDoc) => {
        batch.update(doc(db, 'users', userDoc.id), {
            lastSignOut: forceSignOutTime,
        });
    });

    return batch.commit();
}
