'use client';

import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

// ========== Types ==========

export type SelectOption = {
  disabled?: boolean;
  label: React.ReactNode;
  value: string;
};

type SelectProps = {
  className?: string;
  contentClassName?: string;
  defaultValue?: string;
  disabled?: boolean;
  error?: boolean;
  invalid?: boolean;
  name?: string;
  onBlur?: React.FocusEventHandler<HTMLButtonElement>;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  value?: string;
};

// ========== Constants ==========

const triggerClasses =
  'ds-transition inline-flex w-full items-center justify-between gap-2 rounded-md border bg-surface-raised px-3 py-2 text-body text-primary outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-60 data-placeholder:text-muted';
const triggerInvalidClasses = '!border-danger focus-visible:!border-danger focus-visible:!shadow-focus-danger';
const contentClasses =
  'z-overlay max-h-[var(--radix-select-content-available-height)] overflow-hidden rounded-md border bg-surface text-primary';
const viewportClasses = 'max-h-60 overflow-y-auto p-1';
const itemClasses =
  'ds-transition relative flex cursor-default select-none items-center rounded-sm py-2 pl-3 pr-8 text-body outline-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-surface-raised';

// ========== Helpers ==========

function renderSelectOption(option: SelectOption) {
  return (
    <SelectPrimitive.Item key={option.value} value={option.value} disabled={option.disabled} className={itemClasses}>
      <SelectPrimitive.ItemIndicator className="absolute right-2 inline-flex items-center">
        <Check aria-hidden="true" className="h-3.5 w-3.5" />
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

// ========== Component ==========

export function Select({
  className,
  contentClassName,
  defaultValue,
  disabled,
  error,
  invalid,
  name,
  onBlur,
  onValueChange,
  options,
  placeholder,
  value,
}: SelectProps) {
  const isInvalid = Boolean(error || invalid);

  // ========== Render ==========

  return (
    <SelectPrimitive.Root
      defaultValue={defaultValue}
      disabled={disabled}
      name={name}
      onValueChange={onValueChange}
      value={value}
    >
      <SelectPrimitive.Trigger
        className={cn(triggerClasses, className, isInvalid && triggerInvalidClasses)}
        aria-invalid={isInvalid || undefined}
        onBlur={onBlur}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <ChevronDown aria-hidden="true" className="h-4 w-4 text-muted" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className={cn(contentClasses, contentClassName)}
          position="popper"
          sideOffset={6}
          collisionPadding={8}
        >
          <SelectPrimitive.Viewport className={viewportClasses}>
            {options.map(renderSelectOption)}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
