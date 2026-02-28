import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import * as discussionService from './discussionService';
import type { Comment } from './discussionService';

export function useDiscussions(lectureId?: string) {
    const { currentUser } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!lectureId) {
            setComments([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const unsubscribe = discussionService.subscribeToComments(lectureId, (newComments) => {
            setComments(newComments);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [lectureId]);

    const postComment = async (text: string) => {
        if (!currentUser || !lectureId) return;

        setError(null);
        try {
            await discussionService.addComment(
                lectureId,
                text,
                currentUser.id,
                currentUser.name,
                currentUser.role
            );
        } catch (err: any) {
            console.error('Failed to post comment', err);
            setError(err.message || 'Failed to post comment');
            throw err;
        }
    };

    const removeComment = async (commentId: string) => {
        if (!lectureId) return;

        setError(null);
        try {
            await discussionService.deleteComment(lectureId, commentId);
        } catch (err: any) {
            console.error('Failed to delete comment', err);
            setError(err.message || 'Failed to delete comment');
            throw err;
        }
    };

    const togglePin = async (commentId: string, isPinned: boolean) => {
        if (!lectureId) return;

        setError(null);
        try {
            await discussionService.togglePinComment(lectureId, commentId, isPinned);
        } catch (err: any) {
            console.error('Failed to pin comment', err);
            setError(err.message || 'Failed to pin/unpin comment');
            throw err;
        }
    };

    return {
        comments,
        isLoading,
        error,
        postComment,
        removeComment,
        togglePin,
    };
}
