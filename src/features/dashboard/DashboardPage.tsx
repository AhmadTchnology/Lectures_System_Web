import { useAuth } from '../../contexts/AuthContext';
import { useCategories } from '../categories/useCategories';
import { useLectures } from '../lectures/useLectures';
import { useAnnouncements } from '../announcements/useAnnouncements';
import { useDashboard } from './useDashboard';
import StatsCards from './StatsCards';
import ProgressBar from './ProgressBar';
import RecentActivity from './RecentActivity';
import UpcomingDeadlines from './UpcomingDeadlines';

export default function DashboardPage() {
    const { currentUser } = useAuth();
    const { categories } = useCategories();
    const { lectures } = useLectures(categories);
    const { announcements } = useAnnouncements();
    const { completionBySubject, completionByStage, recentActivity, upcomingDeadlines, stats, adminStats, isLoadingAdminStats } =
        useDashboard(lectures, announcements);

    const isStudent = currentUser?.role === 'student';
    const nameStr = currentUser?.name?.split(' ')[0] || (isStudent ? 'Student' : 'Admin');

    return (
        <div className="content-container">
            <div className="dashboard-header">
                <h2 className="section-title">
                    Welcome back, {nameStr} 👋
                </h2>
                <p className="dashboard-subtitle">Here's your overview</p>
            </div>

            {isLoadingAdminStats ? (
                <div className="dashboard-loading mb-6">Loading admin statistics...</div>
            ) : (
                <StatsCards
                    stats={stats}
                    adminStats={adminStats}
                />
            )}

            {isStudent && (
                <div className="dashboard-grid">
                    <div className="dashboard-card">
                        <h3 className="dashboard-card-title">📊 Progress by Subject</h3>
                        {completionBySubject.length > 0 ? (
                            <div className="progress-list">
                                {completionBySubject.map((item) => (
                                    <ProgressBar
                                        key={item.subject}
                                        label={item.subject}
                                        completed={item.completed}
                                        total={item.total}
                                        percentage={item.percentage}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="dashboard-empty">No lectures available yet.</p>
                        )}
                    </div>

                    <div className="dashboard-card">
                        <h3 className="dashboard-card-title">🎓 Progress by Stage</h3>
                        {completionByStage.length > 0 ? (
                            <div className="progress-list">
                                {completionByStage.map((item) => (
                                    <ProgressBar
                                        key={item.subject}
                                        label={item.subject}
                                        completed={item.completed}
                                        total={item.total}
                                        percentage={item.percentage}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="dashboard-empty">No lectures available yet.</p>
                        )}
                    </div>

                    <RecentActivity activities={recentActivity} />
                    <UpcomingDeadlines deadlines={upcomingDeadlines} />
                </div>
            )}
        </div>
    );
}
