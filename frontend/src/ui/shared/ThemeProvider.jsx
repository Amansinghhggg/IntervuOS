import React, { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext({
  theme: 'dark',
});

export const useTheme = () => useContext(ThemeContext);

export default function ThemeProvider({ children }) {
  useEffect(() => {
    // Enforce dark theme
    document.documentElement.classList.remove('theme-employer-light');
    document.body.classList.remove('theme-employer-light');
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.setAttribute('data-theme', 'dark');
    try {
      localStorage.removeItem('employer_theme');
    } catch {
      // ignore
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}
