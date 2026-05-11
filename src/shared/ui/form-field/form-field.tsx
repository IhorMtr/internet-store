'use client';

import { cn } from '@/shared/lib/cn';

// ========== Types ==========

type FormFieldProps = {
  label?: React.ReactNode;
  children: React.ReactNode;
  error?: boolean | string;
  required?: boolean;
  showErrorText?: boolean;
  className?: string;
  labelClassName?: string;
  requiredMarkClassName?: string;
  errorClassName?: string;
};

// ========== Constants ==========

const wrapperClasses = 'grid content-start gap-1 text-sm';
const labelClasses = 'text-primary';
const requiredMarkClasses = 'ml-1 text-danger/80';
const errorClasses = 'text-xs text-danger';

// ========== Component ==========

export function FormField({
  label,
  children,
  error,
  required = false,
  showErrorText = false,
  className,
  labelClassName,
  requiredMarkClassName,
  errorClassName,
}: FormFieldProps) {
  const hasError = Boolean(error);
  const errorText = typeof error === 'string' ? error : '';

  return (
    <div className={cn(wrapperClasses, className)}>
      {label ? (
        <span className={cn(labelClasses, labelClassName)}>
          {label}
          {required ? (
            <span aria-hidden="true" className={cn(requiredMarkClasses, requiredMarkClassName)}>
              *
            </span>
          ) : null}
        </span>
      ) : null}
      {children}
      {showErrorText && hasError && errorText ? (
        <span className={cn(errorClasses, errorClassName)}>{errorText}</span>
      ) : null}
    </div>
  );
}
