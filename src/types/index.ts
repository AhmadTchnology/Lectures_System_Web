export type Role = 'admin' | 'teacher' | 'student';

export interface User {
    id: string;
    email: string;
    password?: string;
    role: Role;
    name: string;
    createdAt?: any;
    favorites?: string[];
    completedLectures?: string[];
    lastSignOut?: number;
    unreadAnnouncements?: string[];
}

export interface Lecture {
    id: string;
    title: string;
    subject: string;
    stage: string;
    pdfUrl: string;
    uploadedBy: string;
    uploadDate: string;
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    type: 'homework' | 'exam' | 'event' | 'other';
    createdBy: string;
    creatorName?: string;
    createdAt: any;
    expiryDate?: string;
}

export interface Category {
    id: string;
    name: string;
    type: 'subject' | 'stage';
    createdAt: any;
}

export interface EditUserState {
    id: string;
    name: string;
    email: string;
    role: Role;
    isOpen: boolean;
}
