'use client';

import { useTranslations } from 'next-intl';
import type { ThemeName } from './theme-constants';
import { useTheme } from './theme-store';
import { Button } from '@/shared/ui/button';

// ===================== CONSTANTS =====================

const themes: Array<{ labelKey: 'light' | 'dark'; value: ThemeName }> = [
  { labelKey: 'light', value: 'shopcore-light' },
  { labelKey: 'dark', value: 'shopcore-dark' },
];

// ===================== COMPONENT =====================

export function ThemeToggle() {
  // ===================== HOOKS =====================

  const t = useTranslations('themeSwitcher');
  const { setTheme, theme } = useTheme();

  // ===================== RENDER =====================

  return (
    <div className="grid w-full grid-cols-2 rounded-md border bg-surface p-1 shadow-soft">
      {themes.map(item => (
        <Button
          key={item.value}
          type="button"
          size="sm"
          variant="ghost"
          aria-pressed={theme === item.value}
          onClick={() => setTheme(item.value)}
          className="w-full rounded-sm text-center text-muted hover:text-primary aria-pressed:bg-accent aria-pressed:text-accent-contrast"
        >
          {t(item.labelKey)}
        </Button>
      ))}
    </div>
  );
}
