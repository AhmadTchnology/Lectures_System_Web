import { AlertTriangle } from 'lucide-react';

interface Deadline {
    id: string;
    title: string;
    type: string;
    expiryDate: string;
    daysRemaining: number;
}

interface UpcomingDeadlinesProps {
    deadlines: Deadline[];
}

function getUrgencyClass(days: number): string {
    if (days <= 1) return 'deadline-urgent';
    if (days <= 3) return 'deadline-soon';
    return 'deadline-normal';
}

function getTypeIcon(type: string): string {
    return type === 'exam' ? '📝' : '📚';
}

export default function UpcomingDeadlines({ deadlines }: UpcomingDeadlinesProps) {
    if (deadlines.length === 0) {
        return (
            <div className="dashboard-card">
                <h3 className="dashboard-card-title">
                    <AlertTriangle size={20} /> Upcoming Deadlines
                </h3>
                <p className="dashboard-empty">No upcoming deadlines. You're all caught up!</p>
            </div>
        );
    }

    return (
        <div className="dashboard-card">
            <h3 className="dashboard-card-title">
                <AlertTriangle size={20} /> Upcoming Deadlines
            </h3>
            <ul className="deadline-list">
                {deadlines.map((deadline) => (
                    <li key={deadline.id} className={`deadline-item ${getUrgencyClass(deadline.daysRemaining)}`}>
                        <span className="deadline-icon">{getTypeIcon(deadline.type)}</span>
                        <div className="deadline-content">
                            <span className="deadline-title">{deadline.title}</span>
                            <span className="deadline-date">
                                {new Date(deadline.expiryDate).toLocaleDateString()}
                            </span>
                        </div>
                        <span className="deadline-countdown">
                            {deadline.daysRemaining === 0
                                ? 'Today!'
                                : deadline.daysRemaining === 1
                                    ? '1 day'
                                    : `${deadline.daysRemaining} days`}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
