import { createContext, useContext } from 'react';
import { Theme } from '../hooks/useTheme';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggleTheme: () => undefined,
  setTheme: () => undefined,
});

export function useThemeContext(): ThemeContextValue {
  return useContext(ThemeContext);
}
