import { useState, useEffect } from 'react';
import { subscribeQuizzes } from './quizService';
import type { Quiz } from '../../types/quiz';
import { useAuth } from '../../contexts/AuthContext';

export function useQuizzes() {
    const { currentUser } = useAuth();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsub = subscribeQuizzes(
            (list) => {
                setQuizzes(list);
                setIsLoading(false);
            },
            () => setIsLoading(false)
        );
        return unsub;
    }, []);

    const isTeacherOrAdmin =
        currentUser?.role === 'admin' || currentUser?.role === 'teacher';

    const visibleQuizzes = isTeacherOrAdmin
        ? quizzes
        : quizzes.filter((q) => q.isPublished);

    return { quizzes: visibleQuizzes, allQuizzes: quizzes, isLoading, isTeacherOrAdmin };
}
