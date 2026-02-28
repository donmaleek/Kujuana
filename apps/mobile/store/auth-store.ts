import { create } from 'zustand';
import type { ProfileMe } from '@/lib/api/types';

export type AuthStatus = 'bootstrapping' | 'signed_out' | 'signed_in';
export type SessionRole = 'admin' | 'manager' | 'matchmaker' | 'user';

interface AuthState {
  status: AuthStatus;
  accessToken: string | null;
  userId: string | null;
  role: SessionRole;
  deviceId: string | null;
  profile: ProfileMe | null;
  profileLoading: boolean;
  setDeviceId: (deviceId: string) => void;
  setSignedIn: (accessToken: string, userId: string, role?: SessionRole) => void;
  setRole: (role: SessionRole) => void;
  setSignedOut: () => void;
  setProfile: (profile: ProfileMe | null) => void;
  setProfileLoading: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'bootstrapping',
  accessToken: null,
  userId: null,
  role: 'user',
  deviceId: null,
  profile: null,
  profileLoading: false,
  setDeviceId: (deviceId) => set({ deviceId }),
  setSignedIn: (accessToken, userId, role = 'user') => set({ status: 'signed_in', accessToken, userId, role }),
  setRole: (role) => set({ role }),
  setSignedOut: () =>
    set({
      status: 'signed_out',
      accessToken: null,
      userId: null,
      role: 'user',
      profile: null,
      profileLoading: false,
    }),
  setProfile: (profile) => set({ profile }),
  setProfileLoading: (value) => set({ profileLoading: value }),
}));
