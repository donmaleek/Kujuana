import type { UserRole } from '@kujuana/shared';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      rawBody?: string;
      user?: {
        userId: string;
        email: string;
        roles: UserRole[];
      };
    }
  }
}

export {};
