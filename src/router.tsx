import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import RoleRoute from './components/layout/RoleRoute';
import LoginPage from './features/auth/LoginPage';
import DashboardPage from './features/dashboard/DashboardPage';
import NotesSearchPage from './features/notes/NotesSearchPage';
import SchedulePage from './features/schedule/SchedulePage';
import LecturesPage from './features/lectures/LecturesPage';
import AnnouncementsPage from './features/announcements/AnnouncementsPage';
import UserManagementPage from './features/users/UserManagementPage';
import ChatPage from './features/chat/ChatPage';
import CustomizePage from './features/settings/CustomizePage';
import AboutSection from './features/settings/AboutSection';
import AnalyticsPage from './features/analytics/AnalyticsPage';
import QuizListPage from './features/quizzes/QuizListPage';
import CreateQuizPage from './features/quizzes/CreateQuizPage';
import TakeQuizPage from './features/quizzes/TakeQuizPage';
import QuizResultsPage from './features/quizzes/QuizResultsPage';
import GroupsManagementPage from './features/groups/GroupsManagementPage';

export const router = createBrowserRouter([
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/',
        element: (
            <ProtectedRoute>
                <AppLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <Navigate to="/dashboard" replace />,
            },
            {
                path: 'dashboard',
                element: <DashboardPage />,
            },
            {
                path: 'notes',
                element: <NotesSearchPage />,
            },
            {
                path: 'schedule',
                element: <SchedulePage />,
            },
            {
                path: 'lectures',
                element: <LecturesPage />,
            },
            {
                path: 'announcements',
                element: <AnnouncementsPage />,
            },
            {
                path: 'chat',
                element: <ChatPage />,
            },
            {
                path: 'about',
                element: <AboutSection />,
            },
            {
                path: 'customize',
                element: <CustomizePage />,
            },
            {
                path: 'admin/users',
                element: (
                    <RoleRoute allowedRoles={['admin']}>
                        <UserManagementPage />
                    </RoleRoute>
                ),
            },
            {
                path: 'admin/analytics',
                element: (
                    <RoleRoute allowedRoles={['admin', 'teacher']}>
                        <AnalyticsPage />
                    </RoleRoute>
                ),
            },
            {
                path: 'quizzes',
                element: <QuizListPage />,
            },
            {
                path: 'quizzes/create',
                element: (
                    <RoleRoute allowedRoles={['admin', 'teacher']}>
                        <CreateQuizPage />
                    </RoleRoute>
                ),
            },
            {
                path: 'quizzes/:id',
                element: <TakeQuizPage />,
            },
            {
                path: 'quizzes/:id/results',
                element: (
                    <RoleRoute allowedRoles={['admin', 'teacher']}>
                        <QuizResultsPage />
                    </RoleRoute>
                ),
            },
            {
                path: 'admin/groups',
                element: (
                    <RoleRoute allowedRoles={['admin']}>
                        <GroupsManagementPage />
                    </RoleRoute>
                ),
            },
        ],
    },
    {
        path: '*',
        element: <Navigate to="/dashboard" replace />,
    },
]);
