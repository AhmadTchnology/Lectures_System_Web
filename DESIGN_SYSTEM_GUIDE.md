# LMS Design System Guide

This document provides a comprehensive overview of the design system used in the Lecture Management System (LMS). Use this as a reference to replicate the design in other projects.

---

## Table of Contents
1. [Color Schema](#color-schema)
2. [Typography](#typography)
3. [Layout & Structure](#layout--structure)
4. [Component Design](#component-design)
5. [Spacing & Sizing](#spacing--sizing)
6. [Shadows & Effects](#shadows--effects)
7. [Responsive Design](#responsive-design)
8. [Animations & Transitions](#animations--transitions)

---

## Color Schema

### Light Mode Colors
```css
--primary-color: #4f46e5;        /* Indigo 600 - Main brand color */
--primary-dark: #4338ca;         /* Indigo 700 - Darker variant */
--primary-light: #818cf8;        /* Indigo 400 - Lighter variant */
--vibrant-blue: #0ea5e9;         /* Sky 500 - Accent color */

--success-color: #10b981;        /* Emerald 500 */
--warning-color: #f59e0b;        /* Amber 500 */
--danger-color: #ef4444;         /* Red 500 */

--text-primary: #1f2937;         /* Gray 800 - Main text */
--text-secondary: #4b5563;       /* Gray 600 - Secondary text */
--text-light: #6b7280;           /* Gray 500 - Muted text */

--border-color: #e5e7eb;         /* Gray 200 */
--card-bg: #ffffff;              /* White */
--bg-light: #f9fafb;             /* Gray 50 */
--bg-body: #f3f4f6;              /* Gray 100 - Page background */
```

### Dark Mode Colors
```css
--primary-color: #8b5cf6;        /* Violet 500 - More vibrant purple */
--primary-dark: #7c3aed;         /* Violet 600 */
--primary-light: #a78bfa;        /* Violet 400 */
--vibrant-blue: #60a5fa;         /* Blue 400 - Brighter for visibility */

--success-color: #10b981;        /* Emerald 500 */
--warning-color: #f59e0b;        /* Amber 500 */
--danger-color: #ef4444;         /* Red 500 */

--text-primary: #f8fafc;         /* Slate 50 - Bright white */
--text-secondary: #e2e8f0;       /* Slate 200 */
--text-light: #cbd5e1;           /* Slate 300 */

--border-color: #475569;         /* Slate 600 */
--card-bg: #1e293b;              /* Slate 800 - Card background */
--bg-light: #334155;             /* Slate 700 */
--bg-body: #0f172a;              /* Slate 900 - Deep blue-black background */
```

### Gradient Definitions

#### Light Mode Gradients
```css
--primary-gradient: linear-gradient(135deg, #4f46e5 0%, #818cf8 100%);
--success-gradient: linear-gradient(135deg, #10b981 0%, #34d399 100%);
--warning-gradient: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
--danger-gradient: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
```

#### Dark Mode Gradients
```css
--primary-gradient: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%);
--success-gradient: linear-gradient(135deg, #059669 0%, #10b981 100%);
--warning-gradient: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
--danger-gradient: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
```

### Color Templates (Preset Themes)

The system includes 5 preset color templates for each mode:

**Light Mode Templates:**
- Ocean Breeze (Blue/Teal)
- Forest Walk (Green/Earth)
- Sunset Glow (Orange/Red)
- Lavender Dream (Purple/Lilac)
- Corporate Blue (Deep Blue)

**Dark Mode Templates:**
- Midnight Blue
- Matrix Code (Black/Green)
- Vampire Night (Purple/Pink)
- Coffee House (Brown/Gray)
- Cyberpunk (Neon Pink/Blue)

---

## Typography

### Font Family
```css
font-family: 'Inter', sans-serif;
```

### Font Sizes
- **Extra Large Headings**: `1.75rem` (28px)
- **Large Headings**: `1.5rem` (24px)
- **Medium Headings**: `1.25rem` (20px)
- **Section Titles**: `1.125rem` (18px)
- **Body Text**: `0.875rem` (14px)
- **Small Text**: `0.75rem` (12px)
- **Extra Small**: `0.7rem` (11.2px)

### Font Weights
- **Bold**: `700` (Headings, important text)
- **Semibold**: `600` (Subheadings, card titles)
- **Medium**: `500` (Buttons, labels)
- **Regular**: `400` (Body text)

### Text Colors by Context
- Primary text: `var(--text-primary)`
- Secondary text: `var(--text-secondary)`
- Muted/light text: `var(--text-light)`
- Links/interactive: `var(--primary-color)`

---

## Layout & Structure

### Main Layout Pattern
```
┌─────────────────────────────────────────┐
│  Sidebar (280px)  │  Main Content       │
│                   │                     │
│  - Logo/Title     │  - Mobile Header    │
│  - User Profile   │  - Content Area     │
│  - Navigation     │  - Cards/Grids      │
│  - Theme Toggle   │                     │
│  - Logout         │                     │
└─────────────────────────────────────────┘
```

### Sidebar Specifications
- **Width**: `280px`
- **Background**: White (light) / `var(--card-bg)` (dark)
- **Border**: `1px solid var(--border-color)` on right
- **Mobile**: Fixed position, slides in from left
- **Sections**:
  - Header with logo/title
  - User profile card
  - Navigation links
  - Footer with logout

### Main Content Area
- **Padding**: `2rem` (desktop), `1rem` (mobile)
- **Max Width**: `1200px` for content containers
- **Background**: `var(--bg-body)`

### Grid Layouts
```css
/* User/Lecture/Announcement Grids */
display: grid;
grid-template-columns: repeat(3, 1fr);  /* Desktop */
gap: 1.5rem;

/* Tablet (769px - 1024px) */
grid-template-columns: repeat(2, 1fr);

/* Mobile (< 768px) */
grid-template-columns: 1fr;
```

---

## Component Design

### Cards

#### Base Card Style
```css
background-color: white / var(--card-bg);
border-radius: 0.5rem;  /* var(--radius-lg) */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
padding: 1.5rem;
margin-bottom: 1.5rem;
```

#### Card Structure
```
┌──────────────────────────┐
│  Card Header             │ ← padding: 1.5rem, border-bottom
├──────────────────────────┤
│  Card Body               │ ← padding: 1.25rem, flex: 1
│                          │
├──────────────────────────┤
│  Card Footer             │ ← padding: 1rem, bg: var(--bg-light)
└──────────────────────────┘
```

#### Hover Effects
```css
.lecture-card:hover,
.announcement-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
```

### Buttons

#### Primary Button
```css
background: var(--primary-gradient);
color: white;
padding: 0.75rem 1.5rem;
border-radius: 0.375rem;
font-weight: 500;
transition: all 0.2s ease-in-out;
```

**Hover State:**
```css
background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-color) 100%);
```

**Dark Mode Hover:**
```css
background: linear-gradient(135deg, var(--vibrant-blue) 0%, var(--primary-light) 100%);
box-shadow: var(--shadow-md);
transform: translateY(-1px);
```

#### Secondary Button
```css
background-color: var(--bg-light);
color: var(--text-primary);
/* Same padding and border-radius as primary */
```

**Hover (Light):** `background-color: #e5e7eb`  
**Hover (Dark):** `background-color: var(--primary-dark); color: white`

#### Danger Button
```css
background-color: rgba(239, 68, 68, 0.1);
color: var(--danger-color);
```

**Hover:** `background-color: rgba(239, 68, 68, 0.2)`

### Tags/Badges

#### Lecture Tags
```css
font-size: 0.75rem;
font-weight: 500;
padding: 0.25rem 0.75rem;
border-radius: 9999px;  /* Fully rounded */
color: white;
box-shadow: var(--shadow);
```

**Subject Tag (First):**
```css
background: linear-gradient(135deg, #2563eb 0%, #60a5fa 100%);
```

**Stage Tag (Last):**
```css
background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%);
```

#### Role Badges
- **Admin**: `var(--primary-gradient)`
- **Teacher**: `var(--success-gradient)`
- **Student**: `var(--warning-gradient)`

#### Announcement Type Badges
- **Homework**: Blue gradient `#2563eb → #60a5fa`
- **Exam**: Red gradient `#dc2626 → #ef4444`
- **Event**: Purple gradient `#7c3aed → #a78bfa`
- **Other**: Gray gradient `#475569 → #94a3b8`

### Forms & Inputs

#### Input Fields
```css
width: 100%;
padding: 0.75rem;
border: 1px solid var(--border-color);
border-radius: 0.375rem;
font-size: 0.875rem;
transition: all 0.2s ease-in-out;
```

**Focus State:**
```css
border-color: var(--primary-color);
box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
outline: none;
```

#### Input with Icon
```css
/* Icon positioned absolutely */
.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-light);
}

/* Input with left padding for icon */
.input-field.pl-10 {
  padding-left: 2.5rem;
}
```

#### Select Dropdowns
```css
/* Same as input field, plus: */
appearance: none;
background-image: url("data:image/svg+xml,...");  /* Custom arrow */
background-repeat: no-repeat;
background-position: right 0.75rem center;
background-size: 1rem;
padding-right: 2.5rem;
```

### Navigation

#### Navigation Links
```css
display: flex;
align-items: center;
width: 100%;
padding: 0.75rem 1.5rem;
color: var(--text-secondary);
font-size: 0.875rem;
transition: all 0.2s ease-in-out;
```

**Icon Spacing:**
```css
svg {
  margin-right: 0.75rem;
}
```

**Hover/Active State:**
```css
background-color: var(--bg-light);
color: var(--primary-color);
```

### Notifications

#### Notification Badge
```css
position: absolute;
top: -5px;
right: -5px;
background-color: var(--danger-color);
color: white;
font-size: 0.75rem;
font-weight: 600;
width: 18px;
height: 18px;
border-radius: 50%;
```

#### Notification Dropdown
```css
position: absolute;
top: 100%;
right: 0;
width: 320px;
background-color: white / var(--card-bg);
border-radius: var(--radius-lg);
box-shadow: var(--shadow-lg);
margin-top: 0.5rem;
animation: fadeIn 0.2s ease;
```

**Animation:**
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

#### Notification Item
```css
padding: 1rem;
border-bottom: 1px solid var(--border-color);
cursor: pointer;
transition: var(--transition);
```

**Unread State:**
```css
background-color: rgba(79, 70, 229, 0.05);  /* Light */
background-color: rgba(139, 92, 246, 0.15);  /* Dark */
```

**Hover:**
```css
background-color: var(--bg-light);
```

---

## Spacing & Sizing

### Border Radius
```css
--radius: 0.375rem;      /* 6px - Small elements */
--radius-lg: 0.5rem;     /* 8px - Cards, modals */
```

### Spacing Scale
- **0.25rem** (4px): Tight spacing, badge padding
- **0.5rem** (8px): Small gaps, tag spacing
- **0.75rem** (12px): Input padding, button padding
- **1rem** (16px): Standard spacing, margins
- **1.25rem** (20px): Card body padding
- **1.5rem** (24px): Card padding, section margins
- **2rem** (32px): Large spacing, main content padding

### Component Sizing
- **Avatar Small**: `40px × 40px`
- **Avatar Large**: `48px × 48px`
- **Avatar Creator**: `60px × 60px`
- **Icon Button**: `40px × 40px`
- **Notification Badge**: `18px × 18px`
- **Sidebar Width**: `280px`
- **Mobile Header Height**: `60px`

---

## Shadows & Effects

### Shadow Levels
```css
--shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

**Dark Mode Shadows:**
```css
/* Increase opacity to 0.3 for better visibility */
--shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
```

### Glassmorphism Effect
Cards maintain a clean, flat design without glassmorphism. Background colors are solid with subtle shadows for depth.

---

## Responsive Design

### Breakpoints
- **Mobile**: `< 768px`
- **Tablet**: `769px - 1024px`
- **Desktop**: `> 1024px`

### Mobile Adaptations (< 768px)

#### Layout Changes
```css
/* Show mobile header */
.mobile-header {
  display: flex;
  height: 60px;
  position: fixed;
  top: 0;
  width: 100%;
}

/* Hide sidebar by default */
.sidebar {
  position: fixed;
  transform: translateX(-100%);
}

/* Sidebar open state */
.sidebar-open {
  transform: translateX(0);
}

/* Main content with top margin */
.main-content {
  padding: 1rem;
  margin-top: 60px;
}
```

#### Grid Adjustments
```css
.user-grid,
.lecture-grid,
.announcement-grid {
  grid-template-columns: 1fr;  /* Single column */
}
```

#### Search & Filter
```css
.search-filter-container {
  flex-direction: column;  /* Stack vertically */
}
```

### Tablet Adaptations (769px - 1024px)
```css
.user-grid,
.lecture-grid,
.announcement-grid {
  grid-template-columns: repeat(2, 1fr);  /* Two columns */
}
```

---

## Animations & Transitions

### Global Transition
```css
--transition: all 0.2s ease-in-out;
```

### Common Animations

#### Hover Lift
```css
.card:hover {
  transform: translateY(-2px);
}
```

#### Button Hover
```css
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
```

#### Loading Spinner
```css
.loading-spinner {
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

#### Tag Hover
```css
.lecture-tag:hover {
  transform: scale(1.05);
}
```

#### Theme Transition
```css
.theme-transition {
  transition-property: color, background-color, border-color;
  transition-duration: 300ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## Design Principles

### 1. **Consistency**
- Use CSS variables for all colors, spacing, and sizing
- Maintain consistent border-radius across components
- Apply uniform shadow levels based on hierarchy

### 2. **Hierarchy**
- Primary actions use gradient backgrounds
- Secondary actions use subtle backgrounds
- Danger actions use red color scheme
- Text hierarchy: primary → secondary → light

### 3. **Accessibility**
- High contrast ratios in both light and dark modes
- Focus states with visible outlines
- Sufficient spacing for touch targets (minimum 40px)
- Semantic HTML structure

### 4. **Responsiveness**
- Mobile-first approach
- Flexible grids that adapt to screen size
- Touch-friendly interface on mobile
- Collapsible sidebar on small screens

### 5. **Visual Feedback**
- Hover states on interactive elements
- Loading states for async operations
- Success/error messages with appropriate colors
- Smooth transitions for state changes

### 6. **Dark Mode Support**
- Separate color palettes for light/dark modes
- Increased shadow opacity in dark mode
- Brighter accent colors for visibility
- Smooth theme transitions

---

## Implementation Checklist

When implementing this design in a new project:

- [ ] Set up CSS variables for colors (light and dark modes)
- [ ] Import Inter font from Google Fonts
- [ ] Define spacing and sizing variables
- [ ] Create base card component styles
- [ ] Implement button variants (primary, secondary, danger)
- [ ] Set up grid layouts with responsive breakpoints
- [ ] Add form input styles with focus states
- [ ] Create navigation component with active states
- [ ] Implement tag/badge components
- [ ] Add shadow levels
- [ ] Set up transition variables
- [ ] Create mobile header and sidebar toggle
- [ ] Test responsive behavior at all breakpoints
- [ ] Verify dark mode color contrast
- [ ] Add loading and error states
- [ ] Implement notification system
- [ ] Test accessibility (keyboard navigation, screen readers)

---

## Color Customization System

The LMS includes a built-in color customization feature that allows users to:
- Choose from preset color templates
- Customize individual colors (primary, background, text, etc.)
- Save preferences separately for light and dark modes
- Preview changes in real-time
- Reset to default colors

This is managed through:
- `ColorSettingsManager` utility class
- `ColorCustomization` React component
- LocalStorage for persistence
- CSS variable updates for live preview

---

## Additional Notes

### Authentication UI
- Clean, centered login/signup forms
- Gradient logo circle
- Maximum width of 400px
- Subtle background gradient

### PDF Viewer
- Full-height viewer with controls
- Navigation buttons for pages
- Zoom controls
- Responsive height adjustments

### About Page
- Banner image header (250px height)
- Gradient title text
- Creator card with avatar
- Feature list with bullet points

### File Upload
- Dashed border dropzone
- Visual feedback on file selection
- Progress bar with gradient fill
- Success/error messages

---

**End of Design System Guide**

Use this document as a reference to maintain design consistency or replicate the design system in other projects. All measurements, colors, and patterns are production-ready and tested across devices.
