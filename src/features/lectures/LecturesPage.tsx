import { useState } from 'react';
import { Search, Filter, CheckCircle, Edit3, MessageCircle, Heart, HeartOff, Trash, FileText } from 'lucide-react';
import classNames from 'classnames';
import { useAuth } from '../../contexts/AuthContext';
import { useCategories } from '../categories/useCategories';
import { useLectures } from './useLectures';
import UploadPage from './UploadPage';
import LectureNotesPanel from '../notes/LectureNotesPanel';
import DiscussionPanel from '../discussions/DiscussionPanel';
import type { Lecture } from '../../types';

export default function LecturesPage() {
    const { currentUser } = useAuth();
    const { categories } = useCategories();
    const {
        filteredLectures,
        searchTerm, setSearchTerm,
        filterSubject, setFilterSubject,
        filterStage, setFilterStage,
        showFavorites, setShowFavorites,
        subjects, stages,
        isLoading,
        toggleFavorite,
        toggleCompletion,
        deleteLecture,
        handleViewPDF,
    } = useLectures(categories);

    const [selectedNotesLecture, setSelectedNotesLecture] = useState<Lecture | null>(null);
    const [selectedDiscussionLecture, setSelectedDiscussionLecture] = useState<Lecture | null>(null);

    return (
        <div className="content-container">
            <h2 className="section-title">Lectures</h2>

            {currentUser?.role === 'teacher' && <UploadPage />}

            <div className="search-filter-container">
                <div className="search-container">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search lectures..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="filter-container">
                    <Filter size={20} className="filter-icon" />
                    <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} className="filter-select">
                        <option value="all">All Subjects</option>
                        {subjects.map((c) => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-container">
                    <Filter size={20} className="filter-icon" />
                    <select value={filterStage} onChange={(e) => setFilterStage(e.target.value)} className="filter-select">
                        <option value="all">All Stages</option>
                        {stages.map((c) => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                    </select>
                </div>

                {currentUser?.role === 'student' && (
                    <button onClick={() => setShowFavorites(!showFavorites)} className={classNames('btn-secondary', { 'btn-active': showFavorites })}>
                        {showFavorites ? <HeartOff size={20} /> : <Heart size={20} />}
                        {showFavorites ? 'Show All' : 'Show Favorites'}
                    </button>
                )}
            </div>

            <div className="card mt-6">
                <h3 className="card-title">{showFavorites ? 'Favorite Lectures' : 'Available Lectures'}</h3>
                <div className="lecture-grid">
                    {filteredLectures.length > 0 ? (
                        filteredLectures.map((lecture) => (
                            <div key={lecture.id} className="lecture-card">
                                <div className="lecture-card-header">
                                    <h4 className="lecture-title">{lecture.title}</h4>

                                    {currentUser?.role === 'student' && (
                                        <div className="lecture-card-top-toggles">
                                            <button onClick={() => toggleFavorite(lecture.id)} className={classNames('btn-icon-sm', { 'text-red-500': currentUser?.favorites?.includes(lecture.id) })} title="Favorite">
                                                <Heart size={16} fill={currentUser?.favorites?.includes(lecture.id) ? '#ef4444' : 'none'} />
                                            </button>
                                            <button onClick={() => toggleCompletion(lecture.id)} className={classNames('btn-icon-sm', { 'text-green-500': currentUser?.completedLectures?.includes(lecture.id) })} title="Mark Complete">
                                                <CheckCircle size={16} fill={currentUser?.completedLectures?.includes(lecture.id) ? '#10b981' : 'none'} />
                                            </button>
                                        </div>
                                    )}

                                    <div className="lecture-tags">
                                        <span className="lecture-tag">{lecture.subject}</span>
                                        <span className="lecture-tag">{lecture.stage}</span>
                                    </div>
                                </div>
                                <div className="lecture-card-body">
                                    <span className="lecture-date">Uploaded: {lecture.uploadDate}</span>
                                </div>
                                <div className="lecture-card-footer">
                                    <div className="lecture-card-main-actions">
                                        <button
                                            className="btn-primary"
                                            onClick={() => handleViewPDF(lecture)}
                                            title="View PDF"
                                        >
                                            <FileText size={18} /> View PDF
                                        </button>
                                    </div>
                                    <div className="lecture-card-sub-actions">
                                        <button
                                            className="btn-secondary"
                                            onClick={() => setSelectedNotesLecture(lecture)}
                                            title="My Notes"
                                        >
                                            <Edit3 size={16} /> Notes
                                        </button>
                                        <button
                                            className="btn-secondary"
                                            onClick={() => setSelectedDiscussionLecture(lecture)}
                                            title="Discussion"
                                        >
                                            <MessageCircle size={16} /> Discuss
                                        </button>
                                        {(currentUser?.role === 'admin' || currentUser?.id === lecture.uploadedBy) && (
                                            <button onClick={() => deleteLecture(lecture)} className="btn-danger" disabled={isLoading} title="Delete">
                                                <Trash size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-results">
                            <p>No lectures found matching your search criteria.</p>
                        </div>
                    )}
                </div>
            </div>

            {selectedNotesLecture && (
                <LectureNotesPanel
                    lecture={selectedNotesLecture}
                    isOpen={!!selectedNotesLecture}
                    onClose={() => setSelectedNotesLecture(null)}
                />
            )}

            {selectedDiscussionLecture && (
                <DiscussionPanel
                    lecture={selectedDiscussionLecture}
                    isOpen={!!selectedDiscussionLecture}
                    onClose={() => setSelectedDiscussionLecture(null)}
                />
            )}
        </div>
    );
}
