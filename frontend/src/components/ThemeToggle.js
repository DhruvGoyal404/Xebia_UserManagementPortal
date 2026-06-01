import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      className="btn btn-sm theme-toggle"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
};

export default ThemeToggle;
