import { useMemo, useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import type { Lecture, Announcement } from '../../types';

interface SubjectProgress {
    subject: string;
    total: number;
    completed: number;
    percentage: number;
}

interface ActivityItem {
    lectureId: string;
    lectureTitle: string;
    completedAt: number;
}

interface Deadline {
    id: string;
    title: string;
    type: string;
    expiryDate: string;
    daysRemaining: number;
}

interface DashboardStats {
    totalLectures: number;
    completedCount: number;
    favoritesCount: number;
    activeDays: number;
}

export interface AdminDashboardStats {
    totalStudents: number;
    avgCompletionRate: number;
    avgActiveDays: number;
    totalLectures: number;
}

export function useDashboard(lectures: Lecture[], announcements: Announcement[]) {
    const { currentUser } = useAuth();
    const [adminStats, setAdminStats] = useState<AdminDashboardStats | null>(null);
    const [isLoadingAdminStats, setIsLoadingAdminStats] = useState(false);

    useEffect(() => {
        if (currentUser?.role !== 'admin' && currentUser?.role !== 'teacher') {
            setAdminStats(null);
            return;
        }

        const fetchAdminStats = async () => {
            setIsLoadingAdminStats(true);
            try {
                const usersSnap = await getDocs(collection(db, 'users'));
                let studentCount = 0;
                let totalCompletions = 0;
                let totalActiveDays = 0;

                usersSnap.forEach(doc => {
                    const userData = doc.data();
                    if (userData.role === 'student') {
                        studentCount++;

                        const completedCount = userData.completedLectures?.length || 0;
                        totalCompletions += completedCount;

                        const timestamps = userData.completionTimestamps || {};
                        const uniqueDays = new Set(
                            Object.values(timestamps).map((ts: any) =>
                                new Date(ts).toISOString().split('T')[0]
                            )
                        );
                        totalActiveDays += uniqueDays.size;
                    }
                });

                setAdminStats({
                    totalStudents: studentCount,
                    avgCompletionRate: studentCount > 0 && lectures.length > 0
                        ? Math.round((totalCompletions / (studentCount * lectures.length)) * 100)
                        : 0,
                    avgActiveDays: studentCount > 0 ? Math.round((totalActiveDays / studentCount) * 10) / 10 : 0,
                    totalLectures: lectures.length,
                });
            } catch (err) {
                console.error("Failed to fetch admin stats", err);
            } finally {
                setIsLoadingAdminStats(false);
            }
        };

        fetchAdminStats();
    }, [currentUser?.role, lectures.length]);

    const completionBySubject = useMemo((): SubjectProgress[] => {
        const map = new Map<string, { total: number; completed: number }>();

        for (const lecture of lectures) {
            const entry = map.get(lecture.subject) || { total: 0, completed: 0 };
            entry.total++;
            if (currentUser?.completedLectures?.includes(lecture.id)) {
                entry.completed++;
            }
            map.set(lecture.subject, entry);
        }

        return Array.from(map.entries()).map(([subject, data]) => ({
            subject,
            total: data.total,
            completed: data.completed,
            percentage: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
        }));
    }, [lectures, currentUser?.completedLectures]);

    const completionByStage = useMemo((): SubjectProgress[] => {
        const map = new Map<string, { total: number; completed: number }>();

        for (const lecture of lectures) {
            const entry = map.get(lecture.stage) || { total: 0, completed: 0 };
            entry.total++;
            if (currentUser?.completedLectures?.includes(lecture.id)) {
                entry.completed++;
            }
            map.set(lecture.stage, entry);
        }

        return Array.from(map.entries()).map(([subject, data]) => ({
            subject,
            total: data.total,
            completed: data.completed,
            percentage: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
        }));
    }, [lectures, currentUser?.completedLectures]);

    const recentActivity = useMemo((): ActivityItem[] => {
        const timestamps = currentUser?.completionTimestamps || {};
        const lectureMap = new Map(lectures.map((l) => [l.id, l]));

        return Object.entries(timestamps)
            .map(([lectureId, completedAt]) => ({
                lectureId,
                lectureTitle: lectureMap.get(lectureId)?.title || 'Unknown Lecture',
                completedAt,
            }))
            .sort((a, b) => b.completedAt - a.completedAt)
            .slice(0, 5);
    }, [lectures, currentUser?.completionTimestamps]);

    const upcomingDeadlines = useMemo((): Deadline[] => {
        const now = new Date();
        return announcements
            .filter(
                (a) =>
                    (a.type === 'exam' || a.type === 'homework') &&
                    a.expiryDate &&
                    new Date(a.expiryDate) > now
            )
            .map((a) => {
                const expiry = new Date(a.expiryDate!);
                const diffMs = expiry.getTime() - now.getTime();
                const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                return {
                    id: a.id,
                    title: a.title,
                    type: a.type,
                    expiryDate: a.expiryDate!,
                    daysRemaining,
                };
            })
            .sort((a, b) => a.daysRemaining - b.daysRemaining);
    }, [announcements]);

    const stats = useMemo((): DashboardStats => {
        const completedCount = currentUser?.completedLectures?.length || 0;
        const favoritesCount = currentUser?.favorites?.length || 0;

        const timestamps = currentUser?.completionTimestamps || {};
        const uniqueDays = new Set(
            Object.values(timestamps).map((ts) =>
                new Date(ts).toISOString().split('T')[0]
            )
        );

        return {
            totalLectures: lectures.length,
            completedCount,
            favoritesCount,
            activeDays: uniqueDays.size,
        };
    }, [lectures, currentUser?.completedLectures, currentUser?.favorites, currentUser?.completionTimestamps]);

    return {
        completionBySubject,
        completionByStage,
        recentActivity,
        upcomingDeadlines,
        stats,
        adminStats,
        isLoadingAdminStats
    };
}
