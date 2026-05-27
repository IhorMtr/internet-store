// ========== Constants ==========

export const DEFAULT_THEME = 'shopcore-light';
export const THEME_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
export const THEME_STORAGE_KEY = 'shopcore-theme';

// ========== Types ==========

export type ThemeName = 'shopcore-light' | 'shopcore-dark';

// ========== Helpers ==========

export function isThemeName(value: unknown): value is ThemeName {
  return value === 'shopcore-light' || value === 'shopcore-dark';
}
