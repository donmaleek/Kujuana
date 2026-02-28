'use client'

import { createContext, useContext } from 'react'

export type Tier = 'standard' | 'priority' | 'vip'

export type DashUser = {
  id: string
  fullName: string
  email: string
  tier: Tier
  credits: number
  avatarPublicId: string | null
  profileCompleteness: number
  onboardingComplete: boolean
  isActive: boolean
}

export type DashCtxType = {
  user: DashUser | null
  loading: boolean
  refetch: () => Promise<void>
  signOut: () => Promise<void>
}

export const DashCtx = createContext<DashCtxType>({
  user: null,
  loading: true,
  refetch: async () => {},
  signOut: async () => {},
})

export const useDashUser = () => useContext(DashCtx)
