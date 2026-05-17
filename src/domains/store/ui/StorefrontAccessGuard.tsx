'use client';

import { useEffect, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useAuthSessionStore } from '@/domains/auth/model/stores/auth-session-store';
import { Button } from '@/shared/ui/button';
import { Link } from '@/i18n/navigation';

// ========== Types ==========

type StorefrontAccessGuardProps = {
  children: ReactNode;
};

// ========== Component ==========

export function StorefrontAccessGuard({ children }: StorefrontAccessGuardProps) {
  const router = useRouter();
  const t = useTranslations('StorefrontAccess');
  const status = useAuthSessionStore(state => state.status);
  const roleName = useAuthSessionStore(state => state.user?.roleName);

  const isLoading = status === 'checking';
  const isAllowed = status === 'authenticated' && roleName === 'user';
  const isForbidden = status === 'authenticated' && roleName === 'admin';

  useEffect(() => {
    if (!isForbidden) {
      return;
    }

    router.replace('/admin');
  }, [isForbidden, router]);

  if (isLoading) {
    return <div className="rounded-lg border bg-surface p-6 text-sm text-muted shadow-soft">{t('loading')}</div>;
  }

  if (isForbidden) {
    return (
      <section className="rounded-lg border bg-surface p-6 shadow-soft">
        <h1 className="text-lg font-semibold text-primary">{t('forbiddenTitle')}</h1>
        <p className="mt-2 text-sm text-muted">{t('forbiddenDescription')}</p>
        <Link href="/admin" className="mt-4 inline-flex">
          <Button type="button">{t('goToAdmin')}</Button>
        </Link>
      </section>
    );
  }

  if (!isAllowed) {
    return null;
  }

  return <>{children}</>;
}
