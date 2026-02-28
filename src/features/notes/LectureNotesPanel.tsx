import { X } from 'lucide-react';
import NoteEditor from './NoteEditor';
import type { Lecture } from '../../types';

interface LectureNotesPanelProps {
    lecture: Lecture;
    isOpen: boolean;
    onClose: () => void;
}

export default function LectureNotesPanel({ lecture, isOpen, onClose }: LectureNotesPanelProps) {
    return (
        <div className={`notes-panel-overlay ${isOpen ? 'open' : ''}`}>
            <div className="notes-panel-backdrop" onClick={onClose} />
            <div className={`notes-panel ${isOpen ? 'open' : ''}`}>
                <div className="notes-panel-header">
                    <div>
                        <h2>Lecture Notes</h2>
                        <p className="notes-lecture-title">{lecture.title}</p>
                    </div>
                    <button className="btn-close-panel" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="notes-panel-body">
                    {isOpen && <NoteEditor lectureId={lecture.id} lectureTitle={lecture.title} />}
                </div>
            </div>
        </div>
    );
}
