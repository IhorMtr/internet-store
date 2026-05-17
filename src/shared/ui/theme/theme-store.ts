'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_THEME, THEME_STORAGE_KEY, type ThemeName } from './theme-constants';

// ========== Types ==========

type ThemeState = {
  theme: ThemeName;
  setTheme(theme: ThemeName): void;
};

// ========== Helpers ==========

function isThemeName(value: unknown): value is ThemeName {
  return value === 'shopcore-light' || value === 'shopcore-dark';
}

function applyTheme(theme: ThemeName): void {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.dataset.theme = theme;
}

// ========== Store ==========

export const useThemeStore = create<ThemeState>()(
  persist(
    set => ({
      theme: DEFAULT_THEME,

      setTheme(theme) {
        applyTheme(theme);
        set({ theme });
      },
    }),
    {
      name: THEME_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      merge: (persistedState, currentState) => {
        const persistedTheme = (persistedState as Partial<ThemeState> | undefined)?.theme;

        return {
          ...currentState,
          theme: isThemeName(persistedTheme) ? persistedTheme : currentState.theme,
        };
      },
      onRehydrateStorage: () => state => {
        applyTheme(state?.theme ?? DEFAULT_THEME);
      },
    }
  )
);

// ========== Hook ==========

export function useTheme() {
  const theme = useThemeStore(state => state.theme);
  const setTheme = useThemeStore(state => state.setTheme);

  // ========== Return ==========

  return {
    setTheme,
    theme,
  };
}
