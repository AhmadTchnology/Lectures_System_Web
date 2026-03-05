import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Save, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { createQuiz, publishQuiz } from './quizService';
import QuestionEditor from './QuestionEditor';
import type { Question } from '../../types/quiz';

function generateId() {
    return Math.random().toString(36).slice(2, 10);
}

export default function CreateQuizPage() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [subject, setSubject] = useState('');
    const [stage, setStage] = useState('');
    const [timeLimit, setTimeLimit] = useState<number | ''>('');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    function addQuestion() {
        setQuestions((prev) => [
            ...prev,
            {
                id: generateId(),
                type: 'mcq',
                text: '',
                options: ['', ''],
                correctAnswer: '0',
                points: 1,
            },
        ]);
    }

    function updateQuestion(index: number, updated: Question) {
        setQuestions((prev) => prev.map((q, i) => (i === index ? updated : q)));
    }

    function removeQuestion(index: number) {
        setQuestions((prev) => prev.filter((_, i) => i !== index));
    }

    async function saveQuiz(publish: boolean) {
        if (!title.trim() || !subject.trim() || !stage.trim() || questions.length === 0) {
            alert('Please fill in title, subject, stage, and add at least one question.');
            return;
        }

        setIsSaving(true);
        try {
            const docRef = await createQuiz({
                title: title.trim(),
                description: description.trim(),
                subject: subject.trim(),
                stage: stage.trim(),
                createdBy: currentUser?.id ?? '',
                creatorName: currentUser?.name ?? '',
                questions,
                timeLimit: timeLimit ? Number(timeLimit) : undefined,
                isPublished: publish,
            });

            if (publish) {
                await publishQuiz(docRef.id);
            }

            navigate('/quizzes');
        } catch (err) {
            alert('Failed to save quiz. Please try again.');
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="quiz-create-page">
            <h1 className="section-title">Create Quiz</h1>

            <div className="card quiz-meta-form">
                <div className="quiz-meta-grid">
                    <div className="form-group">
                        <label>Title *</label>
                        <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder="Quiz title" />
                    </div>
                    <div className="form-group">
                        <label>Subject *</label>
                        <input value={subject} onChange={(e) => setSubject(e.target.value)} className="input-field" placeholder="e.g., Mathematics" />
                    </div>
                    <div className="form-group">
                        <label>Stage *</label>
                        <input value={stage} onChange={(e) => setStage(e.target.value)} className="input-field" placeholder="e.g., Stage 1" />
                    </div>
                    <div className="form-group">
                        <label>Time Limit (minutes)</label>
                        <input type="number" min={1} value={timeLimit} onChange={(e) => setTimeLimit(e.target.value ? parseInt(e.target.value) : '')} className="input-field" placeholder="No limit" />
                    </div>
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input-field" placeholder="Optional description" rows={2} />
                </div>
            </div>

            <div className="quiz-questions-section">
                <h2>Questions ({questions.length})</h2>
                {questions.map((q, i) => (
                    <QuestionEditor
                        key={q.id}
                        question={q}
                        index={i}
                        onChange={(updated) => updateQuestion(i, updated)}
                        onRemove={() => removeQuestion(i)}
                    />
                ))}

                <button onClick={addQuestion} className="btn-secondary quiz-add-question-btn">
                    <Plus size={18} /> Add Question
                </button>
            </div>

            <div className="quiz-actions-bar">
                <button onClick={() => saveQuiz(false)} disabled={isSaving} className="btn-secondary">
                    <Save size={16} /> Save as Draft
                </button>
                <button onClick={() => saveQuiz(true)} disabled={isSaving} className="btn-primary">
                    <Send size={16} /> Publish
                </button>
            </div>
        </div>
    );
}
