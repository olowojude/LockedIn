// components/ThemeToggle.jsx

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const ThemeToggle = ({ className = "" }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-14 h-8 rounded-full transition-all duration-500 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-opacity-30 ${
        isDarkMode 
          ? 'bg-gradient-to-r from-gray-700 to-gray-800 focus:ring-gray-400' 
          : 'bg-gradient-to-r from-blue-400 to-indigo-500 focus:ring-blue-300'
      } ${className}`}
      title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      {/* Track background glow */}
      <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
        isDarkMode 
          ? 'shadow-inner shadow-gray-900/50' 
          : 'shadow-inner shadow-blue-500/20'
      }`} />
      
      {/* Sliding indicator */}
      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-500 ease-in-out transform shadow-lg ${
        isDarkMode ? 'translate-x-7' : 'translate-x-1'
      }`}>
        {/* Icon container */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Sun icon */}
          <Sun 
            className={`w-3 h-3 text-yellow-500 absolute transition-all duration-500 ${
              isDarkMode 
                ? 'opacity-0 scale-50 rotate-180' 
                : 'opacity-100 scale-100 rotate-0'
            }`} 
          />
          {/* Moon icon */}
          <Moon 
            className={`w-3 h-3 text-slate-600 absolute transition-all duration-500 ${
              isDarkMode 
                ? 'opacity-100 scale-100 rotate-0' 
                : 'opacity-0 scale-50 rotate-180'
            }`} 
          />
        </div>
        
        {/* Subtle inner glow */}
        <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
          isDarkMode 
            ? 'shadow-inner shadow-gray-300/30' 
            : 'shadow-inner shadow-yellow-200/40'
        }`} />
      </div>
      
      {/* Ambient glow effect */}
      <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
        isDarkMode 
          ? 'shadow-lg shadow-gray-600/20' 
          : 'shadow-lg shadow-blue-400/30'
      }`} />
      
      {/* Background pattern */}
      <div className="absolute inset-0 rounded-full opacity-20">
        <div className="absolute inset-1 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
      
      {/* Floating particles effect on hover */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 rounded-full transition-all duration-1000 opacity-0 group-hover:opacity-60 ${
              isDarkMode ? 'bg-gray-300' : 'bg-white'
            }`}
            style={{
              left: `${20 + i * 25}%`,
              top: `${30 + i * 10}%`,
              animationDelay: `${i * 0.2}s`
            }}
          />
        ))}
      </div>
    </button>
  );
};

export default ThemeToggle;