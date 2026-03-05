import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Eye, Send, EyeOff, ClipboardList } from 'lucide-react';
import { useQuizzes } from './useQuizzes';
import { deleteQuiz, publishQuiz, unpublishQuiz } from './quizService';

export default function QuizListPage() {
    const { quizzes, isLoading, isTeacherOrAdmin } = useQuizzes();
    const navigate = useNavigate();

    async function handleDelete(quizId: string) {
        if (!confirm('Delete this quiz? This cannot be undone.')) return;
        await deleteQuiz(quizId);
    }

    async function handleTogglePublish(quizId: string, isPublished: boolean) {
        if (isPublished) {
            await unpublishQuiz(quizId);
        } else {
            await publishQuiz(quizId);
        }
    }

    if (isLoading) {
        return <div className="analytics-loading"><div className="loading-spinner" /><p>Loading quizzes...</p></div>;
    }

    return (
        <div className="quiz-list-page">
            <div className="quiz-list-header">
                <div className="quiz-list-header-left">
                    <ClipboardList size={28} />
                    <h1>Quizzes</h1>
                </div>
                {isTeacherOrAdmin && (
                    <button onClick={() => navigate('/quizzes/create')} className="btn-primary">
                        <Plus size={16} /> Create Quiz
                    </button>
                )}
            </div>

            {quizzes.length === 0 ? (
                <div className="quiz-empty">
                    <ClipboardList size={48} strokeWidth={1} />
                    <p>{isTeacherOrAdmin ? 'No quizzes created yet.' : 'No quizzes available yet.'}</p>
                </div>
            ) : (
                <div className="quiz-grid">
                    {quizzes.map((quiz) => (
                        <div key={quiz.id} className="quiz-card">
                            <div className="quiz-card-header">
                                <h3>{quiz.title}</h3>
                                <span className={`quiz-status-badge ${quiz.isPublished ? 'quiz-published' : 'quiz-draft'}`}>
                                    {quiz.isPublished ? 'Published' : 'Draft'}
                                </span>
                            </div>
                            <div className="quiz-card-body">
                                {quiz.description && <p className="quiz-card-desc">{quiz.description}</p>}
                                <div className="quiz-card-meta">
                                    <span className="lecture-tag">{quiz.subject}</span>
                                    <span className="lecture-tag">{quiz.stage}</span>
                                </div>
                                <div className="quiz-card-stats">
                                    <span>{quiz.questions.length} questions</span>
                                    {quiz.timeLimit && <span>⏱ {quiz.timeLimit} min</span>}
                                    <span>By {quiz.creatorName}</span>
                                </div>
                            </div>
                            <div className="quiz-card-footer">
                                {isTeacherOrAdmin ? (
                                    <>
                                        <button onClick={() => navigate(`/quizzes/${quiz.id}/results`)} className="btn-secondary">
                                            <Eye size={14} /> Results
                                        </button>
                                        <button onClick={() => handleTogglePublish(quiz.id, quiz.isPublished)} className="btn-secondary">
                                            {quiz.isPublished ? <><EyeOff size={14} /> Unpublish</> : <><Send size={14} /> Publish</>}
                                        </button>
                                        <button onClick={() => handleDelete(quiz.id)} className="btn-danger">
                                            <Trash2 size={14} />
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={() => navigate(`/quizzes/${quiz.id}`)} className="btn-primary w-full">
                                        Take Quiz
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
