import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  nullableAstrologyDisplay,
  nullableNakshatraDisplay,
} from '@/lib/astrology/display-formatters'

export type SubscriptionTier = 'free' | 'starter' | 'advanced' | 'supreme'

export interface User {
  uid: string
  name: string | null
  email: string | null
  photo: string | null
  dob: string | null
  tob: string | null
  pob: string | null
  lat?: number
  lng?: number
  timezone?: string
  rashi: string | null
  rashiPreferred?: 'moon' | 'sun' | 'ascendant'
  rashiMoon?: string
  rashiSun?: string
  ascendant?: string
  nakshatra: string | null
  subscription: SubscriptionTier
  subscriptionExpiry: Date | null
  onboarded: boolean
  settings?: {
    notifications: boolean
    emailUpdates: boolean
    soundEnabled: boolean
  }
  derivedAstrologyStatus?: 'current' | 'stale'
  // Consumable tickets (from Quick/Deep packs)
  tickets: number
  aiGuruTickets: number
  kundaliTickets: number
  lifetimePredictions: number
  // Daily usage tracking (for Starter plan)
  dailyUsage: {
    count: number
    date: string // YYYY-MM-DD
  }
  // Legacy tickets structure (for backward compatibility)
  legacyTickets?: {
    ai_questions?: number
    kundali_basic?: number
  }
}

interface UserState {
  user: User | null
  setUser: (user: User | null) => void
  updateUser: (updates: Partial<User>) => void
  clearUser: () => void
  decrementLocalTicket: (type: 'ai_questions' | 'kundali_basic') => void
  // Helper to check if user can chat
  canChat: () => boolean
}

function normalizeClientUser(user: User): User {
  return {
    ...user,
    rashi: nullableAstrologyDisplay(user.rashi),
    rashiMoon: nullableAstrologyDisplay(user.rashiMoon) || undefined,
    rashiSun: nullableAstrologyDisplay(user.rashiSun) || undefined,
    ascendant: nullableAstrologyDisplay(user.ascendant) || undefined,
    nakshatra: nullableNakshatraDisplay(user.nakshatra),
  }
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => {
        // Migrate legacy tickets structure if needed
        if (user && user.legacyTickets) {
          const migratedTickets = (user.legacyTickets.ai_questions || 0) + (user.tickets || 0)
          user = {
            ...user,
            tickets: migratedTickets,
            aiGuruTickets: user.aiGuruTickets ?? migratedTickets,
            kundaliTickets: user.kundaliTickets ?? 0,
            lifetimePredictions: user.lifetimePredictions ?? 0,
            legacyTickets: undefined,
          }
        }
        if (user) {
          user.aiGuruTickets = user.aiGuruTickets ?? user.tickets ?? 0
          user.kundaliTickets = user.kundaliTickets ?? 0
          user.lifetimePredictions = user.lifetimePredictions ?? 0
          user.tickets = user.tickets ?? user.aiGuruTickets ?? 0
        }
        // Ensure dailyUsage exists
        if (user && !user.dailyUsage) {
          user.dailyUsage = { count: 0, date: new Date().toISOString().split('T')[0] }
        }
        if (user) {
          user = normalizeClientUser(user)
        }
        set({ user })
      },
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? normalizeClientUser({ ...state.user, ...updates }) : null,
        })),
      clearUser: () => set({ user: null }),
      decrementLocalTicket: (type) =>
        set((state) => {
          if (!state.user) return state
          const currentTickets = state.user.legacyTickets || {}
          return {
            ...state,
            user: {
              ...state.user,
              legacyTickets: {
                ...currentTickets,
                [type]: Math.max((currentTickets[type] || 0) - 1, 0),
              },
            },
          }
        }),
      canChat: () => {
        const { user } = get()
        if (!user) return false

        // Unlimited Plans
        if (['advanced', 'supreme'].includes(user.subscription)) return true

        // Has Tickets
        if (user.tickets > 0) return true

        // Starter Plan Daily Limit (5/day)
        if (user.subscription === 'starter') {
          const today = new Date().toISOString().split('T')[0]
          const isNewDay = user.dailyUsage?.date !== today
          const currentCount = isNewDay ? 0 : user.dailyUsage?.count || 0
          return currentCount < 5
        }

        return false
      },
    }),
    {
      name: 'jyoti-user-storage',
    }
  )
)
