import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getQuiz, getSubmissions } from './quizService';
import GradeSubmissionModal from './GradeSubmissionModal';
import type { Quiz, QuizSubmission } from '../../types/quiz';

export default function QuizResultsPage() {
    const { id } = useParams<{ id: string }>();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [gradingSubmission, setGradingSubmission] = useState<QuizSubmission | null>(null);

    const isTeacher = currentUser?.role === 'admin' || currentUser?.role === 'teacher';
    const hasShortAnswer = quiz?.questions.some((q) => q.type === 'short-answer') ?? false;

    useEffect(() => {
        if (!id) return;
        (async () => {
            const q = await getQuiz(id);
            setQuiz(q);
            if (q) {
                const subs = await getSubmissions(id);
                setSubmissions(subs);
            }
            setIsLoading(false);
        })();
    }, [id]);

    function handleGraded(updated: QuizSubmission) {
        setSubmissions((prev) =>
            prev.map((s) => (s.id === updated.id ? updated : s))
        );
    }

    if (isLoading) {
        return <div className="analytics-loading"><div className="loading-spinner" /><p>Loading results...</p></div>;
    }

    if (!quiz) {
        return <div className="analytics-error"><p>Quiz not found</p></div>;
    }

    const avgScore = submissions.length > 0
        ? Math.round(submissions.reduce((s, sub) => s + sub.percentage, 0) / submissions.length)
        : 0;

    const pendingCount = submissions.filter((s) => !s.graded).length;

    return (
        <div className="quiz-results-page">
            <button onClick={() => navigate('/quizzes')} className="btn-secondary" style={{ marginBottom: '1rem' }}>
                <ArrowLeft size={16} /> Back to Quizzes
            </button>

            <h1 className="section-title">{quiz.title} — Results</h1>

            <div className="analytics-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="analytics-stat-card">
                    <div className="analytics-stat-info">
                        <span className="analytics-stat-value">{submissions.length}</span>
                        <span className="analytics-stat-label">Submissions</span>
                    </div>
                </div>
                <div className="analytics-stat-card">
                    <div className="analytics-stat-info">
                        <span className="analytics-stat-value">{avgScore}%</span>
                        <span className="analytics-stat-label">Average Score</span>
                    </div>
                </div>
                <div className="analytics-stat-card">
                    <div className="analytics-stat-info">
                        <span className="analytics-stat-value">{quiz.questions.length}</span>
                        <span className="analytics-stat-label">Questions</span>
                    </div>
                </div>
                <div className="analytics-stat-card">
                    <div className="analytics-stat-info">
                        <span className="analytics-stat-value" style={pendingCount > 0 ? { color: 'var(--warning-color)' } : {}}>{pendingCount}</span>
                        <span className="analytics-stat-label">Pending Review</span>
                    </div>
                </div>
            </div>

            {isTeacher && (
                <div className="chart-card" style={{ marginTop: '1.5rem' }}>
                    <div className="chart-card-header">
                        <h3 className="chart-card-title">All Submissions</h3>
                        {hasShortAnswer && pendingCount > 0 && (
                            <p className="chart-card-description" style={{ color: 'var(--warning-color)' }}>
                                ⚠ {pendingCount} submission{pendingCount !== 1 ? 's' : ''} need{pendingCount === 1 ? 's' : ''} manual review for short-answer questions
                            </p>
                        )}
                    </div>
                    <div className="chart-card-body">
                        {submissions.length === 0 ? (
                            <p className="analytics-empty">No submissions yet</p>
                        ) : (
                            <div className="analytics-table-wrapper">
                                <table className="analytics-table">
                                    <thead>
                                        <tr>
                                            <th>Student</th>
                                            <th>Score</th>
                                            <th>Percentage</th>
                                            <th>Time Spent</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {submissions.map((sub) => (
                                            <tr key={sub.id}>
                                                <td>{sub.studentName}</td>
                                                <td>{sub.score}/{sub.maxScore}</td>
                                                <td>{sub.percentage}%</td>
                                                <td>{Math.floor(sub.timeSpent / 60)}m {sub.timeSpent % 60}s</td>
                                                <td>
                                                    <span className={`quiz-status-badge ${sub.graded ? 'quiz-graded' : 'quiz-pending-grade'}`}>
                                                        {sub.graded ? 'Graded' : 'Pending'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={() => setGradingSubmission(sub)}
                                                        className={`btn-secondary grade-review-btn ${!sub.graded ? 'grade-review-pending' : ''}`}
                                                    >
                                                        <Eye size={14} /> {sub.graded ? 'View' : 'Review'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {gradingSubmission && quiz && (
                <GradeSubmissionModal
                    quiz={quiz}
                    submission={gradingSubmission}
                    onClose={() => setGradingSubmission(null)}
                    onGraded={handleGraded}
                />
            )}
        </div>
    );
}
