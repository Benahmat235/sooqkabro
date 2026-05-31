import { useEffect } from 'react';

export function useTheme() {
  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applySystemTheme = () => {
      const systemTheme = mediaQuery.matches ? 'dark' : 'light';
      root.classList.remove('light', 'dark');
      root.classList.add(systemTheme);
      root.style.colorScheme = systemTheme;
    };

    applySystemTheme();
    mediaQuery.addEventListener('change', applySystemTheme);

    return () => mediaQuery.removeEventListener('change', applySystemTheme);
  }, []);

  return { theme: 'system' as const };
}
