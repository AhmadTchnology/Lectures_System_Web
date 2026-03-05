import { RefreshCw, BarChart3 } from 'lucide-react';
import { useAnalytics } from './useAnalytics';
import StatsOverview from './StatsOverview';
import LectureEngagement from './LectureEngagement';
import StudentActivity from './StudentActivity';

export default function AnalyticsPage() {
    const { data, isLoading, error, refresh } = useAnalytics();

    if (isLoading && !data) {
        return (
            <div className="analytics-loading">
                <div className="loading-spinner" />
                <p>Loading analytics...</p>
            </div>
        );
    }

    if (error && !data) {
        return (
            <div className="analytics-error">
                <p>Failed to load analytics: {error}</p>
                <button onClick={refresh} className="btn btn-primary">
                    Retry
                </button>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="analytics-page">
            <div className="analytics-header">
                <div className="analytics-header-left">
                    <BarChart3 size={28} />
                    <h1>Analytics Dashboard</h1>
                </div>
                <button
                    onClick={refresh}
                    disabled={isLoading}
                    className="btn btn-secondary analytics-refresh-btn"
                >
                    <RefreshCw size={16} className={isLoading ? 'spin' : ''} />
                    Refresh
                </button>
            </div>

            <StatsOverview
                totalUsers={data.totalUsers}
                activeUsers7d={data.activeUsers7d}
                totalLectures={data.totalLectures}
                completionRate={data.overallCompletionRate}
            />

            <LectureEngagement
                lectureStats={data.lectureStats}
                subjectDistribution={data.subjectDistribution}
            />

            <StudentActivity
                stageCompletion={data.stageCompletion}
                topStudents={data.topStudents}
            />
        </div>
    );
}
