export const UKRAINIAN_PHONE_REGEX = /^\+380-\d{2}-\d{3}-\d{2}-\d{2}$/;

export type InputMask = 'ukrainian-phone';

export function formatUkrainianPhone(value: string): string {
  const digitsOnly = value.replace(/\D/g, '');

  if (!digitsOnly) {
    return '';
  }

  let localDigits = digitsOnly;

  if (localDigits.startsWith('380')) {
    localDigits = localDigits.slice(3);
  }

  if (localDigits.startsWith('0')) {
    localDigits = localDigits.slice(1);
  }

  localDigits = localDigits.slice(0, 9);

  if (!localDigits) {
    return '';
  }

  const parts = [
    localDigits.slice(0, 2),
    localDigits.slice(2, 5),
    localDigits.slice(5, 7),
    localDigits.slice(7, 9),
  ].filter(Boolean);

  return `+380-${parts.join('-')}`;
}
