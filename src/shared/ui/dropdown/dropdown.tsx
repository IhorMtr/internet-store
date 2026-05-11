'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '@/shared/lib/cn';

// ========== Types ==========

type DropdownActionItem = {
  danger?: boolean;
  disabled?: boolean;
  label: React.ReactNode;
  onSelect?: () => void;
  type?: 'item';
};

type DropdownSeparatorItem = {
  type: 'separator';
};

export type DropdownItem = DropdownActionItem | DropdownSeparatorItem;

type DropdownProps = {
  align?: 'start' | 'center' | 'end';
  className?: string;
  items: DropdownItem[];
  trigger: React.ReactNode;
};

// ========== Component ==========

export function Dropdown({ align = 'end', className, items, trigger }: DropdownProps) {
  // ========== Render ==========

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          className={cn(
            'z-overlay min-w-44 rounded-md border bg-surface p-1 text-primary shadow-lifted outline-none',
            className
          )}
          sideOffset={8}
        >
          {items.map((item, index) => {
            if (item.type === 'separator') {
              return <DropdownMenu.Separator key={`separator-${index}`} className="my-1 h-px bg-border" />;
            }

            return (
              <DropdownMenu.Item
                key={index}
                disabled={item.disabled}
                onSelect={item.onSelect}
                className={cn(
                  'ds-transition cursor-default rounded-sm px-3 py-2 text-body outline-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-surface-raised',
                  item.danger && 'text-danger'
                )}
              >
                {item.label}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
