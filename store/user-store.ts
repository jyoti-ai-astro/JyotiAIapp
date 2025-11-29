import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  subscription: 'free' | 'pro'
  subscriptionExpiry: Date | null
  onboarded: boolean
  tickets?: {
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
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      clearUser: () => set({ user: null }),
      decrementLocalTicket: (type) =>
        set((state) => {
          if (!state.user) return state
          const currentTickets = state.user.tickets || {}
          return {
            ...state,
            user: {
              ...state.user,
              tickets: {
                ...currentTickets,
                [type]: Math.max((currentTickets[type] || 0) - 1, 0),
              },
            },
          }
        }),
    }),
    {
      name: 'jyoti-user-storage',
    }
  )
)

