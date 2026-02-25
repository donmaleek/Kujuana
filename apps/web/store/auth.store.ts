'use client';

import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  userId: string | null;
  setAuth: (accessToken: string, userId: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  userId: null,
  setAuth: (accessToken, userId) => set({ accessToken, userId }),
  clearAuth: () => set({ accessToken: null, userId: null }),
}));
