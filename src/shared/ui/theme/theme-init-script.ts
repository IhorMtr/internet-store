import { DEFAULT_THEME, THEME_STORAGE_KEY } from './theme-constants';

// ========== Helpers ==========

// This script runs before React hydration to prevent a light-theme flash.
export function getThemeInitScript(): string {
  return `(() => {
  try {
    const key = ${JSON.stringify(THEME_STORAGE_KEY)};
    const fallback = ${JSON.stringify(DEFAULT_THEME)};
    const persisted = window.localStorage.getItem(key);
    const parsed = persisted ? JSON.parse(persisted) : null;
    const persistedTheme = parsed && typeof parsed === 'object' ? parsed.state?.theme : persisted;
    const theme = persistedTheme === 'shopcore-dark' || persistedTheme === 'shopcore-light' ? persistedTheme : fallback;

    document.documentElement.dataset.theme = theme;
  } catch {
    document.documentElement.dataset.theme = ${JSON.stringify(DEFAULT_THEME)};
  }
})();`;
}
