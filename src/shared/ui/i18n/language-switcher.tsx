'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

import { routing, type Locale } from '@/i18n/routing';
import { cn } from '@/shared/lib/cn';
import { Link, usePathname } from '@/i18n/navigation';

// ========== Constants ==========
const localeLabels: Record<Locale, 'ukrainian' | 'english'> = {
  uk: 'ukrainian',
  en: 'english',
};

// ========== Component ==========
export function LanguageSwitcher() {
  // ========== Hooks ==========

  const t = useTranslations('common.texts');
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ========== Query Params ==========

  const query = Object.fromEntries(searchParams.entries());

  // ========== Render ==========

  return (
    <div aria-label={t('language')} className="grid w-full grid-cols-2 rounded-md border bg-surface p-1 shadow-soft">
      {routing.locales.map(item => {
        const isActive = item === locale;

        return (
          <Link
            key={item}
            href={{ pathname, query }}
            locale={item}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'ds-transition flex w-full items-center justify-center rounded-sm px-3 py-1 text-center text-caption font-medium hover:text-primary',
              isActive ? 'bg-accent text-accent-contrast' : 'text-primary'
            )}
          >
            {t(localeLabels[item])}
          </Link>
        );
      })}
    </div>
  );
}
