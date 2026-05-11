'use client';

import { Check, ChevronDown, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { Input } from '@/shared/ui/input';
import { Popover } from '@/shared/ui/popover';

// ========== Types ==========

export type SearchSelectOption = {
  disabled?: boolean;
  label: string;
  value: string;
};

type SearchSelectProps = {
  value?: string | null;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: SearchSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  error?: boolean;
  invalid?: boolean;
  id?: string;
  name?: string;
  className?: string;
};

// ========== Constants ==========

const triggerClasses =
  'ds-transition inline-flex w-full items-center justify-between gap-2 rounded-md border bg-surface-raised px-3 py-2 text-body text-primary outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-60';
const triggerInvalidClasses = '!border-danger focus-visible:!border-danger focus-visible:!shadow-focus-danger';
const popoverClasses = 'w-[var(--radix-popover-trigger-width)] min-w-56 p-2 shadow-none';
const searchInputClasses = 'pl-10';
const optionsListClasses = 'max-h-60 overflow-y-auto rounded-md border border-border/70 bg-surface-raised p-1';
const optionClasses =
  'ds-transition flex w-full items-center justify-between gap-2 rounded-sm px-2 py-2 text-left text-body text-primary outline-none hover:bg-surface focus-visible:shadow-focus';

// ========== Helpers ==========

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase();
}

// ========== Component ==========

export function SearchSelect({
  value,
  onChange,
  onBlur,
  options,
  placeholder,
  searchPlaceholder,
  emptyText,
  disabled,
  error,
  invalid,
  id,
  name,
  className,
}: SearchSelectProps) {
  // ========== State ==========

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ========== Derived Data ==========

  const selectedOption = useMemo(() => options.find(option => option.value === value) ?? null, [options, value]);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(searchQuery);

    if (!normalizedQuery) {
      return options;
    }

    return options.filter(option => normalizeSearchValue(option.label).includes(normalizedQuery));
  }, [options, searchQuery]);

  const resolvedPlaceholder = placeholder ?? 'Select option';
  const resolvedSearchPlaceholder = searchPlaceholder ?? 'Search...';
  const resolvedEmptyText = emptyText ?? 'No options found.';
  const hasError = Boolean(error || invalid);

  // ========== Handlers ==========

  function handleOpenChange(open: boolean) {
    setIsOpen(open);

    if (!open) {
      setSearchQuery('');
      onBlur?.();
    }
  }

  function handleSelect(nextValue: string) {
    onChange(nextValue);
    setIsOpen(false);
    setSearchQuery('');
  }

  // ========== Render ==========

  return (
    <div className={cn('w-full', className)}>
      <input id={id} name={name} type="hidden" value={value ?? ''} aria-invalid={hasError || undefined} readOnly />

      <Popover
        align="start"
        className={popoverClasses}
        open={isOpen}
        onOpenChange={handleOpenChange}
        trigger={
          <button
            type="button"
            className={cn(triggerClasses, !selectedOption && 'text-muted', hasError && triggerInvalidClasses)}
            disabled={disabled}
            data-invalid={hasError || undefined}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            onBlur={onBlur}
          >
            <span className="truncate">{selectedOption?.label ?? resolvedPlaceholder}</span>
            <ChevronDown aria-hidden="true" className="h-4 w-4 text-muted" />
          </button>
        }
        content={
          <div className="grid gap-2">
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted"
              />

              <Input
                value={searchQuery}
                onChange={event => setSearchQuery(event.currentTarget.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                  }
                }}
                placeholder={resolvedSearchPlaceholder}
                className={searchInputClasses}
                disabled={disabled}
                autoFocus
              />
            </div>

            <ul role="listbox" className={optionsListClasses}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map(option => (
                  <li key={option.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={option.value === value}
                      className={cn(
                        optionClasses,
                        option.value === value && 'bg-surface',
                        option.disabled && 'pointer-events-none opacity-50'
                      )}
                      onClick={() => handleSelect(option.value)}
                      disabled={disabled || option.disabled}
                    >
                      <span className="truncate">{option.label}</span>
                      {option.value === value ? <Check aria-hidden="true" className="h-4 w-4 text-primary" /> : null}
                    </button>
                  </li>
                ))
              ) : (
                <li className="px-2 py-2 text-sm text-muted">{resolvedEmptyText}</li>
              )}
            </ul>
          </div>
        }
      />
    </div>
  );
}
