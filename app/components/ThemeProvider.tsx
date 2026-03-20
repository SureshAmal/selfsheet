'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeType = 'light' | 'black' | 'sunset' | 'nightown' | 'sea';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children, initialTheme = 'light' }: { children: React.ReactNode, initialTheme?: ThemeType }) {
  const [theme, setThemeState] = useState<ThemeType>(initialTheme);

  useEffect(() => {
    // Sync theme with html data-theme attribute
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    // You can also call a Server Action here to persist the theme in the DB for the user
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
