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
        ],
    },
    {
        path: '*',
        element: <Navigate to="/dashboard" replace />,
    },
]);
