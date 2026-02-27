import { useOutletContext } from 'react-router-dom';
import AIChat from '../../components/AIChat';
import { useAuth } from '../../contexts/AuthContext';

export default function ChatPage() {
    const { currentUser } = useAuth();
    const { currentTheme } = useOutletContext<{ currentTheme: 'light' | 'dark' }>();

    return (
        <div className="h-full p-4 overflow-hidden">
            <AIChat
                currentTheme={currentTheme}
                userName={currentUser?.name || 'Guest'}
                userRole={currentUser?.role || 'student'}
            />
        </div>
    );
}
