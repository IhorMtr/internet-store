"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  type ThemeName,
} from "./theme-constants";

// ========== Helpers ==========

function isThemeName(value: string | null | undefined): value is ThemeName {
  return value === "shopcore-light" || value === "shopcore-dark";
}

// ========== Store ==========

export const themeStorage = {
  get(): ThemeName {
    if (typeof window === "undefined") {
      return DEFAULT_THEME;
    }

    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

    return isThemeName(storedTheme) ? storedTheme : DEFAULT_THEME;
  },

  set(theme: ThemeName): void {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  },

  apply(theme: ThemeName): void {
    document.documentElement.dataset.theme = theme;
  },
};

// ========== Hook ==========

export function useTheme() {
  // ========== State ==========

  const [theme, setThemeState] = useState<ThemeName>(() => themeStorage.get());

  // ========== Effects ==========

  useEffect(() => {
    themeStorage.apply(theme);
  }, [theme]);

  // ========== Actions ==========

  function setTheme(nextTheme: ThemeName) {
    themeStorage.set(nextTheme);
    setThemeState(nextTheme);
  }

  // ========== Return ==========

  return {
    setTheme,
    theme,
  };
}
