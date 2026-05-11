'use client';

import { CalendarDays } from 'lucide-react';
import { enUS, uk as ukLocale } from 'date-fns/locale';
import { useLocale } from 'next-intl';
import { useMemo, useState } from 'react';
import { DayPicker, type Matcher } from 'react-day-picker';
import { cn } from '@/shared/lib/cn';
import { Popover } from '@/shared/ui/popover';

// ========== Types ==========

type DatePickerProps = {
  value?: string | null;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
  id?: string;
  name?: string;
  error?: boolean;
  invalid?: boolean;
  className?: string;
};

// ========== Constants ==========

const triggerClasses =
  'ds-transition inline-flex w-full items-center justify-between gap-2 rounded-md border bg-surface-raised px-3 py-2 text-body text-primary outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-60';
const triggerInvalidClasses = '!border-danger focus-visible:!border-danger focus-visible:!shadow-focus-danger';

// ========== Helpers ==========

function parseIsoDate(value?: string | null): Date | null {
  if (!value) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
    return null;
  }

  return date;
}

function toIsoDate(date: Date): string {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());

  return `${day}.${month}.${year}`;
}

// ========== Component ==========

export function DatePicker({
  value,
  onChange,
  onBlur,
  placeholder,
  disabled,
  min,
  max,
  id,
  name,
  error,
  invalid,
  className,
}: DatePickerProps) {
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  const selectedDate = useMemo(() => parseIsoDate(value), [value]);
  const minDate = useMemo(() => parseIsoDate(min), [min]);
  const maxDate = useMemo(() => parseIsoDate(max), [max]);

  const disabledDays = useMemo<Matcher[] | undefined>(() => {
    const constraints: Matcher[] = [];

    if (minDate) {
      constraints.push({ before: minDate });
    }

    if (maxDate) {
      constraints.push({ after: maxDate });
    }

    return constraints.length > 0 ? constraints : undefined;
  }, [maxDate, minDate]);

  const defaultPlaceholder = locale === 'uk' ? 'Оберіть дату' : 'Select date';
  const displayValue = selectedDate ? formatDisplayDate(selectedDate) : placeholder || defaultPlaceholder;
  const hasError = Boolean(error || invalid);

  function handleOpenChange(open: boolean) {
    setIsOpen(open);

    if (!open) {
      onBlur?.();
    }
  }

  return (
    <div className={cn('w-full', className)}>
      <input id={id} name={name} type="hidden" value={value ?? ''} aria-invalid={hasError || undefined} readOnly />

      <Popover
        align="start"
        className="w-72.5 p-3 shadow-soft"
        open={isOpen}
        onOpenChange={handleOpenChange}
        trigger={
          <button
            type="button"
            className={cn(triggerClasses, !selectedDate && 'text-muted', hasError && triggerInvalidClasses)}
            disabled={disabled}
            data-invalid={hasError || undefined}
            aria-expanded={isOpen}
            aria-haspopup="dialog"
            onBlur={onBlur}
          >
            <span className="truncate">{displayValue}</span>
            <CalendarDays aria-hidden="true" className="h-4 w-4 text-muted" />
          </button>
        }
        content={
          <DayPicker
            mode="single"
            selected={selectedDate ?? undefined}
            onSelect={date => {
              if (!date) {
                return;
              }

              onChange(toIsoDate(date));
              setIsOpen(false);
            }}
            disabled={disabledDays}
            locale={locale === 'uk' ? ukLocale : enUS}
            showOutsideDays={false}
            defaultMonth={selectedDate ?? minDate ?? undefined}
            classNames={{
              root: 'relative w-full text-primary',
              months: 'flex',
              month: 'w-full space-y-3',
              month_caption: 'flex h-9 items-center justify-center px-12',
              caption_label: 'text-center text-sm font-semibold text-primary',

              nav: 'pointer-events-none absolute inset-x-0 top-0 z-10 flex h-9 items-center justify-between',
              button_previous:
                'pointer-events-auto ds-transition inline-flex h-8 w-8 items-center justify-center rounded-md border bg-surface text-primary outline-none hover:bg-surface-raised focus-visible:shadow-focus',
              button_next:
                'pointer-events-auto ds-transition inline-flex h-8 w-8 items-center justify-center rounded-md border bg-surface text-primary outline-none hover:bg-surface-raised focus-visible:shadow-focus',
              chevron: 'h-4 w-4',

              month_grid: 'w-full border-collapse',
              weekdays: 'grid grid-cols-7 pt-1',
              weekday: 'py-1 text-center text-xs font-medium text-muted',
              week: 'grid grid-cols-7',
              day: 'flex h-9 w-9 items-center justify-center p-0',
              day_button:
                'ds-transition inline-flex h-8 w-8 items-center justify-center rounded-md text-sm text-primary outline-none hover:bg-surface-raised focus-visible:shadow-focus',

              selected: '[&>button]:bg-accent [&>button]:text-accent-contrast [&>button]:hover:bg-accent',
              today: '[&>button]:border [&>button]:border-border',
              disabled: '[&>button]:cursor-not-allowed [&>button]:opacity-40',
            }}
          />
        }
      />
    </div>
  );
}
