import { useEffect, useState } from 'react';
import { Users, Activity, BookOpen, TrendingUp } from 'lucide-react';

interface StatsOverviewProps {
    totalUsers: number;
    activeUsers7d: number;
    totalLectures: number;
    completionRate: number;
}

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
    const [value, setValue] = useState(0);

    useEffect(() => {
        if (target === 0) { setValue(0); return; }
        const duration = 800;
        const steps = 30;
        const increment = target / steps;
        let current = 0;
        const interval = setInterval(() => {
            current += increment;
            if (current >= target) {
                setValue(target);
                clearInterval(interval);
            } else {
                setValue(Math.floor(current));
            }
        }, duration / steps);
        return () => clearInterval(interval);
    }, [target]);

    return <span>{value.toLocaleString()}{suffix}</span>;
}

const cards = [
    { key: 'users', label: 'Total Users', icon: Users, color: 'var(--primary-color)' },
    { key: 'active', label: 'Active (7d)', icon: Activity, color: '#10b981' },
    { key: 'lectures', label: 'Total Lectures', icon: BookOpen, color: '#f59e0b' },
    { key: 'completion', label: 'Completion Rate', icon: TrendingUp, color: '#6366f1' },
] as const;

export default function StatsOverview({ totalUsers, activeUsers7d, totalLectures, completionRate }: StatsOverviewProps) {
    const values: Record<string, { value: number; suffix: string }> = {
        users: { value: totalUsers, suffix: '' },
        active: { value: activeUsers7d, suffix: '' },
        lectures: { value: totalLectures, suffix: '' },
        completion: { value: completionRate, suffix: '%' },
    };

    return (
        <div className="analytics-stats-grid">
            {cards.map(({ key, label, icon: Icon, color }) => (
                <div key={key} className="analytics-stat-card">
                    <div className="analytics-stat-icon" style={{ backgroundColor: `${color}18`, color }}>
                        <Icon size={22} />
                    </div>
                    <div className="analytics-stat-info">
                        <span className="analytics-stat-value">
                            <AnimatedCounter target={values[key].value} suffix={values[key].suffix} />
                        </span>
                        <span className="analytics-stat-label">{label}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
