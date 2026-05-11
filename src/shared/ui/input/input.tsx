'use client';

import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { formatUkrainianPhone, type InputMask } from '@/shared/lib/ukrainian-phone';

// ========== Types ==========

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  mask?: InputMask;
  error?: boolean;
  invalid?: boolean;
};

// ========== Constants ==========

const inputClasses =
  'w-full rounded-md border bg-surface-raised px-3 py-2 text-body text-primary outline-none placeholder:text-muted focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-60';
const inputInvalidClasses = '!border-danger focus-visible:!border-danger focus-visible:!shadow-focus-danger';

// ========== Component ==========

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, disabled, error, invalid, mask, onChange, type = 'text', ...props }, ref) => {
    // ========== State ==========

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    // ========== Derived Data ==========

    const isPassword = type === 'password';
    const inputType = isPassword && isPasswordVisible ? 'text' : type;
    const isInvalid = Boolean(error || invalid || props['aria-invalid'] === true || props['aria-invalid'] === 'true');

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = event => {
      if (mask === 'ukrainian-phone') {
        event.currentTarget.value = formatUkrainianPhone(event.currentTarget.value);
      }

      onChange?.(event);
    };

    // ========== Render ==========

    if (!isPassword) {
      return (
        <input
          ref={ref}
          type={inputType}
          disabled={disabled}
          aria-invalid={isInvalid || undefined}
          className={cn(inputClasses, className, isInvalid && inputInvalidClasses)}
          onChange={handleChange}
          {...props}
        />
      );
    }

    return (
      <div className="relative">
        <input
          ref={ref}
          type={inputType}
          disabled={disabled}
          aria-invalid={isInvalid || undefined}
          className={cn(inputClasses, 'pr-10', className, isInvalid && inputInvalidClasses)}
          onChange={handleChange}
          {...props}
        />
        <button
          type="button"
          aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
          className="ds-transition absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-sm p-1 text-muted hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => setIsPasswordVisible(value => !value)}
          disabled={disabled}
        >
          {isPasswordVisible ? (
            <EyeOff aria-hidden="true" className="h-4 w-4" />
          ) : (
            <Eye aria-hidden="true" className="h-4 w-4" />
          )}
        </button>
      </div>
    );
  }
);

Input.displayName = 'Input';
