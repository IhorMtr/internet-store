"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/shared/lib/cn";

// ========== Types ==========

type PopoverProps = {
  align?: "start" | "center" | "end";
  className?: string;
  content: React.ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  side?: "top" | "right" | "bottom" | "left";
  trigger: React.ReactNode;
};

// ========== Component ==========

export function Popover({
  align = "center",
  className,
  content,
  defaultOpen,
  onOpenChange,
  open,
  side = "bottom",
  trigger,
}: PopoverProps) {
  // ========== Render ==========

  return (
    <PopoverPrimitive.Root
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      open={open}
    >
      <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align={align}
          className={cn(
            "z-overlay rounded-md border bg-surface p-3 text-primary shadow-lifted outline-none",
            className,
          )}
          side={side}
          sideOffset={8}
        >
          {content}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
