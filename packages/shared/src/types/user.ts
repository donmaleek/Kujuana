export interface IUser {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
  roles: UserRole[];
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isSuspended: boolean;
  suspensionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'member' | 'admin' | 'matchmaker';

export interface IUserPublic {
  _id: string;
  fullName: string;
}
