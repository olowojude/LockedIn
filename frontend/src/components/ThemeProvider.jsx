// components/ThemeProvider.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('lockedInTheme');
    return savedTheme === 'dark';
  });

  useEffect(() => {
    // Save theme preference to localStorage
    localStorage.setItem('lockedInTheme', isDarkMode ? 'dark' : 'light');
    
    // Update document class for any CSS transitions
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const theme = {
    isDarkMode,
    toggleTheme,
    
    // Background gradients
    bg: {
      primary: isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-black to-gray-800' 
        : 'bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50',
      secondary: isDarkMode 
        ? 'bg-gradient-to-tr from-gray-800/40 via-transparent to-gray-700/30' 
        : 'bg-gradient-to-tr from-blue-50/40 via-transparent to-purple-50/30',
      card: isDarkMode 
        ? 'bg-gray-800/60 backdrop-blur-xl border border-gray-700/50' 
        : 'bg-white/60 backdrop-blur-xl border border-gray-200/50',
      input: isDarkMode 
        ? 'bg-gray-700/80 border-gray-600/60' 
        : 'bg-gray-50/80 border-gray-200/60',
      button: isDarkMode 
        ? 'bg-gray-700/80 hover:bg-gray-600/80' 
        : 'bg-gray-100 hover:bg-gray-200',
      accent: isDarkMode 
        ? 'bg-gradient-to-r from-slate-600 to-gray-700' 
        : 'bg-gradient-to-r from-indigo-500 to-purple-600'
    },
    
    // Text colors
    text: {
      primary: isDarkMode ? 'text-white' : 'text-gray-800',
      secondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
      muted: isDarkMode ? 'text-gray-400' : 'text-gray-500',
      accent: isDarkMode ? 'text-blue-400' : 'text-indigo-500'
    },
    
    // Overlay effects
    overlay: {
      orb1: isDarkMode 
        ? 'bg-gradient-to-br from-gray-700/30 via-gray-800/20 to-transparent' 
        : 'bg-gradient-to-br from-blue-100/30 via-indigo-50/20 to-transparent',
      orb2: isDarkMode 
        ? 'bg-gradient-to-bl from-slate-700/25 via-gray-900/15 to-transparent' 
        : 'bg-gradient-to-bl from-purple-100/25 via-pink-50/15 to-transparent',
      orb3: isDarkMode 
        ? 'bg-gradient-to-tr from-gray-600/20 via-slate-800/10 to-transparent' 
        : 'bg-gradient-to-tr from-emerald-100/20 via-teal-50/10 to-transparent',
      orb4: isDarkMode 
        ? 'bg-gradient-to-r from-gray-700/15 via-slate-900/10 to-transparent' 
        : 'bg-gradient-to-r from-orange-100/15 via-yellow-50/10 to-transparent'
    },
    
    // Status colors (maintain vibrant colors in both themes)
    status: {
      success: isDarkMode ? 'bg-green-600' : 'bg-green-500',
      warning: isDarkMode ? 'bg-yellow-600' : 'bg-yellow-500',
      error: isDarkMode ? 'bg-red-600' : 'bg-red-500',
      info: isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
    },
    
    // Particle colors for floating animation
    particles: isDarkMode 
      ? ['bg-gray-600', 'bg-slate-600', 'bg-zinc-600', 'bg-stone-600', 'bg-neutral-600']
      : ['bg-blue-400', 'bg-purple-400', 'bg-pink-400', 'bg-emerald-400', 'bg-orange-400']
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};