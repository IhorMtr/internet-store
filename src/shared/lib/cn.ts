import { clsx, type ClassValue } from 'clsx';

// ========== Helpers ==========

export function cn(...classes: ClassValue[]) {
  return clsx(classes);
}
