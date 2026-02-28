'use client'

import { create } from 'zustand'
import { useAuthStore, Tier } from './auth.store'
import { buildApiUrl } from '../lib/api-base'

export type Profile = {
  userId: string
  fullName: string
  gender?: 'male' | 'female'
  dob?: string
  location?: { country?: string; city?: string }
  tier: Tier
  credits: number

  photos: { publicId: string }[]
  relationshipGoal?: string
  values?: string[]
  lifestyle?: Record<string, any>
  preferences?: Record<string, any>

  completeness: number // 0..100
  isActive: boolean
}

type ProfileState = {
  profile: Profile | null
  loading: boolean
  error: string | null

  setProfile: (p: Profile | null) => void
  patchProfile: (patch: Partial<Profile>) => void
  clear: () => void

  fetchMe: () => Promise<Profile>
  updateMe: (patch: Partial<Profile>) => Promise<Profile>
}

function getAuthHeader() {
  const token = useAuthStore.getState().accessToken
  return token ? `Bearer ${token}` : null
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers ?? {})
  headers.set('Content-Type', 'application/json')
  const authHeader = getAuthHeader()
  if (authHeader) headers.set('Authorization', authHeader)

  const res = await fetch(buildApiUrl(path), {
    ...init,
    headers,
    credentials: 'include',
  })
  const json = await res.json().catch(() => null)
  if (!res.ok) {
    const msg =
      (typeof json?.error === 'string' ? json.error : json?.error?.message) ||
      json?.message ||
      `Request failed (${res.status})`
    throw new Error(msg)
  }
  return json as T
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  loading: false,
  error: null,

  setProfile: (p) => set({ profile: p }),
  patchProfile: (patch) => {
    const p = get().profile
    if (!p) return
    set({ profile: { ...p, ...patch } })
  },
  clear: () => set({ profile: null, loading: false, error: null }),

  fetchMe: async () => {
    set({ loading: true, error: null })
    try {
      const p = await apiFetch<Profile>('/profile/me')
      set({ profile: p, loading: false })
      // keep auth store in sync
      useAuthStore.getState().updateUser({
        tier: p.tier,
        credits: p.credits,
        profileCompleted: p.completeness >= 90,
      })
      return p
    } catch (e: any) {
      set({ error: e?.message || 'Failed to fetch profile', loading: false })
      throw e
    }
  },

  updateMe: async (patch) => {
    set({ loading: true, error: null })
    try {
      const p = await apiFetch<Profile>('/profile/me', {
        method: 'PUT',
        body: JSON.stringify(patch),
      })
      set({ profile: p, loading: false })
      useAuthStore.getState().updateUser({
        tier: p.tier,
        credits: p.credits,
        profileCompleted: p.completeness >= 90,
      })
      return p
    } catch (e: any) {
      set({ error: e?.message || 'Failed to update profile', loading: false })
      throw e
    }
  },
}))
