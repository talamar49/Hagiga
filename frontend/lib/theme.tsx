import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
const ThemeContext = createContext({ theme: 'light' as Theme, setTheme: (t: Theme) => {} });

export const ThemeProvider = ({ children }: any) => {
  const [theme, setTheme] = useState<Theme>('light');
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    if (stored === 'dark' || stored === 'light') setTheme(stored as Theme);
  }, []);
  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeProvider;
