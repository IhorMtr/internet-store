'use client';

import { useTranslations } from 'next-intl';
import { AuthPreferences } from '@/domains/auth/ui/auth-preferences';
import { LoginForm } from '@/domains/auth/ui/LoginForm';

// ========== Component ==========

export function LoginPage() {
  // ========== Hooks ==========

  const headerT = useTranslations('header');
  const t = useTranslations('auth.login');

  // ========== Render ==========

  return (
    <div className="flex min-h-full items-center justify-center bg-canvas px-4 py-10 text-primary">
      <AuthPreferences />

      <section className="w-full max-w-md rounded-lg border bg-surface p-5 shadow-soft">
        <div>
          <p className="text-caption font-semibold uppercase text-muted">{headerT('brand')}</p>
          <h1 className="mt-1 text-heading font-semibold">{t('title')}</h1>
        </div>

        <LoginForm />
      </section>
    </div>
  );
}
