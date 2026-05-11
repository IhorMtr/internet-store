'use client';

import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/lib/cn';
import { useAdminLayout } from '@/domains/admin/model/hooks/use-admin-layout';

// ========== Types ==========

type AdminLayoutProps = {
  children: React.ReactNode;
};

// ========== Component ==========

export function AdminLayout({ children }: AdminLayoutProps) {
  const { isAllowed, isForbidden, isLoading, navigationItems, pathname, t } = useAdminLayout();

  if (isLoading) {
    return (
      <section className="rounded-xl border bg-surface p-6 shadow-soft">
        <p className="text-sm text-muted">{t('loading')}</p>
      </section>
    );
  }

  if (isForbidden) {
    return (
      <section className="rounded-xl border bg-surface p-6 shadow-soft">
        <p className="text-sm text-muted">{t('accessDenied')}</p>
      </section>
    );
  }

  if (!isAllowed) {
    return null;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="h-fit rounded-xl border bg-surface p-3 shadow-soft lg:sticky lg:top-20">
        <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted">{t('navigationTitle')}</p>

        <nav className="flex flex-col gap-1">
          {navigationItems.map(item => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-accent text-accent-contrast shadow-soft' : 'text-primary hover:bg-surface-raised'
                )}
              >
                {t(`nav.${item.key}`)}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0">{children}</div>
    </div>
  );
}
