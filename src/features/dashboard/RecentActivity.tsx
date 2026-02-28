import { Clock } from 'lucide-react';

interface ActivityItem {
    lectureId: string;
    lectureTitle: string;
    completedAt: number;
}

interface RecentActivityProps {
    activities: ActivityItem[];
}

function formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

export default function RecentActivity({ activities }: RecentActivityProps) {
    if (activities.length === 0) {
        return (
            <div className="dashboard-card">
                <h3 className="dashboard-card-title">
                    <Clock size={20} /> Recent Activity
                </h3>
                <p className="dashboard-empty">No completed lectures yet. Start learning!</p>
            </div>
        );
    }

    return (
        <div className="dashboard-card">
            <h3 className="dashboard-card-title">
                <Clock size={20} /> Recent Activity
            </h3>
            <ul className="activity-list">
                {activities.map((activity) => (
                    <li key={activity.lectureId} className="activity-item">
                        <div className="activity-dot" />
                        <div className="activity-content">
                            <span className="activity-title">{activity.lectureTitle}</span>
                            <span className="activity-time">{formatDate(activity.completedAt)}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
