import { User } from 'lucide-react';

export default function AboutSection() {
    return (
        <div className="content-container">
            <h2 className="section-title">About Us</h2>
            <div className="card about-card">
                <div className="about-body">
                    <h3 className="about-title">University Lecture Management System</h3>
                    <p className="about-description">
                        Welcome to our University Lecture Management System, a sophisticated digital platform designed to revolutionize how educational content is organized and accessed within our university. This system serves as a central hub for managing academic lectures across different subjects and stages, ensuring seamless access to educational materials for both educators and students.
                    </p>
                    <h4 className="about-subtitle">Core Features:</h4>
                    <ul className="about-features">
                        <li>Multi-stage lecture organization with customizable subject categories</li>
                        <li>Role-based access control for administrators, teachers, and students</li>
                        <li>Advanced search and filtering capabilities by subject and stage</li>
                        <li>Secure PDF lecture storage and viewing</li>
                        <li>User-friendly interface for lecture uploads and management</li>
                        <li>Real-time updates</li>
                        <li>Comprehensive user management system</li>
                    </ul>
                    <div className="about-creator">
                        <div className="creator-avatar"><User size={32} /></div>
                        <div className="creator-info">
                            <p className="creator-name">Ahmed Shukur Hameed</p>
                            <p className="creator-title">Computer Network Engineer</p>
                        </div>
                    </div>
                    <p className="about-copyright">© 2025 University of Technology - Lecture Management System. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}
