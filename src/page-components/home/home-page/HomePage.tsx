'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useAuthSessionStore } from '@/domains/auth/model/stores/auth-session-store';
import { Button } from '@/shared/ui';

// ========== Component ==========

export function HomePage() {
  // ========== Hooks ==========

  const t = useTranslations('Home');
  const userRoleName = useAuthSessionStore(state => state.user?.roleName);

  // ========== Render ==========

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-primary">{t('title')}</h1>
        <p className="mt-1 text-sm text-muted">{t('subtitle')}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/catalog">
          <Button type="button">{t('links.catalog')}</Button>
        </Link>
        <Link href="/cart">
          <Button type="button" variant="secondary">
            {t('links.cart')}
          </Button>
        </Link>
        <Link href="/orders">
          <Button type="button" variant="secondary">
            {t('links.orders')}
          </Button>
        </Link>
        {userRoleName === 'admin' ? (
          <Link href="/admin">
            <Button type="button" variant="secondary">
              {t('links.admin')}
            </Button>
          </Link>
        ) : null}
      </div>
    </section>
  );
}
