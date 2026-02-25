export { normalizePhone, isValidE164 } from '@kujuana/shared';

export function normalizeCountry(country: string): string {
  return country.trim().toUpperCase();
}
