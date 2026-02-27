import { useState, useEffect } from 'react';
import type { Announcement } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import * as announcementService from './announcementService';

export function useAnnouncements() {
    const { currentUser, isAuthenticated, setCurrentUser } = useAuth();
    const isOnline = useOnlineStatus();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isAuthenticated || !isOnline) return;

        const unsubscribe = announcementService.subscribeAnnouncements((list) => {
            setAnnouncements(list);
            if (currentUser) {
                const readIds = currentUser.unreadAnnouncements || [];
                const count = list.filter((a) => !readIds.includes(a.id)).length;
                setUnreadCount(count);
            }
        });

        return () => unsubscribe();
    }, [isAuthenticated, isOnline, currentUser]);

    const addAnnouncement = async (data: {
        title: string;
        content: string;
        type: Announcement['type'];
        expiryDate?: string;
    }) => {
        if (!currentUser) return;
        setIsLoading(true);
        try {
            await announcementService.addAnnouncement({
                ...data,
                createdBy: currentUser.id,
                creatorName: currentUser.name,
            });
            alert('Announcement created successfully!');
        } catch (error) {
            console.error('Error creating announcement:', error);
            alert('Error creating announcement');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteAnnouncement = async (announcementId: string, createdBy: string) => {
        if (currentUser?.role !== 'admin' && currentUser?.id !== createdBy) {
            alert('You do not have permission to delete this announcement');
            return;
        }
        if (!confirm('Are you sure you want to delete this announcement?')) return;

        setIsLoading(true);
        try {
            await announcementService.deleteAnnouncement(announcementId);
            alert('Announcement deleted successfully');
        } catch (error) {
            console.error('Error deleting announcement:', error);
            alert('Error deleting announcement');
        } finally {
            setIsLoading(false);
        }
    };

    const markAsRead = async (announcementId: string) => {
        if (!currentUser) return;
        try {
            const currentRead = currentUser.unreadAnnouncements || [];
            if (currentRead.includes(announcementId)) return;

            const updatedRead = await announcementService.markAsRead(
                currentUser.id,
                announcementId,
                currentRead
            );
            setCurrentUser((prev) =>
                prev ? { ...prev, unreadAnnouncements: updatedRead } : prev
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    return {
        announcements,
        unreadCount,
        isLoading,
        addAnnouncement,
        deleteAnnouncement,
        markAsRead,
    };
}
