import { forwardRef } from 'react';
import { cn } from '@/shared/lib/cn';

// ========== Types ==========

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

type TextareaWithErrorProps = TextareaProps & {
  error?: boolean;
  invalid?: boolean;
};

// ========== Component ==========

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaWithErrorProps>(
  ({ className, error, invalid, ...props }, ref) => {
    const isInvalid = Boolean(error || invalid || props['aria-invalid'] === true || props['aria-invalid'] === 'true');

    return (
      <textarea
        ref={ref}
        aria-invalid={isInvalid || undefined}
        className={cn(
          'min-h-24 w-full resize-y rounded-md border bg-surface-raised px-3 py-2 text-body text-primary outline-none placeholder:text-muted focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-60',
          className,
          isInvalid && 'border-danger! focus-visible:border-danger! focus-visible:shadow-focus-danger!'
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
