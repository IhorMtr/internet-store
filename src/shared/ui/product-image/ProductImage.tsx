'use client';

import { ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/shared/lib/cn';

// ========== Types ==========

type ProductImageProps = {
  alt: string;
  className?: string;
  fallbackLabel?: string;
  imageClassName?: string;
  priority?: boolean;
  showFallbackText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  sizes?: string;
  src: string | null | undefined;
  variant?: 'thumbnail' | 'card' | 'details';
};

type ProductImageSize = NonNullable<ProductImageProps['size']>;
type ProductImageVariant = NonNullable<ProductImageProps['variant']>;

// ========== Constants ==========

const sizeClasses: Record<ProductImageSize, string> = {
  sm: 'h-12 w-12',
  md: 'h-16 w-16',
  lg: 'h-24 w-24',
};

const iconClasses: Record<ProductImageSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

const variantClasses: Record<ProductImageVariant, string> = {
  thumbnail: 'rounded-md border border-border/60 bg-surface-raised',
  card: 'rounded-md border border-border/60 bg-surface-raised',
  details: 'rounded-lg border border-border/60 bg-surface-raised',
};

// ========== Component ==========

export function ProductImage({
  alt,
  className,
  fallbackLabel,
  imageClassName,
  priority = false,
  showFallbackText = true,
  size,
  sizes = '100vw',
  src,
  variant = 'card',
}: ProductImageProps) {
  const [hasLoadError, setHasLoadError] = useState(false);
  const normalizedSrc = src?.trim() || null;
  const normalizedFallbackLabel = fallbackLabel?.trim() || '';
  const normalizedSize = size ?? (variant === 'thumbnail' ? 'sm' : 'md');
  const containerSizeClass = size ? sizeClasses[size] : variant === 'thumbnail' ? sizeClasses.sm : '';

  if (!normalizedSrc || hasLoadError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center overflow-hidden text-center text-muted',
          variantClasses[variant],
          containerSizeClass,
          className
        )}
      >
        <div className="grid justify-items-center gap-1 px-2 py-2">
          <ImageIcon aria-hidden="true" className={iconClasses[normalizedSize]} />
          {showFallbackText && normalizedFallbackLabel ? (
            <span className="text-xs leading-4">{normalizedFallbackLabel}</span>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', variantClasses[variant], containerSizeClass, className)}>
      <Image
        src={normalizedSrc}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn('object-cover', imageClassName)}
        onError={() => setHasLoadError(true)}
      />
    </div>
  );
}
