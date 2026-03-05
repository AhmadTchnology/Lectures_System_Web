import type { Question } from '../../types/quiz';

interface QuestionRendererProps {
    question: Question;
    index: number;
    answer: string;
    onAnswer: (value: string) => void;
    showResult?: boolean;
}

export default function QuestionRenderer({ question, index, answer, onAnswer, showResult }: QuestionRendererProps) {
    const isCorrect = showResult && answer?.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
    const isWrong = showResult && !isCorrect && question.type !== 'short-answer';
    const isPending = showResult && question.type === 'short-answer';

    return (
        <div className={`quiz-question-render ${showResult ? (isCorrect ? 'quiz-correct' : isWrong ? 'quiz-wrong' : 'quiz-pending') : ''}`}>
            <div className="quiz-question-render-header">
                <span className="quiz-question-number">Q{index + 1}</span>
                <span className="quiz-question-points">{question.points} pts</span>
            </div>

            <p className="quiz-question-render-text">{question.text}</p>

            {question.type === 'mcq' && (
                <div className="quiz-render-options">
                    {(question.options ?? []).map((opt, i) => {
                        const selected = answer === String(i);
                        const correctIdx = question.correctAnswer;
                        const isCorrectOpt = showResult && String(i) === correctIdx;

                        return (
                            <label
                                key={i}
                                className={`quiz-render-option ${selected ? 'selected' : ''} ${showResult && isCorrectOpt ? 'correct-answer' : ''}`}
                            >
                                <input
                                    type="radio"
                                    name={`q-${question.id}`}
                                    value={String(i)}
                                    checked={selected}
                                    onChange={(e) => onAnswer(e.target.value)}
                                    disabled={!!showResult}
                                />
                                <span>{opt}</span>
                            </label>
                        );
                    })}
                </div>
            )}

            {question.type === 'true-false' && (
                <div className="quiz-render-options quiz-tf-render">
                    {['true', 'false'].map((val) => {
                        const selected = answer === val;
                        const isCorrectOpt = showResult && val === question.correctAnswer;
                        return (
                            <label
                                key={val}
                                className={`quiz-render-option ${selected ? 'selected' : ''} ${showResult && isCorrectOpt ? 'correct-answer' : ''}`}
                            >
                                <input
                                    type="radio"
                                    name={`q-${question.id}`}
                                    value={val}
                                    checked={selected}
                                    onChange={(e) => onAnswer(e.target.value)}
                                    disabled={!!showResult}
                                />
                                <span>{val === 'true' ? 'True' : 'False'}</span>
                            </label>
                        );
                    })}
                </div>
            )}

            {question.type === 'short-answer' && (
                <textarea
                    value={answer ?? ''}
                    onChange={(e) => onAnswer(e.target.value)}
                    placeholder="Type your answer..."
                    className="input-field quiz-short-answer"
                    rows={3}
                    disabled={!!showResult}
                />
            )}

            {showResult && (
                <div className="quiz-result-indicator">
                    {isCorrect && <span className="quiz-result-correct">✓ Correct</span>}
                    {isWrong && <span className="quiz-result-wrong">✗ Incorrect — Answer: {question.type === 'mcq' ? question.options?.[parseInt(question.correctAnswer)] : question.correctAnswer}</span>}
                    {isPending && <span className="quiz-result-pending">⏳ Pending teacher review</span>}
                </div>
            )}
        </div>
    );
}
