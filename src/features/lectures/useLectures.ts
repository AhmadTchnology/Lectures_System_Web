import { useState, useEffect, useMemo } from 'react';
import type { Lecture, Category } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { OfflineDataCache } from '../../utils/offlineDataCache';
import * as lectureService from './lectureService';

export function useLectures(categories: Category[]) {
    const { currentUser, isAuthenticated, setCurrentUser } = useAuth();
    const isOnline = useOnlineStatus();
    const [lectures, setLectures] = useState<Lecture[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSubject, setFilterSubject] = useState('all');
    const [filterStage, setFilterStage] = useState('all');
    const [showFavorites, setShowFavorites] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Load cached lectures first
    useEffect(() => {
        const cached = OfflineDataCache.getCachedLectures();
        if (cached) setLectures(cached);
    }, []);

    // Subscribe to Firebase
    useEffect(() => {
        if (!isAuthenticated || !isOnline) return;

        const unsubscribe = lectureService.subscribeLectures((list) => {
            if (list.length > 0) setLectures(list);
        });

        return () => unsubscribe();
    }, [isAuthenticated, isOnline]);

    // Filtered lectures
    const filteredLectures = useMemo(() => {
        let filtered = [...lectures];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (l) =>
                    l.title.toLowerCase().includes(term) ||
                    l.subject.toLowerCase().includes(term)
            );
        }

        if (filterSubject !== 'all') {
            filtered = filtered.filter(
                (l) => l.subject.toLowerCase() === filterSubject.toLowerCase()
            );
        }

        if (filterStage !== 'all') {
            filtered = filtered.filter(
                (l) => l.stage.toLowerCase() === filterStage.toLowerCase()
            );
        }

        if (showFavorites && currentUser?.role === 'student') {
            filtered = filtered.filter((l) =>
                currentUser?.favorites?.includes(l.id)
            );
        }

        return filtered;
    }, [lectures, searchTerm, filterSubject, filterStage, showFavorites, currentUser]);

    const subjects = useMemo(
        () => categories.filter((c) => c.type === 'subject'),
        [categories]
    );
    const stages = useMemo(
        () => categories.filter((c) => c.type === 'stage'),
        [categories]
    );

    const toggleFavorite = async (lectureId: string) => {
        if (!currentUser) return;
        try {
            const updatedFavorites = await lectureService.toggleFavorite(
                currentUser.id,
                lectureId
            );
            setCurrentUser((prev) => (prev ? { ...prev, favorites: updatedFavorites } : prev));
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const toggleCompletion = async (lectureId: string) => {
        if (!currentUser) return;
        try {
            const result = await lectureService.toggleCompletion(
                currentUser.id,
                lectureId
            );
            setCurrentUser((prev) =>
                prev ? {
                    ...prev,
                    completedLectures: result.completedLectures,
                    completionTimestamps: result.completionTimestamps,
                } : prev
            );
        } catch (error) {
            console.error('Error toggling completion:', error);
        }
    };

    const deleteLecture = async (lecture: Lecture) => {
        if (currentUser?.role !== 'admin' && currentUser?.id !== lecture.uploadedBy) {
            alert('You do not have permission to delete this lecture');
            return;
        }
        if (!confirm('Are you sure you want to delete this lecture?')) return;

        setIsLoading(true);
        try {
            await lectureService.deleteLecture(lecture.id);
            alert('Lecture deleted successfully');
        } catch (error) {
            console.error('Error deleting lecture:', error);
            alert('Error deleting lecture');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        lectures,
        filteredLectures,
        searchTerm,
        setSearchTerm,
        filterSubject,
        setFilterSubject,
        filterStage,
        setFilterStage,
        showFavorites,
        setShowFavorites,
        subjects,
        stages,
        isLoading,
        toggleFavorite,
        toggleCompletion,
        deleteLecture,
        handleViewPDF: lectureService.handleViewPDF,
    };
}
