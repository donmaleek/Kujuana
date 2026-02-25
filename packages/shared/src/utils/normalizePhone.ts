/**
 * Normalize a phone number to E.164 format.
 * Handles common Kenyan patterns: 07xx, 01xx, +2547xx
 */
export function normalizePhone(raw: string, defaultCountryCode = '254'): string {
  const digits = raw.replace(/\D/g, '');

  if (digits.startsWith('0') && digits.length === 10) {
    return `+${defaultCountryCode}${digits.slice(1)}`;
  }
  if (digits.startsWith('254') && digits.length === 12) {
    return `+${digits}`;
  }
  if (raw.startsWith('+')) {
    return raw;
  }
  return `+${digits}`;
}

export function isValidE164(phone: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(phone);
}
