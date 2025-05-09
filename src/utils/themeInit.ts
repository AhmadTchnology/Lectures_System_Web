// Theme initialization script

// Function to initialize theme based on localStorage or system preference
const initializeTheme = (): void => {
  // Check if theme is stored in localStorage
  const savedTheme = localStorage.getItem('theme');
  
  if (savedTheme) {
    // Apply saved theme
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = prefersDark ? 'dark' : 'light';
    
    // Set theme attribute and save to localStorage
    document.documentElement.setAttribute('data-theme', initialTheme);
    localStorage.setItem('theme', initialTheme);
  }
  
  // Add theme-transition class after a short delay to enable smooth transitions
  // after the initial theme is applied
  setTimeout(() => {
    document.documentElement.classList.add('theme-transition');
  }, 100);
};

// Run theme initialization
initializeTheme();

export default initializeTheme;