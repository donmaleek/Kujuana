export function humanize(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function toDateTimeInput(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function toIsoDate(dateInput: string): string {
  const parsed = new Date(`${dateInput}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Invalid date format. Use YYYY-MM-DD.');
  }
  return parsed.toISOString();
}

export function asArray(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function fromArray(values: string[] | undefined): string {
  return (values ?? []).join(', ');
}

export function formatCurrency(value: number, currency: 'KES' | 'USD'): string {
  const locale = currency === 'KES' ? 'en-KE' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}
