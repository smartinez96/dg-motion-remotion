import React, { createContext, useContext } from 'react';
import type { DGTheme } from './themes';
import { darkTheme } from './themes';

const ThemeContext = createContext<DGTheme>(darkTheme);

export const ThemeProvider: React.FC<{ theme: DGTheme; children: React.ReactNode }> = ({
  theme,
  children,
}) => <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;

export const useTheme = (): DGTheme => useContext(ThemeContext);
