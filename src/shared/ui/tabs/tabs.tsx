'use client';

import { cn } from '@/shared/lib/cn';

// ========== Types ==========

export type TabsOption<TValue extends string = string> = {
  label: React.ReactNode;
  value: TValue;
};

type TabsProps<TValue extends string = string> = {
  className?: string;
  onValueChange: (value: TValue) => void;
  options: Array<TabsOption<TValue>>;
  value: TValue;
};

// ========== Constants ==========

const listClasses = 'inline-flex flex-wrap gap-1 rounded-md border bg-surface-raised p-1';
const triggerClasses =
  'ds-transition inline-flex min-h-9 items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium text-muted outline-none hover:bg-surface hover:text-primary focus-visible:shadow-focus';
const activeTriggerClasses = 'bg-surface text-primary shadow-soft';

// ========== Component ==========

export function Tabs<TValue extends string = string>({ className, onValueChange, options, value }: TabsProps<TValue>) {
  return (
    <div className={cn(listClasses, className)} role="tablist">
      {options.map(option => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={cn(triggerClasses, isActive && activeTriggerClasses)}
            onClick={() => onValueChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
