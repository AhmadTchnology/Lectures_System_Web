import { useState, useMemo } from 'react';
import { Calendar, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSchedule } from './useSchedule';
import StudySessionCard from './StudySessionCard';
import type { StudySession } from '../../types';

export default function SchedulePage() {
    const { currentUser } = useAuth();
    const { schedule, isLoading, addSession, removeSession, toggleSessionCompletion } = useSchedule();
    const [isAdding, setIsAdding] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');

    if (currentUser?.role !== 'student') {
        return (
            <div className="content-container flex-center min-h-[50vh]">
                <div className="text-center text-light">
                    <h2>Access Denied</h2>
                    <p>The study schedule is only available to students.</p>
                </div>
            </div>
        );
    }

    // Grouping sessions by date
    const groupedSchedule = useMemo(() => {
        const groups: Record<string, StudySession[]> = {};
        schedule.forEach(s => {
            if (!groups[s.date]) groups[s.date] = [];
            groups[s.date].push(s);
        });

        // Sort dates
        const sortedDates = Object.keys(groups).sort((a, b) => a.localeCompare(b));

        // Sort sessions within dates
        sortedDates.forEach(d => {
            groups[d].sort((a, b) => a.startTime.localeCompare(b.startTime));
        });

        return { groups, sortedDates };
    }, [schedule]);

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        await addSession({
            title: title.trim(),
            date,
            startTime,
            endTime,
            isCompleted: false
        });

        // Reset form
        setTitle('');
        setIsAdding(false);
    };

    return (
        <div className="content-container">
            <div className="schedule-header">
                <div>
                    <h2 className="section-title">Study Schedule Planner</h2>
                    <p className="dashboard-subtitle">Organize your sessions and stay on top of your lectures</p>
                </div>
                <button className="btn-primary" onClick={() => setIsAdding(true)}>
                    <Plus size={20} /> Add Session
                </button>
            </div>

            {isAdding && (
                <div className="dashboard-card mb-6">
                    <h3 className="card-title">New Study Session</h3>
                    <form onSubmit={handleAddSubmit} className="schedule-form">
                        <div className="form-group row-span-full">
                            <label>Session Title or Goal</label>
                            <input
                                type="text"
                                className="form-input"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="E.g., Review Math Chapter 4"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group grid-2-col">
                            <div>
                                <label>Start Time</label>
                                <input
                                    type="time"
                                    className="form-input"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>End Time</label>
                                <input
                                    type="time"
                                    className="form-input"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-actions mt-4">
                            <button type="button" className="btn-secondary" onClick={() => setIsAdding(false)}>Cancel</button>
                            <button type="submit" className="btn-primary">Save Session</button>
                        </div>
                    </form>
                </div>
            )}

            {isLoading && schedule.length === 0 ? (
                <div className="schedule-loading">Loading your schedule...</div>
            ) : schedule.length === 0 && !isAdding ? (
                <div className="dashboard-empty dashboard-card">
                    <Calendar size={48} className="mx-auto mb-4 opacity-50 text-light" />
                    <h3>Your schedule is empty</h3>
                    <p>Start planning your study sessions to stay organized.</p>
                </div>
            ) : (
                <div className="schedule-timeline">
                    {groupedSchedule.sortedDates.map(dateStr => (
                        <div key={dateStr} className="schedule-date-group">
                            <h3 className="schedule-date-header">
                                {new Date(dateStr).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                            </h3>
                            <div className="schedule-date-cards">
                                {groupedSchedule.groups[dateStr].map(session => (
                                    <StudySessionCard
                                        key={session.id}
                                        session={session}
                                        onToggleCompletion={toggleSessionCompletion}
                                        onDelete={removeSession}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
