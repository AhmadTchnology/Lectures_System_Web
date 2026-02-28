import { BookOpen, CheckCircle, Heart, Calendar, Users, BarChart2, Activity } from 'lucide-react';
import type { AdminDashboardStats } from './useDashboard';

interface StatsCardsProps {
    stats?: {
        totalLectures: number;
        completedCount: number;
        favoritesCount: number;
        activeDays: number;
    };
    adminStats?: AdminDashboardStats | null;
}

export default function StatsCards({ stats, adminStats }: StatsCardsProps) {
    let cards: any[] = [];

    if (adminStats) {
        cards = [
            {
                label: 'Total Students',
                value: adminStats.totalStudents,
                icon: Users,
                color: 'var(--primary-color)',
                bgClass: 'stats-card-primary',
            },
            {
                label: 'Avg Completion',
                value: `${adminStats.avgCompletionRate}%`,
                icon: BarChart2,
                color: 'var(--success-color)',
                bgClass: 'stats-card-success',
            },
            {
                label: 'Avg Active Days',
                value: adminStats.avgActiveDays,
                icon: Activity,
                color: 'var(--warning-color)',
                bgClass: 'stats-card-warning',
            },
            {
                label: 'Total Lectures',
                value: adminStats.totalLectures,
                icon: BookOpen,
                color: 'var(--primary-color)',
                bgClass: 'stats-card-info',
            },
        ];
    } else if (stats) {
        cards = [
            {
                label: 'Total Lectures',
                value: stats.totalLectures,
                icon: BookOpen,
                color: 'var(--primary-color)',
                bgClass: 'stats-card-primary',
            },
            {
                label: 'Completed',
                value: stats.completedCount,
                icon: CheckCircle,
                color: 'var(--success-color)',
                bgClass: 'stats-card-success',
            },
            {
                label: 'Favorites',
                value: stats.favoritesCount,
                icon: Heart,
                color: 'var(--warning-color)',
                bgClass: 'stats-card-warning',
            },
            {
                label: 'Active Days',
                value: stats.activeDays,
                icon: Calendar,
                color: 'var(--primary-color)',
                bgClass: 'stats-card-info',
            },
        ];
    }

    return (
        <div className="dashboard-stats-grid">
            {cards.map((card) => (
                <div key={card.label} className={`dashboard-stat-card ${card.bgClass}`}>
                    <div className="stat-card-icon" style={{ color: card.color }}>
                        <card.icon size={28} />
                    </div>
                    <div className="stat-card-content">
                        <span className="stat-card-value">{card.value}</span>
                        <span className="stat-card-label">{card.label}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
