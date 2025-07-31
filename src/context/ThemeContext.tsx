// src/context/ThemeContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

// Define the shape of the context value
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// Create the context with a default value to avoid undefined errors
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Initialize state to null, so we can determine the theme on the client
  const [theme, setTheme] = useState<Theme | null>(null);

  // On mount, read the theme from localStorage or system preference
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    // Set the theme based on stored preference, system preference, or default to 'light'
    setTheme(storedTheme || (prefersDark ? 'dark' : 'light'));
  }, []);

  // Whenever the theme state changes, update the DOM and localStorage
  useEffect(() => {
    if (theme) {
      const root = window.document.documentElement;
      // Clear existing theme classes and add the current one
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  // Function to toggle the theme
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Provide a default theme value ('light') during server-side rendering and initial client render
  // This prevents the app from breaking before the theme is determined from localStorage
  const value = {
    theme: theme || 'light',
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
