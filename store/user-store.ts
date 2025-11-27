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
}

interface UserState {
  user: User | null
  setUser: (user: User | null) => void
  updateUser: (updates: Partial<User>) => void
  clearUser: () => void
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
    }),
    {
      name: 'jyoti-user-storage',
    }
  )
)

