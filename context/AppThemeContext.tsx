import React, { createContext, useContext, type ReactNode } from 'react';
import { Colors, type ThemeColor } from '../constants/theme';
import { useColorScheme } from '../hooks/use-color-scheme';

export type ThemeColors = Record<ThemeColor, string>;
const AppThemeContext = createContext<ThemeColors | undefined>(undefined);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const scheme = useColorScheme();
  return <AppThemeContext.Provider value={Colors[scheme]}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme(): ThemeColors {
  const theme = useContext(AppThemeContext);
  if (!theme) throw new Error('useAppTheme must be used within AppThemeProvider');
  return theme;
}