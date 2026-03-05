import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import type { Lecture, User, Announcement } from '../../types';

export interface LectureStat {
    id: string;
    title: string;
    subject: string;
    stage: string;
    viewCount: number;
    favoritesCount: number;
    completionCount: number;
}

export interface SubjectDistribution {
    name: string;
    count: number;
}

export interface StageCompletion {
    stage: string;
    completed: number;
    total: number;
    percentage: number;
}

export interface TopStudent {
    id: string;
    name: string;
    email: string;
    completedCount: number;
    percentage: number;
}

export interface AnalyticsData {
    totalUsers: number;
    activeUsers7d: number;
    totalLectures: number;
    overallCompletionRate: number;
    lectureStats: LectureStat[];
    subjectDistribution: SubjectDistribution[];
    stageCompletion: StageCompletion[];
    topStudents: TopStudent[];
}

async function fetchAllLectures(): Promise<Lecture[]> {
    const q = query(collection(db, 'lectures'), orderBy('uploadDate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Lecture));
}

async function fetchAllUsers(): Promise<User[]> {
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as User));
}

async function fetchAllAnnouncements(): Promise<Announcement[]> {
    const snapshot = await getDocs(collection(db, 'announcements'));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Announcement));
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
    const [lectures, users, _announcements] = await Promise.all([
        fetchAllLectures(),
        fetchAllUsers(),
        fetchAllAnnouncements(),
    ]);

    const students = users.filter((u) => u.role === 'student');
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    const activeUsers7d = users.filter(
        (u) => u.lastActive && now - u.lastActive < sevenDaysMs
    ).length;

    // Lecture stats
    const lectureStats: LectureStat[] = lectures.map((lec) => {
        const favoritesCount = users.filter(
            (u) => u.favorites?.includes(lec.id)
        ).length;
        const completionCount = users.filter(
            (u) => u.completedLectures?.includes(lec.id)
        ).length;
        return {
            id: lec.id,
            title: lec.title,
            subject: lec.subject,
            stage: lec.stage,
            viewCount: lec.viewCount ?? 0,
            favoritesCount,
            completionCount,
        };
    });

    // Subject distribution
    const subjectMap = new Map<string, number>();
    lectures.forEach((lec) => {
        subjectMap.set(lec.subject, (subjectMap.get(lec.subject) ?? 0) + 1);
    });
    const subjectDistribution: SubjectDistribution[] = Array.from(
        subjectMap.entries()
    ).map(([name, count]) => ({ name, count }));

    // Stage completion
    const stageMap = new Map<string, { total: number; completed: number }>();
    lectures.forEach((lec) => {
        const entry = stageMap.get(lec.stage) ?? { total: 0, completed: 0 };
        entry.total++;
        const completions = students.filter(
            (u) => u.completedLectures?.includes(lec.id)
        ).length;
        entry.completed += completions;
        stageMap.set(lec.stage, entry);
    });
    const stageCompletion: StageCompletion[] = Array.from(
        stageMap.entries()
    ).map(([stage, data]) => ({
        stage,
        completed: data.completed,
        total: data.total * Math.max(students.length, 1),
        percentage:
            data.total * Math.max(students.length, 1) > 0
                ? Math.round(
                    (data.completed /
                        (data.total * Math.max(students.length, 1))) *
                    100
                )
                : 0,
    }));

    // Top students
    const topStudents: TopStudent[] = students
        .map((s) => ({
            id: s.id,
            name: s.name,
            email: s.email,
            completedCount: s.completedLectures?.length ?? 0,
            percentage:
                lectures.length > 0
                    ? Math.round(
                        ((s.completedLectures?.length ?? 0) /
                            lectures.length) *
                        100
                    )
                    : 0,
        }))
        .sort((a, b) => b.completedCount - a.completedCount)
        .slice(0, 10);

    // Overall completion rate
    const totalPossible = lectures.length * Math.max(students.length, 1);
    const totalCompleted = students.reduce(
        (sum, s) => sum + (s.completedLectures?.length ?? 0),
        0
    );
    const overallCompletionRate =
        totalPossible > 0
            ? Math.round((totalCompleted / totalPossible) * 100)
            : 0;

    return {
        totalUsers: users.length,
        activeUsers7d,
        totalLectures: lectures.length,
        overallCompletionRate,
        lectureStats,
        subjectDistribution,
        stageCompletion,
        topStudents,
    };
}
