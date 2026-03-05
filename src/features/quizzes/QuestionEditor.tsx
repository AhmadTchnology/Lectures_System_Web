import { Trash2, Plus } from 'lucide-react';
import type { Question, QuestionType } from '../../types/quiz';

interface QuestionEditorProps {
    question: Question;
    index: number;
    onChange: (updated: Question) => void;
    onRemove: () => void;
}

export default function QuestionEditor({ question, index, onChange, onRemove }: QuestionEditorProps) {
    function setField<K extends keyof Question>(field: K, value: Question[K]) {
        onChange({ ...question, [field]: value });
    }

    function handleTypeChange(type: QuestionType) {
        const base = { ...question, type };
        if (type === 'mcq') {
            base.options = base.options?.length ? base.options : ['', ''];
            base.correctAnswer = '0';
        } else if (type === 'true-false') {
            base.options = undefined;
            base.correctAnswer = 'true';
        } else {
            base.options = undefined;
            base.correctAnswer = '';
        }
        onChange(base);
    }

    function addOption() {
        const opts = [...(question.options ?? []), ''];
        setField('options', opts);
    }

    function removeOption(i: number) {
        const opts = (question.options ?? []).filter((_, idx) => idx !== i);
        setField('options', opts);
        if (parseInt(question.correctAnswer) >= opts.length) {
            setField('correctAnswer', String(Math.max(0, opts.length - 1)));
        }
    }

    function updateOption(i: number, value: string) {
        const opts = [...(question.options ?? [])];
        opts[i] = value;
        setField('options', opts);
    }

    return (
        <div className="quiz-question-editor">
            <div className="quiz-question-editor-header">
                <span className="quiz-question-number">Q{index + 1}</span>
                <select
                    value={question.type}
                    onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
                    className="filter-select quiz-type-select"
                >
                    <option value="mcq">Multiple Choice</option>
                    <option value="true-false">True / False</option>
                    <option value="short-answer">Short Answer</option>
                </select>
                <input
                    type="number"
                    min={1}
                    value={question.points}
                    onChange={(e) => setField('points', parseInt(e.target.value) || 1)}
                    className="input-field quiz-points-input"
                    placeholder="Pts"
                />
                <button onClick={onRemove} className="btn-danger quiz-remove-btn" title="Remove question">
                    <Trash2 size={16} />
                </button>
            </div>

            <textarea
                value={question.text}
                onChange={(e) => setField('text', e.target.value)}
                placeholder="Enter question text..."
                className="input-field quiz-question-text"
                rows={2}
            />

            {question.type === 'mcq' && (
                <div className="quiz-options-list">
                    {(question.options ?? []).map((opt, i) => (
                        <div key={i} className="quiz-option-row">
                            <input
                                type="radio"
                                name={`correct-${question.id}`}
                                checked={question.correctAnswer === String(i)}
                                onChange={() => setField('correctAnswer', String(i))}
                            />
                            <input
                                type="text"
                                value={opt}
                                onChange={(e) => updateOption(i, e.target.value)}
                                placeholder={`Option ${i + 1}`}
                                className="input-field quiz-option-input"
                            />
                            {(question.options?.length ?? 0) > 2 && (
                                <button onClick={() => removeOption(i)} className="quiz-option-remove">
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    ))}
                    {(question.options?.length ?? 0) < 6 && (
                        <button onClick={addOption} className="btn-secondary quiz-add-option">
                            <Plus size={14} /> Add Option
                        </button>
                    )}
                </div>
            )}

            {question.type === 'true-false' && (
                <div className="quiz-tf-options">
                    <label className="quiz-tf-label">
                        <input
                            type="radio"
                            name={`tf-${question.id}`}
                            checked={question.correctAnswer === 'true'}
                            onChange={() => setField('correctAnswer', 'true')}
                        />
                        True
                    </label>
                    <label className="quiz-tf-label">
                        <input
                            type="radio"
                            name={`tf-${question.id}`}
                            checked={question.correctAnswer === 'false'}
                            onChange={() => setField('correctAnswer', 'false')}
                        />
                        False
                    </label>
                </div>
            )}

            {question.type === 'short-answer' && (
                <input
                    type="text"
                    value={question.correctAnswer}
                    onChange={(e) => setField('correctAnswer', e.target.value)}
                    placeholder="Expected answer..."
                    className="input-field"
                />
            )}
        </div>
    );
}
