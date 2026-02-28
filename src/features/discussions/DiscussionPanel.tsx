import { useState, useRef, useEffect } from 'react';
import { X, Send, Trash2, User, MessageCircle, Pin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useDiscussions } from './useDiscussions';
import type { Lecture } from '../../types';

interface DiscussionPanelProps {
    lecture: Lecture;
    isOpen: boolean;
    onClose: () => void;
}

export default function DiscussionPanel({ lecture, isOpen, onClose }: DiscussionPanelProps) {
    const { currentUser } = useAuth();
    const { comments, isLoading, error, postComment, removeComment, togglePin } = useDiscussions(lecture.id);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Resizing logic
    const [panelWidth, setPanelWidth] = useState(450);
    const [isResizing, setIsResizing] = useState(false);

    const startResizing = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;
            const newWidth = window.innerWidth - e.clientX;
            setPanelWidth(Math.max(300, Math.min(newWidth, window.innerWidth * 0.9)));
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        } else {
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizing]);


    // Auto-scroll to bottom when new comments arrive
    useEffect(() => {
        if (isOpen && comments.length > 0) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [comments, isOpen]);

    const handlePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await postComment(newComment.trim());
            setNewComment('');
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (timestamp: any) => {
        if (!timestamp) return 'Just now';
        // Firestore timestamp to Date
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'
        }).format(date);
    };

    return (
        <div className={`discussion-panel-overlay ${isOpen ? 'open' : ''}`}>
            <div className="discussion-panel-backdrop" onClick={onClose} />
            <div
                className={`discussion-panel ${isOpen ? 'open' : ''} ${isResizing ? 'resizing' : ''}`}
                style={{ width: `${panelWidth}px`, maxWidth: '90vw' }}
            >
                <div
                    className="discussion-panel-resizer"
                    onMouseDown={startResizing}
                />

                <div className="discussion-panel-header">
                    <div>
                        <h2>Discussion</h2>
                        <p className="discussion-lecture-title">{lecture.title}</p>
                    </div>
                    <button className="btn-close-panel" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="discussion-panel-body">
                    {isLoading ? (
                        <div className="discussion-loading">Loading discussion...</div>
                    ) : comments.length === 0 ? (
                        <div className="discussion-empty">
                            <MessageCircle size={48} className="empty-icon" />
                            <h3>No comments yet</h3>
                            <p>Be the first to start the discussion!</p>
                        </div>
                    ) : (
                        <div className="discussion-list">
                            {comments.map((comment) => {
                                const isOwnComment = comment.userId === currentUser?.id;
                                const isPrivileged = currentUser?.role === 'admin' || currentUser?.role === 'teacher';
                                const isAdmin = currentUser?.role === 'admin';

                                return (
                                    <div key={comment.id} className={`discussion-comment ${isOwnComment ? 'own-comment' : ''} ${comment.isPinned ? 'pinned' : ''}`}>
                                        <div className="comment-header">
                                            <div className="comment-author">
                                                <div className="comment-avatar">
                                                    <User size={14} />
                                                </div>
                                                <span className="comment-name">{comment.userName}</span>
                                                {comment.userRole === 'teacher' && <span className="comment-badge teacher">Teacher</span>}
                                                {comment.userRole === 'admin' && <span className="comment-badge admin">Admin</span>}
                                                {comment.isPinned && <span className="comment-badge pinned"><Pin size={10} style={{ display: 'inline', marginRight: '2px' }} />Pinned</span>}
                                            </div>
                                            <div className="comment-meta flex gap-2 items-center">
                                                <span className="comment-time">{formatTime(comment.createdAt)}</span>
                                                {isPrivileged && (
                                                    <button
                                                        className={`btn-icon-sm ${comment.isPinned ? 'text-warning' : 'text-light hover:text-warning'}`}
                                                        onClick={() => togglePin(comment.id, !comment.isPinned)}
                                                        title={comment.isPinned ? "Unpin comment" : "Pin comment"}
                                                    >
                                                        <Pin size={14} />
                                                    </button>
                                                )}
                                                {(isOwnComment || isAdmin) && (
                                                    <button
                                                        className="btn-icon-sm text-light hover:text-danger"
                                                        onClick={() => window.confirm('Delete this comment?') && removeComment(comment.id)}
                                                        title="Delete comment"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="comment-body">
                                            {comment.text}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                <div className="discussion-panel-footer">
                    {error && <div className="text-danger test-sm mb-2">{error}</div>}
                    <form onSubmit={handlePost} className="discussion-input-group">
                        <input
                            type="text"
                            placeholder="Ask a question or share a thought..."
                            className="discussion-input"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            disabled={isSubmitting || !navigator.onLine}
                        />
                        <button
                            type="submit"
                            className="btn-send-comment"
                            disabled={!newComment.trim() || isSubmitting || !navigator.onLine}
                        >
                            <Send size={18} />
                        </button>
                    </form>
                    {!navigator.onLine && (
                        <div className="offline-warning mt-2">
                            <small>You are offline. Cannot post comments.</small>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
