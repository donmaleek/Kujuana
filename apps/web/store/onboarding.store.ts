'use client'

import { create } from 'zustand'
import { useAuthStore } from './auth.store'
import { buildApiUrl } from '../lib/api-base'

export type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6

export type OnboardingPayload = {
  // Step 1: plan
  plan?: 'standard' | 'priority' | 'vip'

  // Step 2: basic details
  basic?: {
    gender?: 'male' | 'female'
    dob?: string // ISO date
    country?: string
    city?: string
  }

  // Step 3: background & lifestyle
  lifestyle?: {
    occupation?: string
    education?: string
    faith?: string
    habits?: string[]
    interests?: string[]
  }

  // Step 4: photos
  photos?: {
    publicIds?: string[] // up to 3
  }

  // Step 5: relationship vision
  vision?: {
    relationshipGoal?: 'marriage' | 'serious' | 'courting' | 'companionship'
    lifeVision?: string
    idealPartnerDescription?: string
    values?: string[]
  }

  // Step 6: preferences
  preferences?: {
    ageMin?: number
    ageMax?: number
    countries?: string[]
    faith?: string | null
    dealBreakers?: string[]
  }
}

type OnboardingState = {
  currentStep: OnboardingStep
  loading: boolean
  error: string | null
  data: OnboardingPayload

  setStep: (s: OnboardingStep) => void
  mergeData: (patch: Partial<OnboardingPayload>) => void
  reset: () => void

  // API calls
  loadProgress: () => Promise<void>
  saveStep: (step: OnboardingStep, payload: Partial<OnboardingPayload>) => Promise<void>
  submit: () => Promise<void>
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
    credentials: 'include', // supports httpOnly-cookie refresh flows
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

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  currentStep: 1,
  loading: false,
  error: null,
  data: {},

  setStep: (s) => set({ currentStep: s }),
  mergeData: (patch) => set({ data: { ...get().data, ...patch } }),
  reset: () => set({ currentStep: 1, loading: false, error: null, data: {} }),

  loadProgress: async () => {
    set({ loading: true, error: null })
    try {
      const out = await apiFetch<{
        currentStep: OnboardingStep
        data: OnboardingPayload
      }>('/onboarding/progress')

      set({ currentStep: out.currentStep, data: out.data, loading: false })
    } catch (e: any) {
      set({ error: e?.message || 'Failed to load onboarding progress', loading: false })
    }
  },

  saveStep: async (step, payload) => {
    set({ loading: true, error: null })
    try {
      // optimistic merge
      set({ data: { ...get().data, ...payload } })

      await apiFetch(`/onboarding/step/${step}`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      // advance
      const next = Math.min(6, (step + 1) as number) as OnboardingStep
      set({ currentStep: next, loading: false })
    } catch (e: any) {
      set({ error: e?.message || 'Failed to save step', loading: false })
      throw e
    }
  },

  submit: async () => {
    set({ loading: true, error: null })
    try {
      await apiFetch('/onboarding/submit', { method: 'POST', body: JSON.stringify(get().data) })

      // Mark profile completed in auth store too
      useAuthStore.getState().updateUser({ profileCompleted: true })

      set({ loading: false })
    } catch (e: any) {
      set({ error: e?.message || 'Failed to submit onboarding', loading: false })
      throw e
    }
  },
}))
