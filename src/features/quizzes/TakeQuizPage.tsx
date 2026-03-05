import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getQuiz, submitQuiz, getMySubmissions } from './quizService';
import QuestionRenderer from './QuestionRenderer';
import type { Quiz, QuizSubmission } from '../../types/quiz';

export default function TakeQuizPage() {
    const { id } = useParams<{ id: string }>();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submission, setSubmission] = useState<QuizSubmission | null>(null);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const startTime = useRef(Date.now());

    useEffect(() => {
        if (!id) return;
        (async () => {
            const q = await getQuiz(id);
            setQuiz(q);

            if (q && currentUser) {
                const existing = await getMySubmissions(id, currentUser.id);
                if (existing.length > 0) {
                    setSubmission(existing[0]);
                    setAnswers(existing[0].answers);
                }
            }

            if (q?.timeLimit) {
                setTimeLeft(q.timeLimit * 60);
            }
            setIsLoading(false);
        })();
    }, [id, currentUser]);

    // Countdown timer
    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0 || submission) return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev === null || prev <= 1) {
                    clearInterval(interval);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft, submission]);

    function formatTime(seconds: number): string {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    async function handleSubmit() {
        if (!quiz || !currentUser || !id) return;
        if (submission) return;

        const confirmed = window.confirm('Are you sure you want to submit this quiz? You cannot change your answers afterwards.');
        if (!confirmed && (timeLeft === null || timeLeft > 0)) return;

        setIsSubmitting(true);
        try {
            const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
            await submitQuiz(id, quiz, {
                studentId: currentUser.id,
                studentName: currentUser.name,
                answers,
                timeSpent,
            });

            const subs = await getMySubmissions(id, currentUser.id);
            if (subs.length > 0) setSubmission(subs[0]);
        } catch {
            alert('Failed to submit quiz. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) {
        return <div className="analytics-loading"><div className="loading-spinner" /><p>Loading quiz...</p></div>;
    }

    if (!quiz) {
        return <div className="analytics-error"><p>Quiz not found</p><button onClick={() => navigate('/quizzes')} className="btn-primary">Back to Quizzes</button></div>;
    }

    const answered = Object.keys(answers).length;
    const total = quiz.questions.length;

    return (
        <div className="quiz-take-page">
            <div className="quiz-take-header">
                <div>
                    <h1 className="section-title" style={{ marginBottom: '0.25rem' }}>{quiz.title}</h1>
                    {quiz.description && <p className="quiz-take-desc">{quiz.description}</p>}
                    <div className="quiz-take-meta">
                        <span>{quiz.subject}</span> · <span>{quiz.stage}</span>
                        · <span>{answered}/{total} answered</span>
                    </div>
                </div>
                {timeLeft !== null && !submission && (
                    <div className={`quiz-timer ${timeLeft < 60 ? 'quiz-timer-warning' : ''}`}>
                        <Clock size={18} />
                        <span>{formatTime(timeLeft)}</span>
                    </div>
                )}
            </div>

            {submission && (
                <div className="quiz-score-banner">
                    <h2>Score: {submission.score}/{submission.maxScore} ({submission.percentage}%)</h2>
                    {!submission.graded && (
                        <p className="quiz-score-note"><AlertCircle size={14} /> Some questions are pending teacher review</p>
                    )}
                </div>
            )}

            <div className="quiz-questions-list">
                {quiz.questions.map((q, i) => (
                    <QuestionRenderer
                        key={q.id}
                        question={q}
                        index={i}
                        answer={answers[q.id] ?? ''}
                        onAnswer={(val) => setAnswers((prev) => ({ ...prev, [q.id]: val }))}
                        showResult={!!submission}
                    />
                ))}
            </div>

            {!submission && (
                <div className="quiz-submit-bar">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || answered === 0}
                        className="btn-primary"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                </div>
            )}
        </div>
    );
}
