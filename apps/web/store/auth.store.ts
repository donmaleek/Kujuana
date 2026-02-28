'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type Role = 'user' | 'matchmaker' | 'manager' | 'admin'
export type Tier = 'standard' | 'priority' | 'vip'

export type AuthUser = {
  id: string
  email: string
  fullName: string
  role: Role
  tier: Tier
  credits: number
  profileCompleted: boolean
}

type AuthState = {
  user: AuthUser | null
  // Access token should be treated as short-lived and ideally stored as httpOnly cookie.
  // We keep it in memory for API calls in the browser when cookie-mode isn't used.
  accessToken: string | null
  hydrated: boolean

  setHydrated: (v: boolean) => void
  setSession: (args: { user: AuthUser; accessToken?: string | null }) => void
  updateUser: (patch: Partial<AuthUser>) => void
  setAccessToken: (t: string | null) => void
  clearSession: () => void

  // helpers
  isAuthed: () => boolean
  hasRole: (roles: Role[]) => boolean
}

const STORAGE_KEY = 'kujuana_web_auth_v1'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      hydrated: false,

      setHydrated: (v) => set({ hydrated: v }),

      setSession: ({ user, accessToken }) =>
        set({
          user,
          accessToken: accessToken ?? get().accessToken,
        }),

      updateUser: (patch) => {
        const u = get().user
        if (!u) return
        set({ user: { ...u, ...patch } })
      },

      setAccessToken: (t) => set({ accessToken: t }),

      clearSession: () =>
        set({
          user: null,
          accessToken: null,
        }),

      isAuthed: () => Boolean(get().user),

      hasRole: (roles) => {
        const u = get().user
        if (!u) return false
        return roles.includes(u.role)
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Persist user only (never persist access token by default)
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
      version: 1,
    }
  )
)

/**
 * Cookie names used by middleware (optional but recommended).
 * Your API/web auth can set these at login:
 *  - kp_at: access token (short-lived) OR a session marker
 *  - kp_role: user role
 *  - kp_pc: "1" if profile completed
 *
 * Middleware uses these for route gating without DB calls.
 */
export const AUTH_COOKIES = {
  access: 'kp_at',
  role: 'kp_role',
  profileCompleted: 'kp_pc',
} as const
