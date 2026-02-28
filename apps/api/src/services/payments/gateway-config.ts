import { AppError } from '../../middleware/error.middleware.js';

const PLACEHOLDER_PATTERN = /^<[^>]+>$/;

function isConfiguredValue(value: string | undefined): boolean {
  const normalized = String(value ?? '').trim();
  if (!normalized) return false;
  if (PLACEHOLDER_PATTERN.test(normalized)) return false;
  return true;
}

export function assertGatewayConfigured(
  gatewayName: string,
  requiredValues: Record<string, string | undefined>,
) {
  const missing = Object.entries(requiredValues)
    .filter(([, value]) => !isConfiguredValue(value))
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new AppError(
      `${gatewayName} is not configured. Missing: ${missing.join(', ')}`,
      500,
      'PAYMENT_CONFIGURATION_ERROR',
    );
  }
}
