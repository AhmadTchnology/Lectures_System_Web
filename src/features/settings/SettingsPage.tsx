import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { HardDrive } from 'lucide-react';
import ColorCustomization from '../../components/ColorCustomization';
import CacheManager from '../../components/CacheManager';
import AboutSection from './AboutSection';

export default function SettingsPage() {
    const { currentTheme } = useOutletContext<{ currentTheme: 'light' | 'dark' }>();
    const [showCacheManager, setShowCacheManager] = useState(false);

    return (
        <div className="content-container">
            <h2 className="section-title">Settings</h2>
            <ColorCustomization currentTheme={currentTheme} />

            <div className="mt-6 card">
                <div className="flex items-center gap-2 mb-4">
                    <HardDrive size={24} className="text-blue-600 dark:text-blue-400" />
                    <h3 className="card-title mb-0">Storage & Cache</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Manage your downloaded lectures and free up space on your device.
                </p>
                <button
                    onClick={() => setShowCacheManager(true)}
                    className="btn-secondary"
                >
                    Open Cache Manager
                </button>
            </div>

            <div className="mt-6">
                <AboutSection />
            </div>

            {showCacheManager && (
                <CacheManager onClose={() => setShowCacheManager(false)} />
            )}
        </div>
    );
}
