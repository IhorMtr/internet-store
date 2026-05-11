'use client';

import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';

// ========== Types ==========

type ConfirmDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  confirmVariant?: 'primary' | 'danger';
  isConfirming?: boolean;
};

// ========== Constants ==========

const overlayClasses = 'fixed inset-0 z-overlay bg-black/50 backdrop-blur-sm';
const contentClasses =
  'fixed left-1/2 top-1/2 z-overlay w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-surface p-5 shadow-lifted';

// ========== Component ==========

export function ConfirmDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  confirmVariant = 'danger',
  isConfirming = false,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className={overlayClasses} />

        <AlertDialog.Content className={cn(contentClasses)}>
          <AlertDialog.Title className="text-lg font-semibold text-primary">{title}</AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-muted">{description}</AlertDialog.Description>

          <div className="mt-5 flex justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <Button type="button" variant="secondary" disabled={isConfirming}>
                {cancelLabel}
              </Button>
            </AlertDialog.Cancel>

            <AlertDialog.Action asChild>
              <Button
                type="button"
                variant={confirmVariant === 'danger' ? 'danger' : 'primary'}
                onClick={onConfirm}
                disabled={isConfirming}
              >
                {confirmLabel}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
