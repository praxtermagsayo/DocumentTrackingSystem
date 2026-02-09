const THEME_STORAGE_KEY = 'doctrack_theme';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export function getSystemPrefersDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function getResolvedTheme(theme: ThemeMode): ResolvedTheme {
  if (theme === 'system') return getSystemPrefersDark() ? 'dark' : 'light';
  return theme;
}

export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'dark' || stored === 'light' || stored === 'system') return stored;
  return 'light';
}

export function applyThemeToDocument(theme: ThemeMode): void {
  if (typeof document === 'undefined') return;
  const resolved = getResolvedTheme(theme);
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export { THEME_STORAGE_KEY };
