import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AppLayout() {
    const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(() => {
        return (document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'light';
    });

    // Watch for theme changes via MutationObserver
    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    const newTheme = document.documentElement.getAttribute('data-theme') as 'light' | 'dark';
                    setCurrentTheme(newTheme || 'light');
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme'],
        });

        return () => observer.disconnect();
    }, []);

    return (
        <div className="app">
            <div className="dashboard">
                <Sidebar />
                <main className="main-content">
                    <Outlet context={{ currentTheme }} />
                </main>
            </div>
        </div>
    );
}
