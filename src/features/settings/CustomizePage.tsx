import { useOutletContext } from 'react-router-dom';
import ColorCustomization from '../../components/ColorCustomization';

export default function CustomizePage() {
    const { currentTheme } = useOutletContext<{ currentTheme: 'light' | 'dark' }>();

    return <ColorCustomization currentTheme={currentTheme} />;
}
