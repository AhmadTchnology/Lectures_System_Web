import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCategories } from '../categories/useCategories';
import * as lectureService from './lectureService';

export default function UploadPage() {
    const { currentUser } = useAuth();
    const { categories } = useCategories();

    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [stage, setStage] = useState('');
    const [lectureUrl, setLectureUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const subjects = categories.filter((c) => c.type === 'subject');
    const stages = categories.filter((c) => c.type === 'stage');

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setUploadError('');
        }
    };

    const handleFileUpload = async () => {
        if (!selectedFile) return;
        setUploading(true);
        setUploadError('');
        setUploadProgress(0);

        try {
            const url = await lectureService.uploadPdfToServer(selectedFile);
            setLectureUrl(url);
            setUploadProgress(100);
        } catch (error: any) {
            if (error.message === 'Failed to fetch') {
                setUploadError('Cannot connect to server. Please check your internet connection.');
            } else {
                setUploadError(error.message || 'Error uploading file');
            }
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!lectureUrl || !currentUser) return;

        setIsLoading(true);
        try {
            await lectureService.addLecture({
                title,
                subject,
                stage,
                pdfUrl: lectureUrl,
                uploadedBy: currentUser.id,
            });
            setTitle('');
            setSubject('');
            setStage('');
            setLectureUrl('');
            setSelectedFile(null);
            setUploadProgress(0);
            alert('Lecture uploaded successfully!');
        } catch (error: any) {
            alert('Error uploading lecture: ' + (error.message || 'An error occurred'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card">
            <h3 className="card-title">Add New Lecture</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="lectureTitle">Title</label>
                    <input type="text" id="lectureTitle" value={title} onChange={(e) => setTitle(e.target.value)} required className="input-field" placeholder="Enter lecture title" />
                </div>
                <div className="form-group">
                    <label htmlFor="lectureSubject">Subject</label>
                    <select id="lectureSubject" value={subject} onChange={(e) => setSubject(e.target.value)} required className="input-field">
                        <option value="">Select a subject</option>
                        {subjects.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="lectureStage">Stage</label>
                    <select id="lectureStage" value={stage} onChange={(e) => setStage(e.target.value)} required className="input-field">
                        <option value="">Select a stage</option>
                        {stages.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="lectureFile">Upload PDF File</label>
                    <div className="file-upload-container">
                        <input type="file" id="lectureFile" accept=".pdf" onChange={handleFileSelect} className="file-input" style={{ display: 'none' }} />
                        <label htmlFor="lectureFile" className="file-input-label">
                            <Upload size={20} />
                            {selectedFile ? selectedFile.name : 'Choose a PDF file'}
                        </label>

                        {selectedFile && !lectureUrl && (
                            <button type="button" onClick={handleFileUpload} disabled={uploading} className="btn-secondary" style={{ marginTop: '0.5rem' }}>
                                {uploading ? <><span className="loading-spinner"></span> Uploading...</> : <><Upload size={18} /> Upload to Server</>}
                            </button>
                        )}

                        {uploading && (
                            <div className="upload-progress">
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                                </div>
                            </div>
                        )}

                        {uploadError && <div className="error-message" style={{ marginTop: '0.5rem' }}>{uploadError}</div>}

                        {lectureUrl && (
                            <div className="success-message" style={{ marginTop: '0.5rem' }}>
                                File uploaded successfully!
                                <button type="button" onClick={() => { navigator.clipboard.writeText(lectureUrl); alert('URL copied!'); }} className="btn-secondary" style={{ marginLeft: '0.5rem', padding: '0.5rem' }}>
                                    Copy URL
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <button type="submit" className="btn-primary" disabled={!lectureUrl || isLoading}>
                    {isLoading ? <span className="loading-spinner"></span> : <><Upload size={18} /> Add Lecture</>}
                </button>
            </form>
        </div>
    );
}
