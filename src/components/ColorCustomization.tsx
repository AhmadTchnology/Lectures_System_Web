import React, { useState, useEffect } from 'react';
import { RotateCcw, Save, Palette } from 'lucide-react';
import { ColorSettingsManager, ColorSettings } from '../utils/colorSettings';

interface ColorCustomizationProps {
  currentTheme: 'light' | 'dark';
}

const ColorCustomization: React.FC<ColorCustomizationProps> = ({ currentTheme }) => {
  const [colors, setColors] = useState<ColorSettings>(() => 
    ColorSettingsManager.getColors(currentTheme)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Update colors when theme changes
  useEffect(() => {
    const newColors = ColorSettingsManager.getColors(currentTheme);
    setColors(newColors);
  }, [currentTheme]);

  const handleColorChange = (key: keyof ColorSettings, value: string) => {
    const updatedColors = { ...colors, [key]: value };
    setColors(updatedColors);
    // Apply colors in real-time for preview
    ColorSettingsManager.applyColors(currentTheme, updatedColors);
  };

  const handleSave = () => {
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      ColorSettingsManager.saveColors(currentTheme, colors);
      ColorSettingsManager.applyColors(currentTheme, colors);
      setSaveMessage('✅ Colors saved successfully!');
      
      setTimeout(() => {
        setSaveMessage('');
        setIsSaving(false);
      }, 2000);
    } catch (error) {
      setSaveMessage('❌ Error saving colors');
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm(`Reset all colors to defaults for ${currentTheme} mode?`)) {
      const defaultColors = ColorSettingsManager.resetColors(currentTheme);
      setColors(defaultColors);
      ColorSettingsManager.applyColors(currentTheme, defaultColors);
      setSaveMessage('🔄 Colors reset to defaults');
      
      setTimeout(() => {
        setSaveMessage('');
      }, 2000);
    }
  };

  const colorGroups = [
    {
      title: 'General Colors',
      colors: [
        { key: 'primaryColor' as keyof ColorSettings, label: 'Primary Color', description: 'Main brand color' },
        { key: 'backgroundColor' as keyof ColorSettings, label: 'Background Color', description: 'Page background' },
        { key: 'cardBackground' as keyof ColorSettings, label: 'Card Background', description: 'Cards and panels' },
      ]
    },
    {
      title: 'Text Colors',
      colors: [
        { key: 'textPrimary' as keyof ColorSettings, label: 'Primary Text', description: 'Main text color' },
        { key: 'textSecondary' as keyof ColorSettings, label: 'Secondary Text', description: 'Subtle text' },
      ]
    },
    {
      title: 'Button Colors',
      colors: [
        { key: 'buttonPrimary' as keyof ColorSettings, label: 'Button Color', description: 'Primary buttons' },
        { key: 'buttonHover' as keyof ColorSettings, label: 'Button Hover', description: 'Button hover state' },
      ]
    },
    {
      title: 'UI Elements',
      colors: [
        { key: 'borderColor' as keyof ColorSettings, label: 'Border Color', description: 'Borders and dividers' },
        { key: 'successColor' as keyof ColorSettings, label: 'Success Color', description: 'Success messages' },
        { key: 'warningColor' as keyof ColorSettings, label: 'Warning Color', description: 'Warning messages' },
        { key: 'dangerColor' as keyof ColorSettings, label: 'Danger Color', description: 'Error messages' },
      ]
    }
  ];

  return (
    <div className="content-container">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="section-title">Color Customization</h2>
          <p className="text-secondary" style={{ marginTop: '-0.5rem', marginBottom: '1rem' }}>
            Customize colors for <strong>{currentTheme} mode</strong>. Changes are saved locally and work offline.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleReset}
            className="btn-secondary flex items-center gap-2"
          >
            <RotateCcw size={18} />
            Reset to Defaults
          </button>
          <button 
            onClick={handleSave}
            className="btn-primary flex items-center gap-2"
            disabled={isSaving}
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className={`alert ${saveMessage.includes('✅') ? 'alert-success' : saveMessage.includes('🔄') ? 'alert-info' : 'alert-error'}`}>
          {saveMessage}
        </div>
      )}

      <div className="color-customization-grid">
        {colorGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="card">
            <h3 className="card-title flex items-center gap-2">
              <Palette size={20} />
              {group.title}
            </h3>
            <div className="color-controls">
              {group.colors.map((color) => (
                <div key={color.key} className="color-control-item">
                  <div className="color-control-label">
                    <label htmlFor={color.key}>{color.label}</label>
                    <span className="color-control-description">{color.description}</span>
                  </div>
                  <div className="color-control-input">
                    <input
                      type="color"
                      id={color.key}
                      value={colors[color.key]}
                      onChange={(e) => handleColorChange(color.key, e.target.value)}
                      className="color-picker"
                    />
                    <input
                      type="text"
                      value={colors[color.key]}
                      onChange={(e) => handleColorChange(color.key, e.target.value)}
                      className="color-hex-input"
                      pattern="^#[0-9A-Fa-f]{6}$"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-6">
        <h3 className="card-title">Preview</h3>
        <div className="color-preview-section">
          <div className="preview-item">
            <div className="preview-card">
              <h4>Sample Card</h4>
              <p>This is how your customized colors will look.</p>
              <div className="preview-buttons">
                <button className="btn-primary">Primary Button</button>
                <button className="btn-secondary">Secondary Button</button>
                <button className="btn-danger">Danger Button</button>
              </div>
            </div>
          </div>
          
          <div className="preview-badges">
            <span className="preview-badge badge-success">Success</span>
            <span className="preview-badge badge-warning">Warning</span>
            <span className="preview-badge badge-danger">Danger</span>
          </div>
        </div>
      </div>

      <div className="card mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <div className="text-blue-600 dark:text-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-200">💡 Tips</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>• Colors are saved separately for light and dark modes</li>
              <li>• Settings are stored locally and work offline</li>
              <li>• Switch between light/dark modes to customize each theme</li>
              <li>• Use the Reset button to restore default colors</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorCustomization;
