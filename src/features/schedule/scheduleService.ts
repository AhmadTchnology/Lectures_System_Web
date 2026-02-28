import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../firebase';
import type { StudySession, User } from '../../types';

export async function getSchedule(userId: string): Promise<StudySession[]> {
    if (!navigator.onLine) {
        const offlineSchedule = localStorage.getItem(`offline_schedule_${userId}`);
        return offlineSchedule ? JSON.parse(offlineSchedule) : [];
    }

    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        const data = userSnap.data() as User;
        const schedule = data.studySchedule || [];
        localStorage.setItem(`offline_schedule_${userId}`, JSON.stringify(schedule));
        return schedule;
    }
    return [];
}

export async function addSession(userId: string, session: StudySession) {
    // Offline optimistic update
    const offlineScheduleStr = localStorage.getItem(`offline_schedule_${userId}`) || '[]';
    const offlineSchedule: StudySession[] = JSON.parse(offlineScheduleStr);
    offlineSchedule.push(session);
    localStorage.setItem(`offline_schedule_${userId}`, JSON.stringify(offlineSchedule));

    if (navigator.onLine) {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            studySchedule: arrayUnion(session),
        });
    }
}

export async function removeSession(userId: string, session: StudySession) {
    // Offline optimistic update
    const offlineScheduleStr = localStorage.getItem(`offline_schedule_${userId}`) || '[]';
    let offlineSchedule: StudySession[] = JSON.parse(offlineScheduleStr);
    offlineSchedule = offlineSchedule.filter(s => s.id !== session.id);
    localStorage.setItem(`offline_schedule_${userId}`, JSON.stringify(offlineSchedule));

    if (navigator.onLine) {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            studySchedule: arrayRemove(session),
        });
    }
}

export async function updateSession(userId: string, session: StudySession) {
    // This requires reading, removing old, and adding new since array update in firestore doesn't support modifying items inline well
    const schedule = await getSchedule(userId);
    const oldSession = schedule.find(s => s.id === session.id);

    if (oldSession) {
        await removeSession(userId, oldSession);
    }
    await addSession(userId, session);
}
