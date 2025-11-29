import { ColorSettings } from './colorSettings';

export interface Template {
    id: string;
    name: string;
    description: string;
    colors: Partial<ColorSettings>;
}

export const COLOR_TEMPLATES: { light: Template[]; dark: Template[] } = {
    light: [
        {
            id: 'ocean',
            name: 'Ocean Breeze',
            description: 'Calming blue and teal tones',
            colors: {
                primaryColor: '#0ea5e9', // Sky 500
                backgroundColor: '#f0f9ff', // Sky 50
                cardBackground: '#ffffff',
                textPrimary: '#0c4a6e', // Sky 900
                textSecondary: '#334155', // Slate 700
                buttonPrimary: '#0ea5e9',
                buttonHover: '#0284c7', // Sky 600
                borderColor: '#bae6fd', // Sky 200
                successColor: '#10b981',
                warningColor: '#f59e0b',
                dangerColor: '#ef4444'
            }
        },
        {
            id: 'forest',
            name: 'Forest Walk',
            description: 'Natural greens and earth tones',
            colors: {
                primaryColor: '#16a34a', // Green 600
                backgroundColor: '#f0fdf4', // Green 50
                cardBackground: '#ffffff',
                textPrimary: '#14532d', // Green 900
                textSecondary: '#3f6212', // Lime 800
                buttonPrimary: '#16a34a',
                buttonHover: '#15803d', // Green 700
                borderColor: '#bbf7d0', // Green 200
                successColor: '#16a34a',
                warningColor: '#ca8a04',
                dangerColor: '#dc2626'
            }
        },
        {
            id: 'sunset',
            name: 'Sunset Glow',
            description: 'Warm oranges and reds',
            colors: {
                primaryColor: '#f97316', // Orange 500
                backgroundColor: '#fff7ed', // Orange 50
                cardBackground: '#ffffff',
                textPrimary: '#7c2d12', // Orange 900
                textSecondary: '#431407', // Orange 950
                buttonPrimary: '#f97316',
                buttonHover: '#ea580c', // Orange 600
                borderColor: '#fed7aa', // Orange 200
                successColor: '#22c55e',
                warningColor: '#f97316',
                dangerColor: '#ef4444'
            }
        },
        {
            id: 'lavender',
            name: 'Lavender Dream',
            description: 'Soft purples and lilacs',
            colors: {
                primaryColor: '#8b5cf6', // Violet 500
                backgroundColor: '#f5f3ff', // Violet 50
                cardBackground: '#ffffff',
                textPrimary: '#4c1d95', // Violet 900
                textSecondary: '#5b21b6', // Violet 800
                buttonPrimary: '#8b5cf6',
                buttonHover: '#7c3aed', // Violet 600
                borderColor: '#ddd6fe', // Violet 200
                successColor: '#10b981',
                warningColor: '#f59e0b',
                dangerColor: '#ef4444'
            }
        },
        {
            id: 'corporate',
            name: 'Corporate Blue',
            description: 'Professional deep blues',
            colors: {
                primaryColor: '#1e40af', // Blue 800
                backgroundColor: '#f8fafc', // Slate 50
                cardBackground: '#ffffff',
                textPrimary: '#0f172a', // Slate 900
                textSecondary: '#334155', // Slate 700
                buttonPrimary: '#1e40af',
                buttonHover: '#1e3a8a', // Blue 900
                borderColor: '#cbd5e1', // Slate 300
                successColor: '#15803d',
                warningColor: '#b45309',
                dangerColor: '#b91c1c'
            }
        }
    ],
    dark: [
        {
            id: 'midnight',
            name: 'Midnight Blue',
            description: 'Deep blue night theme',
            colors: {
                primaryColor: '#60a5fa', // Blue 400
                backgroundColor: '#0f172a', // Slate 900
                cardBackground: '#1e293b', // Slate 800
                textPrimary: '#f1f5f9', // Slate 100
                textSecondary: '#94a3b8', // Slate 400
                buttonPrimary: '#3b82f6', // Blue 500
                buttonHover: '#2563eb', // Blue 600
                borderColor: '#334155', // Slate 700
                successColor: '#4ade80',
                warningColor: '#fbbf24',
                dangerColor: '#f87171'
            }
        },
        {
            id: 'matrix',
            name: 'Matrix Code',
            description: 'High contrast black and green',
            colors: {
                primaryColor: '#4ade80', // Green 400
                backgroundColor: '#000000', // Black
                cardBackground: '#111111', // Gray 950
                textPrimary: '#4ade80', // Green 400
                textSecondary: '#22c55e', // Green 500
                buttonPrimary: '#22c55e', // Green 500
                buttonHover: '#16a34a', // Green 600
                borderColor: '#14532d', // Green 900
                successColor: '#4ade80',
                warningColor: '#facc15',
                dangerColor: '#ef4444'
            }
        },
        {
            id: 'dracula',
            name: 'Vampire Night',
            description: 'Dark purples and pinks',
            colors: {
                primaryColor: '#c084fc', // Purple 400
                backgroundColor: '#2e1065', // Violet 950
                cardBackground: '#4c1d95', // Violet 900
                textPrimary: '#f3e8ff', // Purple 100
                textSecondary: '#d8b4fe', // Purple 300
                buttonPrimary: '#9333ea', // Purple 600
                buttonHover: '#7e22ce', // Purple 700
                borderColor: '#6b21a8', // Purple 800
                successColor: '#34d399',
                warningColor: '#fbbf24',
                dangerColor: '#f87171'
            }
        },
        {
            id: 'coffee',
            name: 'Coffee House',
            description: 'Warm browns and dark grays',
            colors: {
                primaryColor: '#d6d3d1', // Stone 300
                backgroundColor: '#1c1917', // Stone 900
                cardBackground: '#292524', // Stone 800
                textPrimary: '#e7e5e4', // Stone 200
                textSecondary: '#a8a29e', // Stone 400
                buttonPrimary: '#57534e', // Stone 600
                buttonHover: '#44403c', // Stone 700
                borderColor: '#44403c', // Stone 700
                successColor: '#84cc16',
                warningColor: '#f59e0b',
                dangerColor: '#ef4444'
            }
        },
        {
            id: 'cyberpunk',
            name: 'Cyberpunk',
            description: 'Neon pinks and blues',
            colors: {
                primaryColor: '#f472b6', // Pink 400
                backgroundColor: '#020617', // Slate 950
                cardBackground: '#1e1b4b', // Indigo 950
                textPrimary: '#e2e8f0', // Slate 200
                textSecondary: '#94a3b8', // Slate 400
                buttonPrimary: '#db2777', // Pink 600
                buttonHover: '#be185d', // Pink 700
                borderColor: '#4c1d95', // Violet 900
                successColor: '#2dd4bf',
                warningColor: '#facc15',
                dangerColor: '#f43f5e'
            }
        }
    ]
};
