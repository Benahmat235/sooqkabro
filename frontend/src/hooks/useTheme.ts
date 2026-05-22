import { useEffect } from 'react';

export function useTheme() {
  useEffect(() => {
    const root = window.document.documentElement;

    const applySystemTheme = () => {
      root.classList.remove('light', 'dark');
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    };

    localStorage.removeItem('theme');
    applySystemTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', applySystemTheme);

    return () => mediaQuery.removeEventListener('change', applySystemTheme);
  }, []);

  return { theme: 'system' as const };
}
