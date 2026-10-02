import { useEffect, useState } from 'react';

export type AdminTheme = 'light' | 'dark';

const ADMIN_THEME_STORAGE_KEY = 'zanzirangi_admin_theme';

const readStoredTheme = (): AdminTheme => {
  try {
    const stored = localStorage.getItem(ADMIN_THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // Storage unavailable (private mode) — fall back to default
  }
  return 'dark';
};

/**
 * Admin-only theme, stored separately from the public site's theme.
 * Apply the result as `data-admin-theme` on an element with the `adm-root` class.
 */
export const useAdminTheme = () => {
  const [theme, setTheme] = useState<AdminTheme>(readStoredTheme);

  useEffect(() => {
    try {
      localStorage.setItem(ADMIN_THEME_STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  // The public site's `html.dark` overrides in index.css use !important on inputs,
  // headings and bg-white, which would leak into the admin. Suspend them while mounted.
  useEffect(() => {
    const root = document.documentElement;
    const hadDarkClass = root.classList.contains('dark');
    root.classList.remove('dark');
    return () => {
      if (hadDarkClass) root.classList.add('dark');
    };
  }, []);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return { theme, toggleTheme };
};
