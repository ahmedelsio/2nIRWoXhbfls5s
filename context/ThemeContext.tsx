import React, { createContext, useContext, useState, useEffect } from 'react';
import { DesignSystemId, DesignSystemOption } from '../types';
import { DESIGN_SYSTEM_OPTIONS } from '../data/designSystems';

interface ThemeContextType {
  theme: DesignSystemId;
  setTheme: (theme: DesignSystemId) => void;
  activeOption: DesignSystemOption;
  availableOptions: DesignSystemOption[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'ironmate_design_system';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<DesignSystemId>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as DesignSystemId;
      if (saved && DESIGN_SYSTEM_OPTIONS.some((opt) => opt.id === saved)) {
        return saved;
      }
    }
    // Default to Volt High-Vis as the recommended athletic upgrade, or keep amber
    return 'volt';
  });

  const setTheme = (newTheme: DesignSystemId) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const activeOption = DESIGN_SYSTEM_OPTIONS.find((opt) => opt.id === theme) || DESIGN_SYSTEM_OPTIONS[0];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        activeOption,
        availableOptions: DESIGN_SYSTEM_OPTIONS,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
