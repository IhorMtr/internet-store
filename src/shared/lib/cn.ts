import { clsx, type ClassValue } from 'clsx';

// ===================== HELPERS =====================

export function cn(...classes: ClassValue[]) {
  return clsx(classes);
}
