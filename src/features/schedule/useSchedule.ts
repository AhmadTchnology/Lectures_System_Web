import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import * as scheduleService from './scheduleService';
import type { StudySession } from '../../types';

export function useSchedule() {
    const { currentUser } = useAuth();
    const [schedule, setSchedule] = useState<StudySession[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!currentUser?.id) return;

        const fetchSchedule = async () => {
            setIsLoading(true);
            try {
                const fetched = await scheduleService.getSchedule(currentUser.id);
                setSchedule(fetched);
            } catch (err: any) {
                console.error('Failed to load schedule', err);
                setError('Failed to load schedule');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSchedule();
    }, [currentUser?.id]);

    const addSession = async (session: Omit<StudySession, 'id'>) => {
        if (!currentUser?.id) return;
        const newSession = { ...session, id: crypto.randomUUID() };

        try {
            await scheduleService.addSession(currentUser.id, newSession);
            setSchedule(prev => [...prev, newSession]);
        } catch (err) {
            console.error('Failed to add session', err);
            setError('Failed to add session');
        }
    };

    const removeSession = async (session: StudySession) => {
        if (!currentUser?.id) return;

        try {
            await scheduleService.removeSession(currentUser.id, session);
            setSchedule(prev => prev.filter(s => s.id !== session.id));
        } catch (err) {
            console.error('Failed to remove session', err);
            setError('Failed to remove session');
        }
    };

    const toggleSessionCompletion = async (session: StudySession) => {
        if (!currentUser?.id) return;

        const updatedSession = { ...session, isCompleted: !session.isCompleted };

        try {
            await scheduleService.updateSession(currentUser.id, updatedSession);
            setSchedule(prev => prev.map(s => s.id === session.id ? updatedSession : s));
        } catch (err) {
            console.error('Failed to update session', err);
            setError('Failed to update session');
        }
    };

    return {
        schedule,
        isLoading,
        error,
        addSession,
        removeSession,
        toggleSessionCompletion,
    };
}
