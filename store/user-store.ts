import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SubscriptionTier = 'free' | 'starter' | 'advanced' | 'supreme'

interface User {
  uid: string
  name: string | null
  email: string | null
  photo: string | null
  dob: string | null
  tob: string | null
  pob: string | null
  rashi: string | null
  nakshatra: string | null
  subscription: SubscriptionTier
  subscriptionExpiry: Date | null
  onboarded: boolean
  // Consumable tickets (from Quick/Deep packs)
  tickets: number
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
  // Smart function to consume a credit
  consumeGuruCredit: () => void
  // Helper to check if user can chat
  canChat: () => boolean
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
            legacyTickets: undefined,
          }
        }
        // Ensure dailyUsage exists
        if (user && !user.dailyUsage) {
          user.dailyUsage = { count: 0, date: new Date().toISOString().split('T')[0] }
        }
        set({ user })
      },
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
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
      consumeGuruCredit: () =>
        set((state) => {
          if (!state.user) return {}

          const today = new Date().toISOString().split('T')[0]

          // 1. Priority: If Unlimited, do nothing (or just track stats)
          if (['advanced', 'supreme'].includes(state.user.subscription)) {
            return {}
          }

          // 2. Priority: Use Tickets (Quick/Deep packs)
          if (state.user.tickets > 0) {
            return { user: { ...state.user, tickets: state.user.tickets - 1 } }
          }

          // 3. Priority: Daily Quota (Starter)
          if (state.user.subscription === 'starter') {
            const isNewDay = state.user.dailyUsage?.date !== today
            const newCount = isNewDay ? 1 : (state.user.dailyUsage?.count || 0) + 1
            return {
              user: {
                ...state.user,
                dailyUsage: { count: newCount, date: today },
              },
            }
          }

          return {}
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

