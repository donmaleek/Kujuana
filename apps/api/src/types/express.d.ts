import type { UserRole } from '@kujuana/shared';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        roles: UserRole[];
      };
    }
  }
}

export {};
