import { useState } from 'react';
import { X, Check, MessageSquare } from 'lucide-react';
import { gradeShortAnswer } from './quizService';
import type { Quiz, QuizSubmission, Question } from '../../types/quiz';

interface GradeSubmissionModalProps {
    quiz: Quiz;
    submission: QuizSubmission;
    onClose: () => void;
    onGraded: (updated: QuizSubmission) => void;
}

export default function GradeSubmissionModal({ quiz, submission, onClose, onGraded }: GradeSubmissionModalProps) {
    const shortAnswerQuestions = quiz.questions.filter((q) => q.type === 'short-answer');
    const autoGradedQuestions = quiz.questions.filter((q) => q.type !== 'short-answer');

    // Track awarded points per short-answer question
    const [pointsAwarded, setPointsAwarded] = useState<Record<string, number>>(() => {
        const initial: Record<string, number> = {};
        shortAnswerQuestions.forEach((q) => { initial[q.id] = 0; });
        return initial;
    });
    const [isSaving, setIsSaving] = useState(false);

    // Auto-graded score (MCQ + T/F)
    const autoGradedScore = autoGradedQuestions.reduce((sum, q) => {
        const answer = submission.answers[q.id];
        if (answer?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()) {
            return sum + q.points;
        }
        return sum;
    }, 0);

    const manualPoints = Object.values(pointsAwarded).reduce((s, p) => s + p, 0);
    const totalScore = autoGradedScore + manualPoints;
    const maxScore = submission.maxScore;

    async function handleSave() {
        setIsSaving(true);
        try {
            await gradeShortAnswer(quiz.id, submission.id, totalScore, maxScore);
            const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
            onGraded({ ...submission, score: totalScore, percentage, graded: true });
            onClose();
        } catch {
            alert('Failed to save grade. Please try again.');
        } finally {
            setIsSaving(false);
        }
    }

    function renderQuestion(q: Question, index: number) {
        const studentAnswer = submission.answers[q.id] ?? '';
        const isShortAnswer = q.type === 'short-answer';

        // For auto-graded: show correct/incorrect
        if (!isShortAnswer) {
            const isCorrect = studentAnswer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
            const displayAnswer = q.type === 'mcq' && q.options
                ? q.options[parseInt(studentAnswer)] ?? '(no answer)'
                : studentAnswer === 'true' ? 'True' : studentAnswer === 'false' ? 'False' : '(no answer)';
            const correctDisplay = q.type === 'mcq' && q.options
                ? q.options[parseInt(q.correctAnswer)] ?? q.correctAnswer
                : q.correctAnswer === 'true' ? 'True' : 'False';

            return (
                <div key={q.id} className={`grade-question ${isCorrect ? 'grade-correct' : 'grade-wrong'}`}>
                    <div className="grade-question-header">
                        <span className="quiz-question-number">Q{index + 1}</span>
                        <span className="grade-question-type">{q.type === 'mcq' ? 'MCQ' : 'T/F'}</span>
                        <span className="grade-auto-badge">{isCorrect ? `✓ ${q.points}/${q.points}` : `✗ 0/${q.points}`}</span>
                    </div>
                    <p className="grade-question-text">{q.text}</p>
                    <div className="grade-answer-row">
                        <span className="grade-label">Student:</span>
                        <span className={isCorrect ? 'grade-answer-correct' : 'grade-answer-wrong'}>{displayAnswer}</span>
                    </div>
                    {!isCorrect && (
                        <div className="grade-answer-row">
                            <span className="grade-label">Correct:</span>
                            <span className="grade-answer-correct">{correctDisplay}</span>
                        </div>
                    )}
                </div>
            );
        }

        // Short-answer: show student's answer + points input
        return (
            <div key={q.id} className="grade-question grade-review">
                <div className="grade-question-header">
                    <span className="quiz-question-number">Q{index + 1}</span>
                    <span className="grade-question-type"><MessageSquare size={12} /> Short Answer</span>
                    <span className="grade-manual-badge">Manual Review</span>
                </div>
                <p className="grade-question-text">{q.text}</p>
                <div className="grade-expected-answer">
                    <span className="grade-label">Expected:</span>
                    <span>{q.correctAnswer || '(open-ended)'}</span>
                </div>
                <div className="grade-student-answer">
                    <span className="grade-label">Student wrote:</span>
                    <div className="grade-student-answer-text">{studentAnswer || '(no answer)'}</div>
                </div>
                <div className="grade-points-row">
                    <label>Points awarded:</label>
                    <div className="grade-points-input-group">
                        <input
                            type="number"
                            min={0}
                            max={q.points}
                            value={pointsAwarded[q.id] ?? 0}
                            onChange={(e) => {
                                const val = Math.min(q.points, Math.max(0, parseInt(e.target.value) || 0));
                                setPointsAwarded((prev) => ({ ...prev, [q.id]: val }));
                            }}
                            className="input-field grade-points-input"
                        />
                        <span className="grade-points-max">/ {q.points}</span>
                        <button
                            onClick={() => setPointsAwarded((prev) => ({ ...prev, [q.id]: q.points }))}
                            className="btn-secondary grade-full-marks-btn"
                            title="Award full marks"
                        >
                            <Check size={14} /> Full
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content grade-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2>Review: {submission.studentName}</h2>
                        <p className="grade-modal-subtitle">
                            Auto-graded: {autoGradedScore} pts · Manual: {manualPoints} pts · Total: {totalScore}/{maxScore}
                        </p>
                    </div>
                    <button onClick={onClose} className="modal-close"><X size={20} /></button>
                </div>

                <div className="grade-questions-list">
                    {quiz.questions.map((q, i) => renderQuestion(q, i))}
                </div>

                <div className="grade-footer">
                    <div className="grade-total">
                        <span>Final Score:</span>
                        <strong>{totalScore} / {maxScore} ({maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0}%)</strong>
                    </div>
                    <div className="grade-actions">
                        <button onClick={onClose} className="btn-secondary">Cancel</button>
                        <button onClick={handleSave} disabled={isSaving} className="btn-primary">
                            <Check size={16} /> {isSaving ? 'Saving...' : 'Save Grade'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
