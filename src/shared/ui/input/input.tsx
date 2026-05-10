"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/shared/lib/cn";

// ===================== TYPES =====================

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

// ===================== CONSTANTS =====================

const inputClasses =
  "w-full rounded-md border bg-surface-raised px-3 py-2 text-body text-primary outline-none placeholder:text-muted focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-danger";

// ===================== COMPONENT =====================

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, disabled, type = "text", ...props }, ref) => {
    // ===================== STATE =====================

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    // ===================== DERIVED VALUES =====================

    const isPassword = type === "password";
    const inputType = isPassword && isPasswordVisible ? "text" : type;

    // ===================== RENDER =====================

    if (!isPassword) {
      return (
        <input
          ref={ref}
          type={inputType}
          disabled={disabled}
          className={cn(inputClasses, className)}
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
          className={cn(inputClasses, "pr-10", className)}
          {...props}
        />
        <button
          type="button"
          aria-label={isPasswordVisible ? "Hide password" : "Show password"}
          className="ds-transition absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-sm p-1 text-muted hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => setIsPasswordVisible((value) => !value)}
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
  },
);

Input.displayName = "Input";
