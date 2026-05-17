'use client';

import { Upload, X } from 'lucide-react';
import { useCallback } from 'react';
import { useDropzone, type Accept, type FileRejection } from 'react-dropzone';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';

// ========== Types ==========

export type FileDropzoneProps = {
  value?: File | null;
  previewUrl?: string | null;
  accept?: Record<string, string[]>;
  maxSize?: number;
  disabled?: boolean;
  error?: string | boolean;
  title?: string;
  description?: string;
  selectedFileLabel?: string;
  removeLabel?: string;
  onChange: (file: File | null) => void;
  className?: string;
};

// ========== Constants ==========

const baseContainerClasses =
  'ds-transition rounded-md border border-border bg-surface-raised p-4 outline-none focus-visible:shadow-focus';
const activeContainerClasses = 'border-accent/60 bg-surface';
const disabledContainerClasses = 'cursor-not-allowed opacity-60';
const invalidContainerClasses = 'border-danger/60';

// ========== Helpers ==========

function toDropzoneAccept(accept?: Record<string, string[]>): Accept | undefined {
  if (!accept) {
    return undefined;
  }

  const entries = Object.entries(accept).filter(([key, value]) => key.trim().length > 0 && Array.isArray(value));

  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

function pickRejectedFile(rejections: FileRejection[]): File | null {
  const first = rejections[0];
  return first?.file ?? null;
}

// ========== Component ==========

export function FileDropzone({
  value,
  previewUrl,
  accept,
  maxSize,
  disabled,
  error,
  title,
  description,
  selectedFileLabel,
  removeLabel,
  onChange,
  className,
}: FileDropzoneProps) {
  const isInvalid = Boolean(error);

  const handleDropAccepted = useCallback(
    (files: File[]) => {
      onChange(files[0] ?? null);
    },
    [onChange]
  );

  const handleDropRejected = useCallback(
    (rejections: FileRejection[]) => {
      onChange(pickRejectedFile(rejections));
    },
    [onChange]
  );

  const { getInputProps, getRootProps, isDragActive, isDragReject, open } = useDropzone({
    accept: toDropzoneAccept(accept),
    disabled,
    maxFiles: 1,
    maxSize,
    multiple: false,
    noClick: true,
    onDropAccepted: handleDropAccepted,
    onDropRejected: handleDropRejected,
  });

  const currentPreviewUrl = previewUrl ?? null;
  const hasSelection = Boolean(value || currentPreviewUrl);

  return (
    <div className={cn('grid gap-3', className)}>
      <div
        {...getRootProps()}
        className={cn(
          baseContainerClasses,
          (isInvalid || isDragReject) && invalidContainerClasses,
          isDragActive && !isDragReject && activeContainerClasses,
          disabled && disabledContainerClasses
        )}
        aria-invalid={isInvalid || undefined}
      >
        <input {...getInputProps()} />

        <div className="grid gap-3">
          {currentPreviewUrl ? (
            <div
              className="h-44 w-full rounded-md border border-border bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${currentPreviewUrl})` }}
            />
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-surface text-muted">
              <Upload className="h-4 w-4" aria-hidden="true" />
            </span>

            <div className="grid min-w-0 gap-1">
              {title ? <p className="text-sm font-medium text-primary">{title}</p> : null}
              {description ? <p className="text-xs text-muted">{description}</p> : null}
              {value && selectedFileLabel ? (
                <p className="truncate text-xs text-primary">
                  {selectedFileLabel}: {value.name}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={open} disabled={disabled}>
              {title}
            </Button>

            {hasSelection && removeLabel ? (
              <Button type="button" variant="ghost" onClick={() => onChange(null)} disabled={disabled}>
                <X className="mr-1 h-4 w-4" aria-hidden="true" />
                {removeLabel}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
