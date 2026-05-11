import { forwardRef } from "react";
import { cn } from "@/shared/lib/cn";

// ========== Types ==========

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

// ========== Constants ==========

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-contrast shadow-soft hover:bg-accent-hover",
  secondary:
    "border bg-surface text-primary shadow-soft hover:bg-surface-raised",
  ghost: "bg-transparent text-primary hover:bg-surface-raised",
  danger: "bg-danger text-accent-contrast shadow-soft hover:opacity-90",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1 text-caption",
  md: "px-4 py-2 text-body",
  lg: "px-5 py-3 text-body",
};

// ========== Component ==========

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, size = "md", type = "button", variant = "primary", ...props },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "ds-transition inline-flex items-center justify-center rounded-md font-medium outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = "Button";
