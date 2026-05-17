'use client';

import { useEffect } from 'react';
import { useThemeStore } from './theme-store';

// ========== Component ==========

export function ThemeInitializer() {
  const theme = useThemeStore(state => state.theme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return null;
}
