/**
 * Color Settings Manager
 * Manages custom color themes and persists them to localStorage
 * Works in both online and offline modes
 */

export interface ColorSettings {
  primaryColor: string;
  backgroundColor: string;
  cardBackground: string;
  textPrimary: string;
  textSecondary: string;
  buttonPrimary: string;
  buttonHover: string;
  borderColor: string;
  successColor: string;
  warningColor: string;
  dangerColor: string;
}

// Default color settings for light mode
const DEFAULT_LIGHT_COLORS: ColorSettings = {
  primaryColor: '#4f46e5',
  backgroundColor: '#f3f4f6',
  cardBackground: '#ffffff',
  textPrimary: '#1f2937',
  textSecondary: '#4b5563',
  buttonPrimary: '#4f46e5',
  buttonHover: '#4338ca',
  borderColor: '#e5e7eb',
  successColor: '#10b981',
  warningColor: '#f59e0b',
  dangerColor: '#ef4444'
};

// Default color settings for dark mode
const DEFAULT_DARK_COLORS: ColorSettings = {
  primaryColor: '#8b5cf6',
  backgroundColor: '#0f172a',
  cardBackground: '#1e293b',
  textPrimary: '#f8fafc',
  textSecondary: '#e2e8f0',
  buttonPrimary: '#8b5cf6',
  buttonHover: '#7c3aed',
  borderColor: '#475569',
  successColor: '#10b981',
  warningColor: '#f59e0b',
  dangerColor: '#ef4444'
};

const STORAGE_KEY_LIGHT = 'lms_custom_colors_light';
const STORAGE_KEY_DARK = 'lms_custom_colors_dark';

export class ColorSettingsManager {
  /**
   * Get custom colors for the specified theme
   */
  static getColors(theme: 'light' | 'dark'): ColorSettings {
    const storageKey = theme === 'light' ? STORAGE_KEY_LIGHT : STORAGE_KEY_DARK;
    const defaultColors = theme === 'light' ? DEFAULT_LIGHT_COLORS : DEFAULT_DARK_COLORS;
    
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return { ...defaultColors, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Error loading custom colors:', error);
    }
    
    return defaultColors;
  }

  /**
   * Save custom colors for the specified theme
   */
  static saveColors(theme: 'light' | 'dark', colors: ColorSettings): void {
    const storageKey = theme === 'light' ? STORAGE_KEY_LIGHT : STORAGE_KEY_DARK;
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(colors));
      console.log(`✅ Custom colors saved for ${theme} mode`);
    } catch (error) {
      console.error('Error saving custom colors:', error);
    }
  }

  /**
   * Apply colors to the document
   */
  static applyColors(theme: 'light' | 'dark', colors: ColorSettings): void {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    root.style.setProperty('--primary-color', colors.primaryColor);
    root.style.setProperty('--bg-body', colors.backgroundColor);
    root.style.setProperty('--card-bg', colors.cardBackground);
    root.style.setProperty('--text-primary', colors.textPrimary);
    root.style.setProperty('--text-secondary', colors.textSecondary);
    root.style.setProperty('--border-color', colors.borderColor);
    root.style.setProperty('--success-color', colors.successColor);
    root.style.setProperty('--warning-color', colors.warningColor);
    root.style.setProperty('--danger-color', colors.dangerColor);
    
    // Update gradient colors based on primary and button colors
    root.style.setProperty('--primary-gradient', `linear-gradient(135deg, ${colors.buttonPrimary} 0%, ${colors.primaryColor} 100%)`);
    root.style.setProperty('--primary-dark', colors.buttonHover);
    
    console.log(`🎨 Applied custom colors for ${theme} mode`);
  }

  /**
   * Reset colors to defaults for the specified theme
   */
  static resetColors(theme: 'light' | 'dark'): ColorSettings {
    const storageKey = theme === 'light' ? STORAGE_KEY_LIGHT : STORAGE_KEY_DARK;
    const defaultColors = theme === 'light' ? DEFAULT_LIGHT_COLORS : DEFAULT_DARK_COLORS;
    
    try {
      localStorage.removeItem(storageKey);
      console.log(`🔄 Reset colors to defaults for ${theme} mode`);
    } catch (error) {
      console.error('Error resetting colors:', error);
    }
    
    return defaultColors;
  }

  /**
   * Get default colors for reference
   */
  static getDefaultColors(theme: 'light' | 'dark'): ColorSettings {
    return theme === 'light' ? { ...DEFAULT_LIGHT_COLORS } : { ...DEFAULT_DARK_COLORS };
  }

  /**
   * Initialize colors on app load
   */
  static initialize(): void {
    const currentTheme = document.documentElement.getAttribute('data-theme') as 'light' | 'dark' || 'light';
    const colors = this.getColors(currentTheme);
    this.applyColors(currentTheme, colors);
  }

  /**
   * Update colors when theme changes
   */
  static onThemeChange(newTheme: 'light' | 'dark'): void {
    const colors = this.getColors(newTheme);
    this.applyColors(newTheme, colors);
  }
}
