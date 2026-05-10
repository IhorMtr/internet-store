import { forwardRef } from "react";
import { cn } from "@/shared/lib/cn";

// ===================== TYPES =====================

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

// ===================== COMPONENT =====================

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-24 w-full resize-y rounded-md border bg-surface-raised px-3 py-2 text-body text-primary outline-none placeholder:text-muted focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-danger",
        className,
      )}
      {...props}
    />
  ),
);

Textarea.displayName = "Textarea";
