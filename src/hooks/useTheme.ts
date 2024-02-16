import { useSettings } from './useSettings';
import { useSystemTheme } from './useSystemTheme';

type Theme = 'light' | 'dark';

/**
 * Returns the actual theme being displayed (eg "light" or "dark")
 * regardless of whether that's by system theme or direct setting.
 */
const useTheme = (): Theme => {
  const { themeMode } = useSettings();
  const systemTheme = useSystemTheme();

  const darkMode = themeMode === 'dark' || (themeMode === 'system' && systemTheme === 'dark');
  return darkMode ? 'dark' : 'light';
};

export { useTheme };
