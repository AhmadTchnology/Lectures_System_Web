import React, { useState, useEffect } from 'react';
import { RotateCcw, Save, Palette, Check } from 'lucide-react';
import { ColorSettingsManager, ColorSettings } from '../utils/colorSettings';
import { COLOR_TEMPLATES, Template } from '../utils/colorTemplates';

interface ColorCustomizationProps {
  currentTheme: 'light' | 'dark';
}

const ColorCustomization: React.FC<ColorCustomizationProps> = ({ currentTheme }) => {
  const [colors, setColors] = useState<ColorSettings>(() =>
    ColorSettingsManager.getColors(currentTheme)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);

  // Update colors when theme changes
  useEffect(() => {
    const newColors = ColorSettingsManager.getColors(currentTheme);
    setColors(newColors);
    setActiveTemplateId(null);
  }, [currentTheme]);

  const handleColorChange = (key: keyof ColorSettings, value: string) => {
    const updatedColors = { ...colors, [key]: value };
    setColors(updatedColors);
    setActiveTemplateId(null); // Clear active template if user manually changes a color
    // Apply colors in real-time for preview
    ColorSettingsManager.applyColors(currentTheme, updatedColors);
  };

  const handleTemplateSelect = (template: Template) => {
    const updatedColors = { ...colors, ...template.colors };
    setColors(updatedColors as ColorSettings);
    setActiveTemplateId(template.id);
    ColorSettingsManager.applyColors(currentTheme, updatedColors as ColorSettings);
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
      setActiveTemplateId(null);
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

  // Get available templates for current theme
  const availableTemplates = COLOR_TEMPLATES[currentTheme] || [];

  return (
    <div className="content-container">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div className="w-full sm:w-auto">
          <h2 className="section-title">Color Customization</h2>
          <p className="text-secondary" style={{ marginTop: '-0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
            Customize colors for <strong>{currentTheme} mode</strong>. Changes are saved locally and work offline.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={handleReset}
            className="btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <RotateCcw size={18} />
            <span className="hidden sm:inline">Reset to Defaults</span>
            <span className="sm:hidden">Reset</span>
          </button>
          <button
            onClick={handleSave}
            className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
            disabled={isSaving}
          >
            <Save size={18} />
            <span className="hidden sm:inline">Save Changes</span>
            <span className="sm:hidden">Save</span>
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className={`alert ${saveMessage.includes('✅') ? 'alert-success' : saveMessage.includes('🔄') ? 'alert-info' : 'alert-error'}`}>
          {saveMessage}
        </div>
      )}

      {/* Templates Section */}
      <div className="card mb-6">
        <h3 className="card-title flex items-center gap-2 mb-4">
          <Palette size={20} />
          Preset Templates
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {availableTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateSelect(template)}
              className={`
                relative flex flex-col items-start p-3 rounded-lg border transition-all
                ${activeTemplateId === template.id
                  ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800'}
              `}
            >
              <div className="flex gap-2 mb-2 w-full">
                <div
                  className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm"
                  style={{ backgroundColor: template.colors.primaryColor }}
                  title="Primary Color"
                />
                <div
                  className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm"
                  style={{ backgroundColor: template.colors.backgroundColor }}
                  title="Background Color"
                />
                <div
                  className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm"
                  style={{ backgroundColor: template.colors.cardBackground }}
                  title="Card Background"
                />
              </div>
              <div className="text-left">
                <div className="font-medium text-sm text-primary">{template.name}</div>
                <div className="text-xs text-secondary mt-0.5 line-clamp-1">{template.description}</div>
              </div>

              {activeTemplateId === template.id && (
                <div className="absolute top-2 right-2 text-primary">
                  <Check size={16} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

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
