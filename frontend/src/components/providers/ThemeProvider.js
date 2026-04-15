'use client';

import { createContext, useContext, useEffect } from 'react';
import { useChatStore } from '@/store/chatStore';

const ThemeContext = createContext({ isDarkMode: false, toggleDarkMode: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }) {
  const { isDarkMode, toggleDarkMode } = useChatStore();

  useEffect(() => {
    const saved = localStorage.getItem('chatflow-dark-mode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldDark = saved !== null ? saved === 'true' : prefersDark;
    if (shouldDark && !isDarkMode) {
      toggleDarkMode();
    }
    if (shouldDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('chatflow-dark-mode', String(isDarkMode));
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
