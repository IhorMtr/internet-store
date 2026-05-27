'use client';

import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useHomePage, type HomePageAction } from '@/page-components/home/home-page/use-home-page';
import { cn } from '@/shared/lib/cn';

// ========== Types ==========

type LinkCardProps = {
  action: HomePageAction;
  cta: string;
};

// ========== Components ==========

function LinkCard({ action, cta }: LinkCardProps) {
  const Icon = action.icon;

  return (
    <Link
      href={action.href}
      className="group ds-transition flex min-h-44 flex-col justify-between rounded-lg border bg-surface p-4 shadow-soft outline-none hover:-translate-y-0.5 hover:border-accent/70 hover:bg-surface-raised hover:shadow-lifted focus-visible:shadow-focus"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-md bg-accent-soft p-2 text-accent">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="rounded-full border bg-surface-raised px-2 py-0.5 text-caption font-medium text-muted">
          {action.label}
        </span>
      </div>

      <div className="mt-5">
        <h3 className="text-title font-semibold text-primary">{action.title}</h3>
        <p className="mt-2 text-body text-muted">{action.description}</p>
      </div>

      <span className="mt-4 inline-flex items-center gap-2 text-body font-semibold text-accent">
        {cta}
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}

// ========== Component ==========

export function HomePage() {
  // ========== Hooks ==========

  const { actions, cta, fallbackDescription, hero, hint, section } = useHomePage();
  const RoleIcon = hero.RoleIcon;

  // ========== Render ==========

  return (
    <section className="space-y-6">
      <div className="rounded-xl border bg-surface p-5 shadow-soft md:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <p className="text-caption font-semibold uppercase tracking-wide text-muted">
              {hero.greeting}
            </p>
            <h1 className="mt-2 text-heading font-semibold text-primary">{hero.title}</h1>
            <p className="mt-3 max-w-2xl text-body text-muted">{hero.subtitle}</p>
          </div>

          <div
            className={cn(
              'inline-flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-body font-semibold shadow-soft',
              hero.isAdmin ? 'bg-accent text-accent-contrast' : 'bg-surface-raised text-primary'
            )}
          >
            <RoleIcon className="h-4 w-4" aria-hidden="true" />
            {hero.roleLabel}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-title font-semibold text-primary">{section.title}</h2>
          <p className="mt-1 text-body text-muted">{section.description}</p>
        </div>

        {actions.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {actions.map(action => (
              <LinkCard key={action.key} action={action} cta={cta} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border bg-surface p-5 text-body text-muted shadow-soft">
            {fallbackDescription}
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-surface-raised px-4 py-3 text-body text-muted shadow-soft">
        {hint}
      </div>
    </section>
  );
}
