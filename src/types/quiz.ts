import type { Timestamp } from 'firebase/firestore';

export interface Quiz {
    id: string;
    title: string;
    description?: string;
    subject: string;
    stage: string;
    createdBy: string;
    creatorName: string;
    createdAt: Timestamp | any;
    questions: Question[];
    timeLimit?: number;
    isPublished: boolean;
    lectureId?: string;
}

export type QuestionType = 'mcq' | 'true-false' | 'short-answer';

export interface Question {
    id: string;
    type: QuestionType;
    text: string;
    options?: string[];
    correctAnswer: string;
    points: number;
}

export interface QuizSubmission {
    id: string;
    quizId: string;
    studentId: string;
    studentName: string;
    answers: Record<string, string>;
    score: number;
    maxScore: number;
    percentage: number;
    submittedAt: Timestamp | any;
    timeSpent: number;
    graded: boolean;
}
