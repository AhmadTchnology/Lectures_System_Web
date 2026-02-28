import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    FileText,
    MessageSquare,
    Users,
    Info,
    Palette,
    LogOut,
    Menu,
    X,
    User,
    Edit3,
    Calendar,
    BarChart3,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAnnouncements } from '../../features/announcements/useAnnouncements';
import ThemeToggle from '../ThemeToggle';

export default function Sidebar() {
    const { currentUser, handleLogout } = useAuth();
    const { announcements, unreadCount, markAsRead } = useAnnouncements();
    const navigate = useNavigate();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const sidebarRef = useRef<HTMLElement>(null);

    // Close sidebar on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                isSidebarOpen &&
                sidebarRef.current &&
                !sidebarRef.current.contains(event.target as Node)
            ) {
                setIsSidebarOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isSidebarOpen]);

    const closeSidebar = () => setIsSidebarOpen(false);

    const onLogout = async () => {
        await handleLogout();
        navigate('/login');
    };

    return (
        <>
            {/* Mobile Header */}
            <div className="mobile-header">
                <button className="menu-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    <Menu size={24} />
                </button>
                <h1>LMS</h1>

                <div className="notification-container">
                    <button className="notification-button" onClick={() => setShowNotifications(!showNotifications)}>
                        <div className="notification-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            </svg>
                            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                        </div>
                    </button>

                    {showNotifications && (
                        <div className="notification-dropdown">
                            <div className="notification-header">
                                <h3>Notifications</h3>
                                <button className="notification-close" onClick={() => setShowNotifications(false)}>
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="notification-list">
                                {announcements.length > 0 ? (
                                    announcements.slice(0, 5).map((a) => {
                                        const isUnread = currentUser?.unreadAnnouncements?.includes(a.id) === false;
                                        return (
                                            <div key={a.id} className={`notification-item ${isUnread ? 'notification-unread' : ''}`} onClick={() => { markAsRead(a.id); navigate('/announcements'); setShowNotifications(false); }}>
                                                <div className="notification-content">
                                                    <h4>{a.title}</h4>
                                                    <p>{a.content.substring(0, 50)}...</p>
                                                    <small>By: {a.creatorName || 'Unknown'}</small>
                                                </div>
                                                <span className={`notification-type notification-type-${a.type}`}>{a.type}</span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="notification-empty"><p>No notifications</p></div>
                                )}
                            </div>
                            <div className="notification-footer">
                                <button className="btn-secondary w-full" onClick={() => { navigate('/announcements'); setShowNotifications(false); }}>View All</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar Nav */}
            {(isSidebarOpen || window.innerWidth > 768) && (
                <nav className={`sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`} ref={sidebarRef}>
                    <div className="sidebar-header">
                        <div className="sidebar-title">
                            <h1>LMS</h1>
                            <p>Lecture Management</p>
                        </div>
                        <ThemeToggle />
                        <button className="close-sidebar" onClick={closeSidebar}>
                            <X size={24} />
                        </button>
                    </div>

                    <div className="user-profile">
                        <div className="user-avatar"><User size={24} /></div>
                        <div className="user-details">
                            <p>{currentUser?.name}</p>
                            <span className={`role-badge role-${currentUser?.role}`}>{currentUser?.role}</span>
                        </div>
                    </div>

                    <ul className="nav-links">
                        <li>
                            <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeSidebar}>
                                <BarChart3 size={20} /> Dashboard
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/lectures" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeSidebar}>
                                <FileText size={20} /> Lectures
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/notes" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeSidebar}>
                                <Edit3 size={20} /> My Notes
                            </NavLink>
                        </li>
                        {currentUser?.role === 'student' && (
                            <li>
                                <NavLink to="/schedule" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeSidebar}>
                                    <Calendar size={20} /> Study Schedule
                                </NavLink>
                            </li>
                        )}
                        <li>
                            <NavLink to="/chat" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeSidebar}>
                                <MessageSquare size={20} /> AI Chat
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/announcements" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeSidebar}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                                </svg>
                                Announcements
                                {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
                            </NavLink>
                        </li>
                        {currentUser?.role === 'admin' && (
                            <li>
                                <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeSidebar}>
                                    <Users size={20} /> Users
                                </NavLink>
                            </li>
                        )}
                        <li>
                            <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeSidebar}>
                                <Info size={20} /> About Us
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/customize" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeSidebar}>
                                <Palette size={20} /> Customize Colors
                            </NavLink>
                        </li>
                        <li className="nav-footer">
                            <button onClick={onLogout} className="btn-logout">
                                <LogOut size={20} /> Logout
                            </button>
                        </li>
                    </ul>
                </nav>
            )}
        </>
    );
}
