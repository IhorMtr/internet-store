"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  type ThemeName,
} from "./theme-constants";

// ===================== HELPERS =====================

function isThemeName(value: string | null | undefined): value is ThemeName {
  return value === "shopcore-light" || value === "shopcore-dark";
}

// ===================== STORE =====================

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

// ===================== HOOK =====================

export function useTheme() {
  // ===================== STATE =====================

  const [theme, setThemeState] = useState<ThemeName>(() => themeStorage.get());

  // ===================== EFFECTS =====================

  useEffect(() => {
    themeStorage.apply(theme);
  }, [theme]);

  // ===================== ACTIONS =====================

  function setTheme(nextTheme: ThemeName) {
    themeStorage.set(nextTheme);
    setThemeState(nextTheme);
  }

  // ===================== RETURN =====================

  return {
    setTheme,
    theme,
  };
}
