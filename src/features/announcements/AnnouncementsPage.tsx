import React, { useState } from 'react';
import { Plus, Trash } from 'lucide-react';
import type { Announcement } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useAnnouncements } from './useAnnouncements';
import { useUsers } from '../users/useUsers';

export default function AnnouncementsPage() {
    const { currentUser } = useAuth();
    const { announcements, isLoading, addAnnouncement, deleteAnnouncement, markAsRead } = useAnnouncements();
    const { users } = useUsers();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState<Announcement['type']>('homework');
    const [expiryDate, setExpiryDate] = useState('');

    const canCreate = currentUser?.role === 'admin' || currentUser?.role === 'teacher';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;
        await addAnnouncement({ title: title.trim(), content: content.trim(), type, expiryDate: expiryDate || undefined });
        setTitle('');
        setContent('');
        setType('homework');
        setExpiryDate('');
    };

    return (
        <div className="content-container">
            <h2 className="section-title">Announcements</h2>

            {canCreate && (
                <div className="card">
                    <h3 className="card-title">Create New Announcement</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="announcementTitle">Title</label>
                            <input type="text" id="announcementTitle" className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="announcementContent">Content</label>
                            <textarea id="announcementContent" className="input-field" value={content} onChange={(e) => setContent(e.target.value)} rows={4} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="announcementType">Type</label>
                            <select id="announcementType" className="input-field" value={type} onChange={(e) => setType(e.target.value as Announcement['type'])}>
                                <option value="homework">Homework</option>
                                <option value="exam">Exam</option>
                                <option value="event">Event</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="announcementExpiry">Expiry Date (Optional)</label>
                            <input type="date" id="announcementExpiry" className="input-field" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                        </div>
                        <button type="submit" className="btn-primary w-full" disabled={isLoading}>
                            {isLoading ? <span className="loading-spinner"></span> : <><Plus size={18} /> Create Announcement</>}
                        </button>
                    </form>
                </div>
            )}

            <div className="announcement-grid">
                {announcements.length > 0 ? (
                    announcements.map((announcement) => {
                        const isUnread = currentUser?.unreadAnnouncements?.includes(announcement.id) === false;
                        const creator = users.find((u) => u.id === announcement.createdBy);

                        return (
                            <div key={announcement.id} className={`announcement-card ${isUnread ? 'announcement-unread' : ''}`} onClick={() => markAsRead(announcement.id)}>
                                <div className="announcement-card-header">
                                    <h3 className="announcement-title">{announcement.title}</h3>
                                    <span className={`announcement-type announcement-type-${announcement.type}`}>{announcement.type}</span>
                                </div>
                                <div className="announcement-card-body">
                                    <p className="announcement-content">{announcement.content}</p>
                                </div>
                                <div className="announcement-card-footer">
                                    <div className="announcement-meta">
                                        <span className="announcement-creator">By: {announcement.creatorName || creator?.name || 'Unknown'}</span>
                                        <span className="announcement-date">
                                            {announcement.createdAt?.toDate ? new Date(announcement.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                                        </span>
                                    </div>
                                    {(currentUser?.role === 'admin' || currentUser?.id === announcement.createdBy) && (
                                        <button onClick={(e) => { e.stopPropagation(); deleteAnnouncement(announcement.id, announcement.createdBy); }} className="btn-danger" disabled={isLoading}>
                                            <Trash size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="no-results"><p>No announcements available.</p></div>
                )}
            </div>
        </div>
    );
}
