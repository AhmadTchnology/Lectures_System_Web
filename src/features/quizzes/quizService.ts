import {
    collection, addDoc, getDocs, getDoc, doc, deleteDoc, updateDoc,
    query, orderBy, where, onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase';
import type { Quiz, Question, QuizSubmission } from '../../types/quiz';

export function subscribeQuizzes(
    callback: (quizzes: Quiz[]) => void,
    onError?: (err: Error) => void
) {
    const q = query(collection(db, 'quizzes'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Quiz)));
    }, (err) => onError?.(err as Error));
}

export async function createQuiz(data: Omit<Quiz, 'id' | 'createdAt'>) {
    // Firestore rejects `undefined` values — strip them from nested question objects
    const cleanData = JSON.parse(JSON.stringify(data));
    return addDoc(collection(db, 'quizzes'), {
        ...cleanData,
        createdAt: serverTimestamp(),
    });
}

export async function getQuiz(quizId: string): Promise<Quiz | null> {
    const snap = await getDoc(doc(db, 'quizzes', quizId));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as Quiz) : null;
}

export async function publishQuiz(quizId: string) {
    return updateDoc(doc(db, 'quizzes', quizId), { isPublished: true });
}

export async function unpublishQuiz(quizId: string) {
    return updateDoc(doc(db, 'quizzes', quizId), { isPublished: false });
}

export async function deleteQuiz(quizId: string) {
    return deleteDoc(doc(db, 'quizzes', quizId));
}

export function autoGrade(
    questions: Question[],
    answers: Record<string, string>
): { score: number; maxScore: number; graded: boolean } {
    let score = 0;
    let maxScore = 0;
    let allGraded = true;

    for (const q of questions) {
        maxScore += q.points;
        const userAnswer = answers[q.id];

        if (q.type === 'short-answer') {
            allGraded = false;
            continue;
        }

        if (userAnswer?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()) {
            score += q.points;
        }
    }

    return { score, maxScore, graded: allGraded };
}

export async function submitQuiz(
    quizId: string,
    quiz: Quiz,
    submission: Omit<QuizSubmission, 'id' | 'submittedAt' | 'score' | 'maxScore' | 'percentage' | 'graded' | 'quizId'>
) {
    const { score, maxScore, graded } = autoGrade(quiz.questions, submission.answers);
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    return addDoc(collection(db, 'quizzes', quizId, 'submissions'), {
        ...submission,
        quizId,
        score,
        maxScore,
        percentage,
        graded,
        submittedAt: serverTimestamp(),
    });
}

export async function getSubmissions(quizId: string): Promise<QuizSubmission[]> {
    const q = query(
        collection(db, 'quizzes', quizId, 'submissions'),
        orderBy('submittedAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as QuizSubmission));
}

export async function getMySubmissions(
    quizId: string,
    userId: string
): Promise<QuizSubmission[]> {
    const q = query(
        collection(db, 'quizzes', quizId, 'submissions'),
        where('studentId', '==', userId)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as QuizSubmission));
}

export async function gradeShortAnswer(
    quizId: string,
    submissionId: string,
    newScore: number,
    maxScore: number
) {
    const percentage = maxScore > 0 ? Math.round((newScore / maxScore) * 100) : 0;
    return updateDoc(doc(db, 'quizzes', quizId, 'submissions', submissionId), {
        score: newScore,
        percentage,
        graded: true,
    });
}
