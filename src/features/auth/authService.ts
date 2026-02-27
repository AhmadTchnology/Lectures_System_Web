import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    type User as FirebaseUser,
} from 'firebase/auth';
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    updateDoc,
    doc,
    serverTimestamp,
    getDoc,
} from 'firebase/firestore';
import { auth, db } from '../../firebase';
import type { User, Role } from '../../types';
import { OfflineAuthManager } from '../../utils/offlineAuth';

export async function signIn(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
}

export async function signUp(email: string, password: string, name: string) {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser: Omit<User, 'id' | 'password'> = {
        email,
        name,
        role: 'student' as Role,
        createdAt: serverTimestamp(),
        favorites: [],
        completedLectures: [],
    };
    await addDoc(collection(db, 'users'), newUser);
    return credential;
}

export async function signOutUser() {
    await firebaseSignOut(auth);
    OfflineAuthManager.clearSession();
}

export async function fetchUserByEmail(email: string): Promise<User | null> {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const data = snapshot.docs[0].data() as User;
    data.id = snapshot.docs[0].id;
    return data;
}

export async function initializeUserFields(userData: User): Promise<User> {
    const userRef = doc(db, 'users', userData.id);
    const updates: Partial<User> = {};

    if (!userData.favorites) updates.favorites = [];
    if (!userData.completedLectures) updates.completedLectures = [];
    if (!userData.unreadAnnouncements) updates.unreadAnnouncements = [];

    if (Object.keys(updates).length > 0) {
        await updateDoc(userRef, updates);
        Object.assign(userData, updates);
    }

    return userData;
}

export function subscribeAuthState(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
}

export async function checkForceSignOut(userData: User, firebaseUser: FirebaseUser): Promise<boolean> {
    const lastSignOut = userData.lastSignOut || 0;
    const lastSignIn = firebaseUser.metadata.lastSignInTime
        ? new Date(firebaseUser.metadata.lastSignInTime).getTime()
        : Infinity;
    return lastSignOut > lastSignIn;
}
