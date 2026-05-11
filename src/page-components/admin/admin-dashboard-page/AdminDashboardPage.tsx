'use client';

import { Link } from '@/i18n/navigation';
import { useAdminDashboardPage } from '@/page-components/admin/admin-dashboard-page/use-admin-dashboard-page';

// ========== Component ==========

export function AdminDashboardPage() {
  const { cards, commonT, isLoading, quickLinks, t } = useAdminDashboardPage();

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-primary">{t('title')}</h1>
        <p className="mt-1 text-sm text-muted">{t('subtitle')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(card => (
          <article key={card.key} className="rounded-xl border bg-surface p-4 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">{t(`stats.${card.key}`)}</p>
            <p className="mt-2 text-3xl font-semibold text-primary">{isLoading ? 0 : card.value}</p>
          </article>
        ))}
      </div>

      <section className="rounded-xl border bg-surface p-4 shadow-soft">
        <h2 className="text-lg font-semibold text-primary">{t('quickActionsTitle')}</h2>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {quickLinks.map(item => (
            <Link
              key={item.key}
              href={item.href}
              className="rounded-lg border border-border/80 bg-surface-raised px-4 py-3 text-sm font-medium text-primary transition-colors hover:bg-surface"
            >
              {commonT(`nav.${item.key}`)}
            </Link>
          ))}
        </div>
      </section>
    </section>
  );
}
