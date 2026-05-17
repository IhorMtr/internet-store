// ===================== Helpers =====================

export function toNumber(value: number | string): number {
  return typeof value === 'number' ? value : Number(value);
}

export function toNullableNumber(value: number | string | null): number | null {
  return value === null ? null : toNumber(value);
}

export function toDateString(value: Date | string): string {
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  return value.slice(0, 10);
}

export function toNullableDateString(value: Date | string | null): string | null {
  return value === null ? null : toDateString(value);
}
