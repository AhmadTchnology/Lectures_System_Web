import { Clock, BookOpen, CheckCircle, Trash2 } from 'lucide-react';
import type { StudySession } from '../../types';

interface StudySessionCardProps {
    session: StudySession;
    onToggleCompletion: (session: StudySession) => void;
    onDelete: (session: StudySession) => void;
}

export default function StudySessionCard({ session, onToggleCompletion, onDelete }: StudySessionCardProps) {
    const isPast = new Date(`${session.date}T${session.endTime}`) < new Date() && !session.isCompleted;

    return (
        <div className={`schedule-card ${session.isCompleted ? 'completed' : isPast ? 'overdue' : ''}`}>
            <div className="schedule-card-header">
                <h4 className="schedule-card-title">{session.title}</h4>
                <div className="schedule-card-actions">
                    <button
                        className={`btn-icon ${session.isCompleted ? 'text-success' : 'text-light'}`}
                        onClick={() => onToggleCompletion(session)}
                        title={session.isCompleted ? "Mark as Incomplete" : "Mark as Complete"}
                    >
                        <CheckCircle size={20} />
                    </button>
                    <button
                        className="btn-icon text-danger"
                        onClick={() => window.confirm('Delete this study session?') && onDelete(session)}
                        title="Delete Session"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            <div className="schedule-card-details">
                <div className="schedule-card-detail">
                    <Clock size={14} />
                    <span>{session.startTime} - {session.endTime}</span>
                </div>
                {session.lectureId && (
                    <div className="schedule-card-detail">
                        <BookOpen size={14} />
                        <span>Lecture context included</span>
                    </div>
                )}
            </div>

            {isPast && !session.isCompleted && (
                <div className="schedule-card-badge danger">Overdue</div>
            )}
        </div>
    );
}
