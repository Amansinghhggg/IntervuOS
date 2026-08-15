import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const ThemeContext = createContext({
  employerTheme: 'dark',
  toggleEmployerTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export default function ThemeProvider({ children }) {
  const location = useLocation();
  const [employerTheme, setEmployerTheme] = useState(() => {
    return localStorage.getItem('employer_theme') || 'dark';
  });

  const toggleEmployerTheme = () => {
    const nextTheme = employerTheme === 'dark' ? 'light' : 'dark';
    setEmployerTheme(nextTheme);
    localStorage.setItem('employer_theme', nextTheme);
  };

  useEffect(() => {
    const isEmployerRoute = location.pathname.startsWith('/employer');
    const isCandidateRoute = location.pathname.startsWith('/candidate');

    // Reset theme classes on document element
    document.documentElement.classList.remove('theme-employer-light', 'theme-candidate');

    if (isEmployerRoute && employerTheme === 'light') {
      document.documentElement.classList.add('theme-employer-light');
    } else if (isCandidateRoute) {
      document.documentElement.classList.add('theme-candidate');
    }
  }, [location.pathname, employerTheme]);

  return (
    <ThemeContext.Provider value={{ employerTheme, toggleEmployerTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

